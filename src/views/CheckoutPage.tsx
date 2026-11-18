'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { css } from '../data/style';
import { useI18n } from '../i18n/LocaleProvider';
import { itemName, itemOptions } from '../lib/cartItem';
import { isThaiPhone, normalizePhone } from '../lib/phone';
import { provinceOptions } from '../lib/provinces';
import { loadCustomer, saveCustomer, type SavedCustomer } from '../lib/savedCustomer';
import { checkDiscountCode, confirmCustomerChange, findReturningCustomer, placeOrder } from '../server/actions/shop';
import { discountFor, discountLabel, type DiscountRule } from '../lib/discount';
import './CheckoutPage.css';

type Form = SavedCustomer & { note: string };
const EMPTY: Form = { name: '', phone: '', email: '', street: '', subdistrict: '', district: '', province: 'กรุงเทพมหานคร', postcode: '', note: '' };

/**
 * Returning-customer state, driven by email + phone:
 * match → address filled · phoneChanged / emailChanged → ask for the old value · verified → address filled, contact will update
 */
type Lookup =
  | { s: 'idle' | 'checking' | 'new' | 'limited' }
  | { s: 'match'; name: string }
  | { s: 'phoneChanged' | 'emailChanged'; old: string; wrong?: boolean; busy?: boolean }
  | { s: 'verifiedPhone'; oldPhone: string }
  | { s: 'verifiedEmail'; oldEmail: string };

const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const validPhone = isThaiPhone;

