'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ColorPicker } from '../components/ColorPicker';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { img } from '../data/images';
import { RUBBER_COLORS } from '../data/seed';
import { SIZES } from '../data/sizes';
import { css } from '../data/style';
import { useI18n } from '../i18n/LocaleProvider';
import { quoteCustomSize } from '../lib/customSize';
import { CUSTOM_KG, CUSTOM_SLUG } from '../lib/pricing';
import { localizeColor } from '../lib/productText';
import { submitRequest } from '../server/actions/shop';
import './CustomPage.css';

const BAR_MAX = 180; // the bar spans 0–180 cm so the 120 / 150 marks sit at 66.6% / 83.3%

export function CustomPage() {
  const { lang, t } = useI18n();
  const c = t.custom;
  const { add, openDrawer } = useCart();
  const [dims, setDims] = useState({ w: '50', l: '50', h: '20' });
  const [color, setColor] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const n = (v: string) => Math.max(0, parseFloat(v) || 0);
  const q = quoteCustomSize(n(dims.w), n(dims.l), n(dims.h));
  const pct = Math.min(100, (q.sum / BAR_MAX) * 100);
  const colors = RUBBER_COLORS.map((x) => localizeColor(x, lang));
  const reason = q.ok ? '' : q.reason === 'over' ? c.reasons.over(q.sum) : c.reasons[q.reason];

  const sendQuote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // Request details are stored with Thai labels for the admin.
    f.set('ขนาด (กว้าง×ยาว×สูง)', `${dims.w} × ${dims.l} × ${dims.h} cm`);
    f.set('ขนาดรวม', `${q.sum} cm`);
    f.set('สีผิวยาง', RUBBER_COLORS[color].label);
    if (lang !== 'th') f.set('ภาษา', 'English');
    setSending(true);
    const res = await submitRequest('custom', f).catch(() => ({ ok: false as const, error: 'sendFailed' as const }));
    setSending(false);
    if (res.ok) setSent(true);
    else setError(t.errors[res.error]);
  };

  const addToCart = () => {
    if (!q.ok) return;
    add({
      slug: CUSTOM_SLUG,
      color,
      colorTh: RUBBER_COLORS[color].label,
      custom: { w: n(dims.w), l: n(dims.l), h: n(dims.h) },
      name: q.model,
      kind: 'custom',
      unitPrice: q.price,
      kg: CUSTOM_KG,
      img: img.jumpBox.src,
    });
    openDrawer();
  };

  const dimField = (key: 'w' | 'l' | 'h', label: string) => (
    <label className="field">
      {label}
      <input
        className="input input--lg"
        type="number"
        inputMode="numeric"
        min={1}
        value={dims[key]}
        onChange={(e) => setDims((d) => ({ ...d, [key]: e.target.value }))}
      />
    </label>
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="container" style={{ paddingTop: 40 }}>
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="display" style={{ letterSpacing: 0 }}>{c.title}</h1>
          <p className="lead" style={{ marginTop: 16, maxWidth: 580 }}>{c.lead}</p>
          <Image priority sizes={SIZES.full} src={img.jumpBox} alt={c.heroAlt} className="photo" style={{ marginTop: 28, aspectRatio: '16 / 10', maxHeight: 560 }} />
        </section>

        <section className="container split" style={{ paddingTop: 40 }}>
          <form className="stack" style={css({ flex: '1 1 380px', '--gap': '22px' })} onSubmit={(e) => e.preventDefault()}>
            <h2 className="num-display" style={{ fontWeight: 300, fontSize: 32 }}>{c.sizeTitle}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {dimField('w', c.width)}
              {dimField('l', c.length)}
              {dimField('h', c.height)}
            </div>

            <div>
              <div className="sum-row" style={{ fontSize: 14 }}>
                <span>{c.sumLabel}</span>
                <span className="strong">{q.sum} cm</span>
              </div>
              <div className="size-bar" aria-hidden="true">
                <div className="size-bar__fill" style={{ width: `${pct}%`, background: q.ok ? 'var(--link)' : 'var(--orange)' }} />
                <span className="size-bar__mark" style={{ left: '66.6%' }} />
                <span className="size-bar__mark" style={{ left: '83.3%' }} />
              </div>
              <div className="size-bar__labels" aria-hidden="true">
                <span style={{ left: '66.6%' }}>120</span>
                <span style={{ left: '83.3%' }}>150</span>
              </div>
            </div>

            <ColorPicker legend={c.colorLegend} colors={colors} value={color} onChange={setColor} layout="pills" />
          </form>

          <div aria-live="polite" className="panel quote-card">
            {q.ok ? (
              <>
                <p className="quote-card__kicker">{q.model}</p>
                <p className="quote-card__price">{baht(q.price)}</p>
                <p className="body" style={{ marginTop: 12 }}>
                  {dims.w} × {dims.l} × {dims.h} cm · {c.colorName(colors[color].label)}
                  <br />
                  {c.rules[q.rule]}
                </p>
                <p className="body" style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>{c.leadTime}</p>
                <button type="button" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 20 }} onClick={addToCart}>
                  {c.addToCart(baht(q.price))}
                </button>
              </>
            ) : (
              <>
                <p className="quote-card__kicker">{c.quoteKicker}</p>
                <p className="num-display" style={{ marginTop: 8, fontWeight: 300, fontSize: 30, lineHeight: 1.2 }}>{c.quoteTitle}</p>
                <p className="body" style={{ marginTop: 10 }}>{c.quoteBody(reason)}</p>
                {sent ? (
                  <p className="tag tag--green tag--md" style={{ marginTop: 18 }}>{c.sent}</p>
                ) : (
                  <form className="stack" style={css({ marginTop: 18, '--gap': '12px' })} onSubmit={sendQuote}>
                    <label className="field">{c.name}<input className="input" name="_name" type="text" autoComplete="name" required style={{ height: 48 }} /></label>
                    <label className="field">{c.contact}<input className="input" name="_contact" type="text" required style={{ height: 48 }} /></label>
                    <label className="field">{c.activity}<textarea className="input" name="ใช้ทำกิจกรรม" rows={3} /></label>
                    <p className="small">{t.common.formConsent} <Link href="/privacy" target="_blank">{t.common.privacyLink}</Link></p>
                    {error && <p role="alert" className="small" style={{ color: '#8e1f0b' }}>{error}</p>}
                    <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={sending}>{sending ? t.common.sending : c.sendQuote}</button>
                  </form>
                )}
              </>
            )}
          </div>
        </section>

        <section className="container" style={{ paddingTop: 72, paddingBottom: 96 }}>
          <h2 className="title title--sm">{c.conditionsTitle}</h2>
          <div className="auto-grid" style={css({ '--min': '240px', '--gap': '12px', marginTop: 20 })}>
            {c.conditions.map((r) => (
              <div key={r.name} className="outline-card outline-card--sm" style={{ gap: 0 }}>
                <p className="num-display" style={{ fontWeight: 500, fontSize: 19 }}>{r.name}</p>
                <p className="body" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.65 }}>{r.body}</p>
                <p className="strong" style={{ marginTop: 10, fontSize: 18 }}>{r.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
