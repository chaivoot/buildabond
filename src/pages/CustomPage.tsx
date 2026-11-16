import { useState } from 'react';
import { ColorPicker } from '../components/ColorPicker';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { quoteCustomSize } from '../data/customSize';
import { baht } from '../data/format';
import { img } from '../data/images';
import { RUBBER_COLORS } from '../data/products';
import { css } from '../data/style';
import './CustomPage.css';

const BAR_MAX = 180; // the bar spans 0–180 cm so the 120 / 150 marks sit at 66.6% / 83.3%

const RULES = [
  { name: 'Jump Box', body: 'สูงไม่เกิน 40 cm และกว้าง + ยาว + สูง รวมไม่เกิน 120 cm', price: '฿2,590' },
  { name: 'Platform', body: 'สูงไม่เกิน 10 cm และขนาดรวมมากกว่า 120 cm แต่ไม่เกิน 150 cm', price: '฿2,990' },
  { name: 'ขนาดพิเศษ', body: 'ขนาดรวมเกิน 150 cm หรือสัดส่วนนอกเงื่อนไขด้านบน', price: 'ประเมินราคา' },
];

export function CustomPage() {
  const { add, openDrawer } = useCart();
  const [dims, setDims] = useState({ w: '50', l: '50', h: '20' });
  const [color, setColor] = useState(0);
  const [sent, setSent] = useState(false);

  const n = (v: string) => Math.max(0, parseFloat(v) || 0);
  const q = quoteCustomSize(n(dims.w), n(dims.l), n(dims.h));
  const pct = Math.min(100, (q.sum / BAR_MAX) * 100);
  const c = RUBBER_COLORS[color];
  const colorName = color === 2 ? 'ผิวยางผสมฟ้า-ส้ม' : `ผิวยาง${c.label}`;

  const addToCart = () => {
    if (!q.ok) return;
    add({
      name: `${q.model} สั่งทำ`,
      opt: `${dims.w}×${dims.l}×${dims.h} cm · ${c.label}`,
      status: 'ผลิตตามสั่ง · 28-35 วัน',
      unitPrice: q.price,
      kg: 6, // TODO: confirm made-to-measure weights
      img: img.jumpBox,
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
          <p className="eyebrow">Customised Size</p>
          <h1 className="display" style={{ letterSpacing: 0 }}>สั่งทำกล่องและฐานรอง ตามขนาดที่ต้องการ</h1>
          <p className="lead" style={{ marginTop: 16, maxWidth: 580 }}>ออกแบบกิจกรรมได้หลากหลายขึ้น กรอกกว้าง ยาว สูง แล้วระบบจะบอกรุ่นและราคาให้ทันที</p>
          <img src={img.jumpBox} alt="กล่องกระโดดสั่งทำ ผิวยางสีดำ มีขั้นบันไดด้านข้าง" className="photo" style={{ marginTop: 28, aspectRatio: '16 / 10', maxHeight: 560 }} />
        </section>

        <section className="container split" style={{ paddingTop: 40 }}>
          <form className="stack" style={css({ flex: '1 1 380px', '--gap': '22px' })} onSubmit={(e) => e.preventDefault()}>
            <h2 className="num-display" style={{ fontWeight: 300, fontSize: 32 }}>ขนาดที่ต้องการ (cm)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {dimField('w', 'กว้าง')}
              {dimField('l', 'ยาว')}
              {dimField('h', 'สูง')}
            </div>

            <div>
              <div className="sum-row" style={{ fontSize: 14 }}>
                <span>กว้าง + ยาว + สูง</span>
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

            <ColorPicker legend="สีผิวยาง" colors={RUBBER_COLORS} value={color} onChange={setColor} layout="pills" />
          </form>

          <div aria-live="polite" className="panel quote-card">
            {q.ok ? (
              <>
                <p className="quote-card__kicker">{q.model}</p>
                <p className="quote-card__price">{baht(q.price)}</p>
                <p className="body" style={{ marginTop: 12 }}>
                  {dims.w} × {dims.l} × {dims.h} cm · {colorName}
                  <br />
                  {q.rule}
                </p>
                <p className="body" style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>ผลิตตามสั่ง ใช้เวลาประมาณ 28-35 วัน</p>
                <button type="button" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 20 }} onClick={addToCart}>
                  ใส่ตะกร้า · {baht(q.price)}
                </button>
              </>
            ) : (
              <>
                <p className="quote-card__kicker">ต้องประเมินราคา</p>
                <p className="num-display" style={{ marginTop: 8, fontWeight: 300, fontSize: 30, lineHeight: 1.2 }}>ขนาดนี้ทีมขอดูแบบก่อน</p>
                <p className="body" style={{ marginTop: 10 }}>{q.reason} ส่งรายละเอียดมา ทีมจะติดต่อกลับพร้อมราคา</p>
                {sent ? (
                  <p className="tag tag--green tag--md" style={{ marginTop: 18 }}>ส่งคำขอแล้ว ทีมจะติดต่อกลับ</p>
                ) : (
                  <form className="stack" style={css({ marginTop: 18, '--gap': '12px' })} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                    <label className="field">ชื่อ<input className="input" type="text" autoComplete="name" required style={{ height: 48 }} /></label>
                    <label className="field">เบอร์โทร หรือ LINE ID<input className="input" type="text" required style={{ height: 48 }} /></label>
                    <label className="field">ใช้ทำกิจกรรมอะไร (ไม่บังคับ)<textarea className="input" rows={3} /></label>
                    <button type="submit" className="btn btn--primary btn--lg btn--block">ส่งคำขอใบเสนอราคา</button>
                  </form>
                )}
              </>
            )}
          </div>
        </section>

        <section className="container" style={{ paddingTop: 72, paddingBottom: 96 }}>
          <h2 className="title title--sm">เงื่อนไขขนาด</h2>
          <div className="auto-grid" style={css({ '--min': '240px', '--gap': '12px', marginTop: 20 })}>
            {RULES.map((r) => (
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