export function CheckoutPage() {
  const { lang, t } = useI18n();
  const c = t.checkout;
  const { items, loaded, count, subtotal, kg, shipping, total, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [remember, setRemember] = useState(true);
  const [fromDevice, setFromDevice] = useState<string | null>(null);
  const [lookup, setLookup] = useState<Lookup>({ s: 'idle' });
  const lastPair = useRef('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const empty = items.length === 0;
  // Discount code: the server checks it; the amount is recomputed here as the cart changes and again on the server at checkout.
  const [codeInput, setCodeInput] = useState('');
  const [rule, setRule] = useState<DiscountRule | null>(null);
  const [codeError, setCodeError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);
  const discount = rule ? discountFor(rule, subtotal) : 0;
  const due = total - discount;
  const cartLines = () => items.map(({ slug, qty, size, color, magnets, custom }) => ({ slug, qty, size, color, magnets, custom }));
  const applyCode = async () => {
    if (!codeInput.trim() || checkingCode) return;
    setCheckingCode(true);
    setCodeError('');
    const res = await checkDiscountCode(codeInput, cartLines()).catch(() => ({ ok: false as const, error: 'codeInvalid' as const }));
    setCheckingCode(false);
    if (res.ok) { setRule(res.rule); setCodeInput(''); }
    else { setRule(null); setCodeError(t.errors[res.error]); }
  };

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const fillAddress = (a: Partial<Form>) => setForm((f) => ({ ...f, ...a }));

  // Details remembered on this device (localStorage is browser-only, so load after mount).
  useEffect(() => {
    const saved = loadCustomer();
    if (saved) {
      setForm((f) => ({ ...f, ...saved }));
      setFromDevice(saved.name);
    }
  }, []);

  // When email + phone are both filled in, check whether this is a returning customer.
  useEffect(() => {
    const pair = `${form.email.trim().toLowerCase()}|${normalizePhone(form.phone)}`;
    if (!validEmail(form.email) || !validPhone(form.phone)) {
      lastPair.current = '';
      setLookup({ s: 'idle' });
      return;
    }
    if (pair === lastPair.current) return;
    const timer = setTimeout(async () => {
      lastPair.current = pair;
      setLookup({ s: 'checking' });
      const res = await findReturningCustomer(form.email, form.phone).catch(() => ({ status: 'new' as const }));
      if (lastPair.current !== pair) return; // contact changed while checking
      if (res.status === 'match') {
        fillAddress(res.address);
        setLookup({ s: 'match', name: res.address.name });
      } else if (res.status === 'phoneChanged' || res.status === 'emailChanged') {
        setLookup({ s: res.status, old: '' });
      } else {
        setLookup({ s: res.status });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.email, form.phone]);

  // Only once the saved cart has loaded: on a reload the cart is briefly empty.
  useEffect(() => {
    if (loaded && empty && !placing) router.replace('/cart');
  }, [loaded, empty, placing, router]);

  if (empty) return null;

  const confirmChange = async () => {
    if (lookup.s !== 'phoneChanged' && lookup.s !== 'emailChanged') return;
    const old = lookup.s === 'phoneChanged' ? { phone: lookup.old } : { email: lookup.old };
    setLookup({ ...lookup, busy: true, wrong: false });
    const res = await confirmCustomerChange(form.email, form.phone, old).catch(() => ({ ok: false as const }));
    if (res.ok) {
      fillAddress(res.address);
      setLookup(old.phone ? { s: 'verifiedPhone', oldPhone: old.phone } : { s: 'verifiedEmail', oldEmail: old.email! });
    } else if ('limited' in res && res.limited) {
      setLookup({ s: 'limited' });
    } else {
      setLookup({ ...lookup, busy: false, wrong: true });
    }
  };

  const forgetDevice = () => {
    saveCustomer(null);
    setFromDevice(null);
    setForm(EMPTY);
    lastPair.current = '';
    setLookup({ s: 'idle' });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as Form;
    const { note, ...customer } = f;
    saveCustomer(remember ? customer : null);
    setPlacing(true);
    setError('');
    try {
      const res = await placeOrder({
        ...customer,
        note,
        oldPhone: lookup.s === 'verifiedPhone' ? lookup.oldPhone : undefined,
        oldEmail: lookup.s === 'verifiedEmail' ? lookup.oldEmail : undefined,
        lines: cartLines(),
        discountCode: rule?.code,
      });
      if (!res.ok) {
        setError(t.errors[res.error]);
        setPlacing(false);
        return;
      }
      router.push(`/order-placed?id=${encodeURIComponent(res.id)}&k=${res.key}`);
      clear();
    } catch {
      setError(t.errors.orderFailed);
      setPlacing(false);
    }
  };

  const input = (k: keyof Form, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input className="input" name={k} value={form[k]} onChange={(e) => set(k, e.target.value)} {...props} />
  );

  const changed = lookup.s === 'phoneChanged' || lookup.s === 'emailChanged' ? lookup : null;

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ paddingTop: 20, paddingBottom: 80 }}>
        <p className="small" style={{ marginBottom: 8 }}><Link href="/cart">← {c.backToCart}</Link></p>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 8vw, 56px)', lineHeight: 1.1, letterSpacing: 0 }}>{c.title}</h1>
        <ol aria-label={c.stepsAria} className="checkout-steps">
          {c.steps.map((s, i) => (
            <li key={s} data-done={i < 2} aria-current={i === 1 ? 'step' : undefined}>
              <span />
              {i + 1} {s}
            </li>
          ))}
        </ol>

        <form id="checkout" className="split" style={{ marginTop: 28 }} onSubmit={submit}>
          <div className="split__main stack" style={css({ '--gap': '32px' })}>
            <section>
              <h2 className="num-display" style={{ fontWeight: 400, fontSize: 24 }}>{c.contact}</h2>
              <p className="small" style={{ marginTop: 4 }}>{c.contactHint}</p>
              {fromDevice && lookup.s !== 'match' && (
                <p className="checkout-note checkout-note--ok">
                  {c.welcomeBack(fromDevice)}{' '}
                  <button type="button" className="text-btn text-btn--link checkout-note__link" onClick={forgetDevice}>{c.notYou}</button>
                </p>
              )}
              <div className="auto-grid" style={css({ '--min': '240px', '--gap': '14px', marginTop: 16 })}>
                <label className="field">
                  {c.email}
                  <span className="field__hint">{c.emailHint}</span>
                  {input('email', { type: 'email', autoComplete: 'email', required: true })}
                </label>
                <label className="field">
                  {c.phone}
                  <span className="field__hint">{c.phoneHint}</span>
                  {input('phone', { type: 'tel', autoComplete: 'tel', required: true })}
                </label>
              </div>

              <div aria-live="polite">
                {lookup.s === 'checking' && <p className="small" style={{ marginTop: 10 }}>{c.checking}</p>}
                {lookup.s === 'match' && (
                  <p className="checkout-note checkout-note--ok">
                    {c.found(lookup.name)}{' '}
                    {fromDevice && <button type="button" className="text-btn text-btn--link checkout-note__link" onClick={forgetDevice}>{c.notYou}</button>}
                  </p>
                )}
                {lookup.s === 'verifiedPhone' && <p className="checkout-note checkout-note--ok">{c.verifiedPhone}</p>}
                {lookup.s === 'verifiedEmail' && <p className="checkout-note checkout-note--ok">{c.verifiedEmail}</p>}
                {lookup.s === 'limited' && <p className="checkout-note checkout-note--warn">{c.limited}</p>}
                {changed && (
                  <div className="checkout-note checkout-note--ask">
                    <p className="strong">{changed.s === 'phoneChanged' ? c.phoneChangedTitle : c.emailChangedTitle}</p>
                    <p style={{ marginTop: 4 }}>{changed.s === 'phoneChanged' ? c.phoneChangedBody : c.emailChangedBody}</p>
                    <div className="checkout-verify">
                      <label className="field" style={{ flex: '1 1 200px' }}>
                        {changed.s === 'phoneChanged' ? c.oldPhone : c.oldEmail}
                        <input
                          className="input"
                          type={changed.s === 'phoneChanged' ? 'tel' : 'email'}
                          value={changed.old}
                          onChange={(e) => setLookup({ ...changed, old: e.target.value, wrong: false })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              confirmChange();
                            }
                          }}
                        />
                      </label>
                      <button type="button" className="btn btn--primary btn--square" style={{ height: 50 }} disabled={!changed.old.trim() || changed.busy} onClick={confirmChange}>
                        {changed.busy ? c.checking : c.confirmChange}
                      </button>
                    </div>
                    {changed.wrong && <p role="alert" style={{ marginTop: 8, color: '#8e1f0b' }}>{c.wrongOld}</p>}
                    <button type="button" className="text-btn" style={{ marginTop: 4 }} onClick={() => setLookup({ s: 'new' })}>{c.notChanged}</button>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="num-display" style={{ fontWeight: 400, fontSize: 24 }}>{c.address}</h2>
              <div className="auto-grid" style={css({ '--min': '240px', '--gap': '14px', marginTop: 16 })}>
                <label className="field span-all">{c.fullName}{input('name', { type: 'text', autoComplete: 'name', required: true })}</label>
                <label className="field span-all">{c.street}
                  <textarea className="input" name="street" rows={2} autoComplete="street-address" required value={form.street} onChange={(e) => set('street', e.target.value)} />
                </label>
                <label className="field">{c.subdistrict}{input('subdistrict', { type: 'text', required: true })}</label>
                <label className="field">{c.district}{input('district', { type: 'text', required: true })}</label>
                <label className="field">{c.province}
                  <select className="input" name="province" value={form.province} onChange={(e) => set('province', e.target.value)}>
                    {provinceOptions(lang).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </label>
                <label className="field">{c.postcode}{input('postcode', { type: 'text', inputMode: 'numeric', autoComplete: 'postal-code', pattern: '[0-9]{5}', required: true })}</label>
                <label className="field span-all">{c.note}{input('note', { type: 'text' })}</label>
                <label className="check-row span-all">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  {c.remember}
                </label>
              </div>
            </section>

            <section>
              <h2 className="num-display" style={{ fontWeight: 400, fontSize: 24 }}>{c.payment}</h2>
              <label className="pay-option">
                <input type="radio" name="pay" defaultChecked />
                <span className="stack" style={css({ '--gap': '4px' })}>
                  <span className="strong">{c.payTitle}</span>
                  <span className="small" style={{ fontSize: 14 }}>{c.payBody}</span>
                </span>
              </label>
            </section>
          </div>

          <aside className="split__side panel panel--md" style={{ padding: 22 }}>
            <details open>
              <summary className="checkout-summary">
                <span className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>{c.summary}</span>
                <span className="muted" style={{ fontSize: 14 }}>{c.itemsCount(count)}</span>
              </summary>
              <ul className="checkout-items">
                {items.map((it) => (
                  <li key={it.id}>
                    <Image src={it.img} alt="" width={54} height={54} />
                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.45 }}>
                      {itemName(it, t)}{it.qty > 1 ? ` × ${it.qty}` : ''}
                      <br />
                      <span className="muted">{itemOptions(it, lang, t)}</span>
                    </span>
                    <span className="strong" style={{ fontSize: 14 }}>{baht(it.unitPrice * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </details>
            <div className="stack divider-top" style={css({ marginTop: 16, paddingTop: 14, '--gap': '8px', fontSize: 15 })}>
              <div className="sum-row"><span>{c.subtotal}</span><span>{baht(subtotal)}</span></div>
              {discount > 0 && rule && (
                <div className="sum-row checkout-discount"><span>{c.discountRow(rule.code)}</span><span>−{baht(discount)}</span></div>
              )}
              <div className="sum-row"><span>{c.shippingKg(kg)}</span><span>{baht(shipping)}</span></div>
              <div className="sum-row" style={{ alignItems: 'baseline', marginTop: 6 }}>
                <span className="strong">{c.amountDue}</span>
                <span className="num-display" style={{ fontSize: 30 }}>{baht(due)}</span>
              </div>
            </div>
            <div className="checkout-code">
              {rule ? (
                <p className="checkout-code__applied">
                  <span>{discount > 0 ? c.codeApplied(rule.code, discountLabel(rule)) : c.codeBelowMin(baht(rule.minSubtotal))}</span>
                  <button type="button" className="text-btn text-btn--link" onClick={() => setRule(null)}>{c.codeRemove}</button>
                </p>
              ) : (
                <>
                  <label htmlFor="discount-code" className="checkout-code__label">{c.codeLabel}</label>
                  <div className="checkout-code__row">
                    <input
                      id="discount-code"
                      className="input"
                      value={codeInput}
                      placeholder={c.codePlaceholder}
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={!!codeError}
                      aria-describedby={codeError ? 'discount-code-error' : undefined}
                      onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCode(); } }}
                    />
                    <button type="button" className="btn btn--ghost" onClick={applyCode} disabled={!codeInput.trim() || checkingCode}>
                      {checkingCode ? c.codeChecking : c.codeApply}
                    </button>
                  </div>
                  {codeError && <p id="discount-code-error" role="alert" className="checkout-code__error">{codeError}</p>}
                </>
              )}
            </div>
            {error && <p role="alert" className="checkout-error">{error}</p>}
            <button type="submit" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 18 }} disabled={placing}>
              {placing ? c.placing : c.confirm}
            </button>
            <p className="small" style={{ marginTop: 12 }}>
              {c.consent} <Link href="/privacy" target="_blank">{t.common.privacyLink}</Link>
            </p>
            <p className="small" style={{ marginTop: 6 }}>{c.shippingNote}</p>
          </aside>
        </form>
      </main>
    </>
  );
}
