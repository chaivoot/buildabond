'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { baht } from '../../data/format';
import { codeProblem, discountFor, discountLabel } from '../../lib/discount';
import { formatPhone, phoneSearchDigits } from '../../lib/phone';
import { priceLine } from '../../lib/pricing';
import { provinceOptions } from '../../lib/provinces';
import { shippingFee } from '../../lib/shipping';
import { th } from '../../i18n/th';
import type { DiscountCode, Product, ShopSettings } from '../../lib/types';
import { createAdminOrder, type AdminOrderLine } from '../../server/actions/admin';

interface PickCustomer {
  id: string; name: string; phone: string; email: string; street: string; subdistrict: string; district: string; province: string; postcode: string;
}

const SOURCES = [
  { id: 'line', label: 'LINE' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'phone', label: 'โทรศัพท์' },
  { id: 'walkin', label: 'หน้าร้าน / งานอีเวนต์' },
  { id: 'other', label: 'อื่น ๆ' },
];

type Line = AdminOrderLine & { key: number };
let nextKey = 1;
const newLine = (slug?: string): Line => ({ key: nextKey++, slug, qty: 1, size: 0, color: 0, magnets: false, unitPrice: null, name: '', kg: 0 });

const EMPTY = { name: '', phone: '', email: '', street: '', subdistrict: '', district: '', province: '', postcode: '', note: '' };

