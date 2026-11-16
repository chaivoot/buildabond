'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MiniProductCard } from '../components/ProductTile';
import { QtyStepper } from '../components/QtyStepper';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import type { Product } from '../data/products';
import { useShopSettings } from '../context/SettingsContext';
import { tierRange } from '../lib/shipping';
import { css } from '../data/style';
import './CartPage.css';

export function CartPage({ crossSell }: { crossSell: Product[] }) {
  const { items, count, subtotal, kg, tier, shipping, total, setQty, remove } = useCart();
  const { shipping: tiers } = useShopSettings();

  return (
    <>
      <SiteHeader variant="simple" sticky={false} right={<Link href="/shop" style={{ fontSize: 14, color: 'var(--ink)' }}>เลือกซื้อต่อ</Link>} />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <h1 className="display" style={{ fontSize: 'clamp(38px, 8vw, 64px)', letterSpacing: 0 }}>ตะกร้า</h1>
        <div className="split" style={{ marginTop: 24 }}>
          <ul className="split__main cart-list">
            {items.map((it) => (
              <li key={it.id} className="cart-line">
                <Image src={it.img} alt="" width={96} height={96} />
                <div className="cart-line__info">
                  <div className="sum-row">
                    <span className="cart-line__name">{it.name}</span>
                    <span className="strong">{baht(it.unitPrice * it.qty)}</span>
                  </div>
                  <span className="muted" style={{ fontSize: 14 }}>{it.opt}</span>
                  <span className="small">{baht(it.unitPrice)}/ชิ้น · ประมาณ {it.kg} กก./ชิ้น</span>
                  <span className="cart-line__status">{it.status}</span>
                  <div className="row-between" style={{ marginTop: 8 }}>
                    <QtyStepper value={it.qty} onChange={(v) => setQty(it.id, v)} />
                    <button type="button" className="text-btn" onClick={() => remove(it.id)}>ลบ</button>
                  </div>
                </div>
              </li>
            ))}
            {items.length === 0 && (
              <li style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-2)' }}>
                ตะกร้ายังว่าง <Link href="/shop">เลือกสินค้า</Link>
              </li>
            )}
          </ul>

          <aside className="split__side panel panel--md">
            <h2 className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>สรุปยอด</h2>
            <div className="stack" style={{ marginTop: 16, fontSize: 15 }}>
              <div className="sum-row"><span>ยอดสินค้า ({count} ชิ้น)</span><span>{baht(subtotal)}</span></div>
              <div className="sum-row"><span>ค่าส่ง · น้ำหนักรวม {kg} กก.</span><span>{baht(shipping)}</span></div>
            </div>
            <table className="ship-table">
              <caption>อัตราค่าส่งตามน้ำหนักรวม</caption>
              <tbody>
                {tiers.map((t, i) => (
                  <tr key={i} data-current={i === tier}>
                    <td>{tierRange(tiers, i)}</td>
                    <td style={{ textAlign: 'right' }}>{baht(t.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="sum-row divider-top" style={{ marginTop: 16, paddingTop: 14, alignItems: 'baseline' }}>
              <span className="strong" style={{ fontSize: 16 }}>รวมทั้งหมด</span>
              <span className="num-display" style={{ fontSize: 30 }}>{baht(total)}</span>
            </div>
            {items.length > 0 ? (
              <Link href="/checkout" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 18 }}>ไปชำระเงิน</Link>
            ) : (
              <button type="button" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 18, opacity: 0.4 }} disabled>ไปชำระเงิน</button>
            )}
            <p className="small" style={{ marginTop: 12 }}>ชำระด้วยการโอนเงินหรือพร้อมเพย์เท่านั้น</p>
          </aside>
        </div>

        <section style={{ marginTop: 56 }}>
          <h2 className="num-display" style={{ fontWeight: 300, fontSize: 28 }}>ต่อเป็นชุดกับ Place Board</h2>
          <div className="auto-fill" style={css({ marginTop: 16 })}>
            {crossSell.map((p) => <MiniProductCard key={p.slug} p={p} />)}
          </div>
        </section>
      </main>
    </>
  );
}
