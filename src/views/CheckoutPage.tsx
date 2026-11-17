'use client';

import Image from 'next/image';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { css } from '../data/style';
import { placeOrder } from '../server/actions/shop';
import { provinceOptions } from '../lib/provinces';
import { useI18n } from '../i18n/LocaleProvider';
import { itemName, itemOptions } from '../lib/cartItem';
import './CheckoutPage.css';


export function CheckoutPage() {
  const { lang, t } = useI18n();
  const c = t.checkout;
  const { items, count, subtotal, kg, shipping, total, clear } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const empty = items.length === 0;

  useEffect(() => {
    if (empty && !placing) router.replace('/cart');
  }, [empty, placing, router]);

  if (empty) return null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    setPlacing(true);
    setError('');
    try {
      const res = await placeOrder({
        name: v('name'),
        phone: v('phone'),
        address: [v('street'), v('subdistrict'), v('district'), v('province'), v('postcode')].filter(Boolean).join(' '),
        note: v('note'),
        lines: items.map(({ slug, qty, color, magnets, custom }) => ({ slug, qty, color, magnets, custom })),
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

  return (
    <>
      <SiteHeader variant="simple" sticky={false} right={<Link href="/cart" style={{ fontSize: 14, color: 'var(--ink)' }}>{c.backToCart}</Link>} />
      <main className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
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
              <h2 className="num-display" style={{ fontWeight: 400, fontSize: 24 }}>{c.address}</h2>
              <div className="auto-grid" style={css({ '--min': '240px', '--gap': '14px', marginTop: 16 })}>
                <label className="field">{c.fullName}<input className="input" name="name" type="text" autoComplete="name" required /></label>
                <label className="field">
                  {c.phone}
                  <span className="field__hint">{c.phoneHint}</span>
                  <input className="input" name="phone" type="tel" autoComplete="tel" required />
                </label>
                <label className="field span-all">{c.street}<textarea className="input" name="street" rows={2} autoComplete="street-address" required /></label>
                <label className="field">{c.subdistrict}<input className="input" name="subdistrict" type="text" required /></label>
                <label className="field">{c.district}<input className="input" name="district" type="text" required /></label>
                <label className="field">{c.province}
                  <select className="input" name="province">{provinceOptions(lang).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
                </label>
                <label className="field">{c.postcode}<input className="input" name="postcode" type="text" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" required /></label>
                <label className="field span-all">{c.note}<input className="input" name="note" type="text" /></label>
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
              <div className="sum-row"><span>{c.shippingKg(kg)}</span><span>{baht(shipping)}</span></div>
              <div className="sum-row" style={{ alignItems: 'baseline', marginTop: 6 }}>
                <span className="strong">{c.amountDue}</span>
                <span className="num-display" style={{ fontSize: 30 }}>{baht(total)}</span>
              </div>
            </div>
            {error && <p role="alert" className="checkout-error">{error}</p>}
            <button type="submit" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 18 }} disabled={placing}>
              {placing ? c.placing : c.confirm}
            </button>
            <p className="small" style={{ marginTop: 12 }}>{c.shippingNote}</p>
          </aside>
        </form>
      </main>
    </>
  );
}