export function NewOrderAdmin({ products, customers, settings, codes }: { products: Product[]; customers: PickCustomer[]; settings: ShopSettings; codes: DiscountCode[] }) {
  const sellable = products.filter((p) => p.price > 0 || (p.detail.sizes?.length ?? 0) > 0);
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const [source, setSource] = useState('line');
  const [c, setC] = useState(EMPTY);
  const [query, setQuery] = useState('');
  const [lines, setLines] = useState<Line[]>([newLine(sellable[0]?.slug)]);
  // Affiliate / code: credits the order to the code's affiliate; the customer gets the code's discount only if ticked.
  const [code, setCode] = useState('');
  const [giveCodeDiscount, setGiveCodeDiscount] = useState(true);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [shippingOverride, setShippingOverride] = useState<string>('');
  const [paid, setPaid] = useState(false);
  const [emailCustomer, setEmailCustomer] = useState(true);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ id: string; link: string } | null>(null);
  const [copied, setCopied] = useState('');
  const [pending, start] = useTransition();

  const set = (k: keyof typeof EMPTY, v: string) => setC((x) => ({ ...x, [k]: v }));
  const setLine = (key: number, p: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...p } : l)));

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const digits = phoneSearchDigits(q);
    return customers.filter((x) => x.name.toLowerCase().includes(q) || x.email.toLowerCase().includes(q) || (digits.length >= 3 && phoneSearchDigits(x.phone).includes(digits))).slice(0, 6);
  }, [query, customers]);

  /** Catalogue price for a line (the server prices it again). */
  const linePrice = (l: Line) => {
    if (!l.slug) return { unit: Number(l.unitPrice) || 0, kg: Number(l.kg) || 0, opt: '' };
    const p = bySlug.get(l.slug);
    if (!p) return { unit: 0, kg: 0, opt: '' };
    const priced = priceLine({ slug: p.slug, qty: l.qty, size: l.size, color: l.color, magnets: l.magnets ? 1 : 0 }, { ...p, visible: true, comingSoon: false, custom: false }, settings);
    const unit = l.unitPrice === null || l.unitPrice === undefined || String(l.unitPrice) === '' ? priced?.unitPrice ?? 0 : Number(l.unitPrice);
    return { unit, kg: priced?.kg ?? 0, opt: priced?.opt ?? '', catalogue: priced?.unitPrice ?? 0 };
  };

  const subtotal = lines.reduce((a, l) => a + linePrice(l).unit * (Number(l.qty) || 1), 0);
  const kg = Math.round(lines.reduce((a, l) => a + linePrice(l).kg * (Number(l.qty) || 1), 0) * 10) / 10;
  const autoShipping = shippingFee(kg, settings.shipping);
  const shipping = shippingOverride === '' ? autoShipping : Math.max(0, Number(shippingOverride) || 0);
  const chosen = codes.find((x) => x.code === code) ?? null;
  const codeIssue = chosen && giveCodeDiscount ? codeProblem(chosen, subtotal) : null;
  const codeRule = chosen && giveCodeDiscount && !codeIssue ? chosen : null;
  const discount = codeRule ? discountFor(codeRule, subtotal) : Math.max(0, Math.min(subtotal, manualDiscount || 0));
  const total = subtotal - discount + shipping;

  const submit = () => {
    setError('');
    start(async () => {
      const res = await createAdminOrder({
        source, ...c,
        lines: lines.map(({ key: _k, ...l }) => l),
        discountCode: chosen?.code ?? '',
        applyCodeDiscount: giveCodeDiscount,
        manualDiscount: codeRule ? 0 : manualDiscount,
        shipping: shippingOverride === '' ? null : Number(shippingOverride),
        paid,
        emailCustomer,
      }).catch((e: Error) => ({ error: e.message }));
      if ('error' in res) return setError(res.error);
      setDone(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const message = done
    ? [
        `สรุปออร์เดอร์ ${done.id}`,
        ...lines.map((l) => {
          const p = l.slug ? bySlug.get(l.slug) : null;
          const lp = linePrice(l);
          return `• ${p ? p.name : l.name}${lp.opt && lp.opt !== '—' ? ` (${lp.opt})` : ''} × ${l.qty} = ${baht(lp.unit * l.qty)}`;
        }),
        discount > 0 ? `ส่วนลด${codeRule ? ` (${codeRule.code})` : ''} −${baht(discount)}` : '',
        `ค่าส่ง ${baht(shipping)}`,
        `ยอดที่ต้องโอน ${baht(total)}`,
        paid ? 'ได้รับชำระแล้ว ขอบคุณค่ะ' : `โอนได้ที่ ${settings.bank.name} ${settings.bank.number} (${settings.bank.holder}) หรือสแกน QR และแนบสลิปที่ลิงก์นี้`,
        done.link,
      ].filter(Boolean).join('\n')
    : '';

  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(''), 2000); } catch { /* ignore */ }
  };

  if (done) {
    return (
      <>
        <p className="small"><Link href="/admin">← ออร์เดอร์ทั้งหมด</Link></p>
        <div className="admin-head" style={{ marginTop: 8 }}><h1>สร้างออร์เดอร์ {done.id} แล้ว</h1></div>
        <section className="admin-card" style={{ marginTop: 18, maxWidth: 760 }}>
          <h2>ส่งให้ลูกค้า</h2>
          <p className="small">ลิงก์นี้เปิดหน้าออร์เดอร์ของลูกค้า มี QR พร้อมเพย์ เลขบัญชี และช่องอัปโหลดสลิป</p>
          <div className="admin-email-test">
            <input className="input" readOnly value={done.link} onFocus={(e) => e.target.select()} style={{ flex: '1 1 320px' }} aria-label="ลิงก์ออร์เดอร์" />
            <button type="button" className="btn btn--primary btn--square" onClick={() => copy(done.link, 'link')}>{copied === 'link' ? 'คัดลอกแล้ว ✓' : 'คัดลอกลิงก์'}</button>
          </div>
          <label className="field" style={{ marginTop: 16 }}>ข้อความสรุปสำหรับแชท
            <textarea className="input" rows={Math.min(14, message.split('\n').length + 1)} readOnly value={message} onFocus={(e) => e.target.select()} />
          </label>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--ghost btn--square" onClick={() => copy(message, 'msg')}>{copied === 'msg' ? 'คัดลอกแล้ว ✓' : 'คัดลอกข้อความ'}</button>
            <Link className="btn btn--ghost btn--square" href={`/admin?order=${encodeURIComponent(done.id)}`}>เปิดออร์เดอร์ในหลังบ้าน</Link>
            <button type="button" className="btn btn--ghost btn--square" onClick={() => { setDone(null); setC(EMPTY); setLines([newLine(sellable[0]?.slug)]); setCode(''); setGiveCodeDiscount(true); setManualDiscount(0); setShippingOverride(''); setPaid(false); }}>สร้างออร์เดอร์ใหม่</button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <p className="small"><Link href="/admin">← ออร์เดอร์ทั้งหมด</Link></p>
      <div className="admin-head" style={{ marginTop: 8 }}><h1>สร้างออร์เดอร์</h1></div>
      <p className="small" style={{ marginTop: 6 }}>สำหรับลูกค้าที่สั่งทางแชทหรือโทรศัพท์ สร้างแล้วจะได้ลิงก์ไปส่งให้ลูกค้าโอนเงินและแนบสลิป</p>

      <div className="stack" style={{ marginTop: 18, gap: 18, maxWidth: 980 }}>
        <section className="admin-card">
          <h2>ลูกค้า</h2>
          <fieldset className="plain">
            <legend className="small">สั่งผ่านช่องทาง</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {SOURCES.map((s) => <button key={s.id} type="button" className="chip" aria-pressed={source === s.id} onClick={() => setSource(s.id)}>{s.label}</button>)}
            </div>
          </fieldset>
          <label className="field" style={{ marginTop: 14, position: 'relative' }}>ค้นหาลูกค้าเก่า
            <span className="field__hint">พิมพ์ชื่อ เบอร์ หรืออีเมล แล้วเลือกเพื่อเติมข้อมูลให้อัตโนมัติ</span>
            <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="เช่น 0812 หรือ สมชาย" />
            {matches.length > 0 && (
              <ul className="admin-picker">
                {matches.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => { setC({ ...EMPTY, ...m, note: c.note }); setQuery(''); }}>
                      <strong>{m.name}</strong> · {formatPhone(m.phone)} · {m.email}
                      <span className="small"> {[m.district, m.province].filter(Boolean).join(' ')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
          <div className="admin-grid" style={{ marginTop: 14 }}>
            <label className="field">ชื่อ-นามสกุล<input className="input" value={c.name} onChange={(e) => set('name', e.target.value)} /></label>
            <label className="field">เบอร์โทร<input className="input" type="tel" value={c.phone} onChange={(e) => set('phone', e.target.value)} /></label>
            <label className="field">อีเมล<span className="field__hint">ไม่บังคับ ถ้ามีจะส่งอีเมลยืนยันให้</span><input className="input" type="email" value={c.email} onChange={(e) => set('email', e.target.value)} /></label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>ที่อยู่<textarea className="input" rows={2} value={c.street} onChange={(e) => set('street', e.target.value)} /></label>
            <label className="field">แขวง / ตำบล<input className="input" value={c.subdistrict} onChange={(e) => set('subdistrict', e.target.value)} /></label>
            <label className="field">เขต / อำเภอ<input className="input" value={c.district} onChange={(e) => set('district', e.target.value)} /></label>
            <label className="field">จังหวัด
              <select className="input" value={c.province} onChange={(e) => set('province', e.target.value)}>
                <option value="">เลือกจังหวัด</option>
                {provinceOptions('th').map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label className="field">รหัสไปรษณีย์<input className="input" inputMode="numeric" value={c.postcode} onChange={(e) => set('postcode', e.target.value)} /></label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>หมายเหตุ<input className="input" value={c.note} onChange={(e) => set('note', e.target.value)} placeholder="เช่น คุยใน LINE วันที่ … / ขอให้ส่งก่อนวันศุกร์" /></label>
          </div>
        </section>

        <section className="admin-card">
          <h2>สินค้า</h2>
          <ul className="admin-lines">
            {lines.map((l) => {
              const p = l.slug ? bySlug.get(l.slug) : null;
              const lp = linePrice(l);
              const sizes = p?.detail.sizes ?? [];
              return (
                <li key={l.key}>
                  {l.slug !== undefined ? (
                    <label className="field admin-lines__product">สินค้า
                      <select className="input" value={l.slug} onChange={(e) => setLine(l.key, { slug: e.target.value, size: 0, color: 0, magnets: false, unitPrice: null })}>
                        {sellable.map((x) => <option key={x.slug} value={x.slug}>{x.name}{x.comingSoon ? ' (ยังไม่เปิดขาย)' : ''}</option>)}
                      </select>
                    </label>
                  ) : (
                    <label className="field admin-lines__product">รายการพิเศษ<input className="input" value={l.name} onChange={(e) => setLine(l.key, { name: e.target.value })} placeholder="เช่น Jump Box สั่งทำ 50×60×40" /></label>
                  )}
                  {sizes.length > 0 && (
                    <label className="field">ขนาด
                      <select className="input" value={l.size} onChange={(e) => setLine(l.key, { size: Number(e.target.value), unitPrice: null })}>
                        {sizes.map((s, i) => <option key={i} value={i}>{s.label} · {baht(s.price)}</option>)}
                      </select>
                    </label>
                  )}
                  {p && p.colors.length > 0 && (
                    <label className="field">สี
                      <select className="input" value={l.color} onChange={(e) => setLine(l.key, { color: Number(e.target.value) })}>
                        {p.colors.map((col, i) => <option key={col.label} value={i}>{col.label}</option>)}
                      </select>
                    </label>
                  )}
                  {p && p.magnets && p.magnetCount > 0 && (
                    <label className="admin-check" style={{ alignSelf: 'flex-end' }}>
                      <input type="checkbox" checked={!!l.magnets} onChange={(e) => setLine(l.key, { magnets: e.target.checked, unitPrice: null })} />แม่เหล็ก {p.magnetCount} ชิ้น
                    </label>
                  )}
                  {!l.slug && (
                    <label className="field admin-lines__num">น้ำหนัก (กก.)<input className="input" type="number" min={0} step={0.1} value={l.kg ?? 0} onChange={(e) => setLine(l.key, { kg: Number(e.target.value) })} /></label>
                  )}
                  <label className="field admin-lines__num">จำนวน<input className="input" type="number" min={1} value={l.qty} onChange={(e) => setLine(l.key, { qty: Math.max(1, Number(e.target.value) || 1) })} /></label>
                  <label className="field admin-lines__num">ราคาต่อชิ้น
                    <input className="input" type="number" min={0} value={l.unitPrice ?? ''} placeholder={l.slug ? String(lp.catalogue ?? '') : '0'} onChange={(e) => setLine(l.key, { unitPrice: e.target.value === '' ? null : Number(e.target.value) })} />
                  </label>
                  <span className="admin-lines__total">{baht(lp.unit * l.qty)}</span>
                  {lines.length > 1 && <button type="button" className="admin-tiers__remove" aria-label="ลบรายการนี้" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}>✕</button>}
                  {l.slug && l.unitPrice !== null && l.unitPrice !== undefined && String(l.unitPrice) !== '' && Number(l.unitPrice) !== lp.catalogue && (
                    <span className="small admin-lines__note">ราคาปกติ {baht(lp.catalogue ?? 0)} · ใช้ราคาที่แก้</span>
                  )}
                </li>
              );
            })}
          </ul>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLines((ls) => [...ls, newLine(sellable[0]?.slug)])}>+ เพิ่มสินค้า</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLines((ls) => [...ls, { ...newLine(), slug: undefined, unitPrice: 0 }])}>+ รายการพิเศษ (สั่งทำ ค่าบริการ ฯลฯ)</button>
          </div>
          <p className="small" style={{ marginTop: 8 }}>ราคาต่อชิ้นว่างไว้ = ใช้ราคาในระบบ ใส่ตัวเลขเพื่อให้ราคาพิเศษ</p>
        </section>

        <section className="admin-card">
          <h2>ส่วนลด ค่าส่ง และการชำระเงิน</h2>
          <div className="admin-grid">
            <div className="field">Affiliate / โค้ด
              <span className="field__hint">ออร์เดอร์นี้นับเข้ารายงานค่าคอมของคนนี้</span>
              <select className="input" value={code} onChange={(e) => setCode(e.target.value)}>
                <option value="">— ไม่มี —</option>
                {codes.map((x) => (
                  <option key={x.code} value={x.code}>{x.code}{x.affiliate ? ` · ${x.affiliate}` : ''} · ลด {discountLabel(x)}{x.active ? '' : ' (ปิดอยู่)'}</option>
                ))}
              </select>
              {chosen && (
                <label className="admin-check" style={{ minHeight: 36 }}>
                  <input type="checkbox" checked={giveCodeDiscount} onChange={(e) => setGiveCodeDiscount(e.target.checked)} />
                  ให้ส่วนลดของโค้ดนี้กับลูกค้า ({discountLabel(chosen)})
                </label>
              )}
              {codeIssue && <span className="small" role="alert" style={{ color: '#8e1f0b' }}>{th.errors[codeIssue]} · เอาเครื่องหมายออกเพื่อนับเป็นยอด affiliate อย่างเดียว</span>}
              {codeRule && <span className="small" style={{ color: '#1d6b2a' }}>ลด {baht(discount)}</span>}
            </div>
            {!codeRule && (
              <label className="field">ส่วนลดเพิ่มเอง (บาท)<span className="field__hint">{chosen ? 'ใช้แทนส่วนลดของโค้ด ว่างไว้ = ไม่ลด' : 'ถ้าไม่ได้ใช้โค้ด'}</span>
                <input className="input" type="number" min={0} value={manualDiscount || ''} onChange={(e) => setManualDiscount(Number(e.target.value) || 0)} placeholder="0" />
              </label>
            )}
            <label className="field">ค่าส่ง (บาท)<span className="field__hint">ว่างไว้ = คิดตามน้ำหนัก ({kg} กก. → {baht(autoShipping)})</span>
              <input className="input" type="number" min={0} value={shippingOverride} onChange={(e) => setShippingOverride(e.target.value)} placeholder={String(autoShipping)} />
            </label>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label className="admin-check"><input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />ลูกค้าโอนเงินแล้ว (ตั้งสถานะเป็น "ยืนยันแล้ว" ทันที)</label>
            <label className="admin-check"><input type="checkbox" checked={emailCustomer} disabled={!c.email} onChange={(e) => setEmailCustomer(e.target.checked)} />ส่งอีเมล{paid ? 'ยืนยันการชำระ' : 'สรุปออร์เดอร์และวิธีชำระเงิน'}ให้ลูกค้า{!c.email && ' (ต้องมีอีเมล)'}</label>
          </div>
        </section>
      </div>

      <div className="admin-actions" style={{ maxWidth: 980 }}>
        <div className="admin-new-order__sum">
          <span>ยอดสินค้า {baht(subtotal)}</span>
          {discount > 0 && <span style={{ color: '#1d6b2a' }}>ส่วนลด −{baht(discount)}</span>}
          <span>ค่าส่ง {baht(shipping)}</span>
          <strong>รวม {baht(total)}</strong>
        </div>
        {error && <span role="alert" className="admin-note admin-note--warn" style={{ padding: '8px 12px' }}>{error}</span>}
        <button type="button" className="btn btn--primary btn--square" style={{ marginLeft: 'auto' }} disabled={pending} onClick={submit}>{pending ? 'กำลังสร้าง…' : 'สร้างออร์เดอร์'}</button>
      </div>
    </>
  );
}
