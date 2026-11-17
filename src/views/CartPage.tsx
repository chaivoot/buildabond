'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MiniProductCard } from '../components/ProductTile';
import { QtyStepper } from '../components/QtyStepper';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { useShopSettings } from '../context/SettingsContext';
import { baht } from '../data/format';
import type { Product } from '../data/products';
import { css } from '../data/style';
import { useI18n } from '../i18n/LocaleProvider';
import { itemName, itemOptions, itemStatus } from '../lib/cartItem';
import { tierRange } from '../lib/shipping';
import './CartPage.css';

export function CartPage({ crossSell }: { crossSell: Product[] }) {
  const { lang, t } = useI18n();
  const c = t.cart;
  const { items, count, subtotal, kg, tier, shipping, total, setQty, remove } = useCart();
  const { shipping: tiers } = useShopSettings();

  return (
    <>
      <SiteHeader variant="simple" sticky={false} right={<Link href="/shop" style={{ fontSize: 14, color: 'var(--ink)' }}>{c.continueShopping}</Link>} />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <h1 className="display" style={{ fontSize: 'clamp(38px, 8vw, 64px)', letterSpacing: 0 }}>{c.title}</h1>
        <div className="split" style={{ marginTop: 24 }}>
          <ul className="split__main cart-list">
            {items.map((it) => (
              <li key={it.id} className="cart-line">
                <Image src={it.img} alt="" width={96} height={96} />
                <div className="cart-line__info">
                  <div className="sum-row">
                    <span className="cart-line__name">{itemName(it, t)}</span>
                    <span className="strong">{baht(it.unitPrice * it.qty)}</span>
                  </div>
                  <span className="muted" style={{ fontSize: 14 }}>{itemOptions(it, lang, t)}</span>
                  <span className="small">{c.perUnit(baht(it.unitPrice), it.kg)}</span>
                  <span className="cart-line__status">{itemStatus(it, t)}</span>
                  <div className="row-between" style={{ marginTop: 8 }}>
                    <QtyStepper value={it.qty} onChange={(v) => setQty(it.id, v)} />
                    <button type="button" className="text-btn" onClick={() => remove(it.id)}>{c.remove}</button>
                  </div>
                </div>
              </li>
            ))}
            {items.length === 0 && (
              <li style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-2)' }}>
                {c.empty} <Link href="/shop">{c.chooseProducts}</Link>
              </li>
            )}
          </ul>

          <aside className="split__side panel panel--md">
            <h2 className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>{c.summary}</h2>
            <div className="stack" style={{ marginTop: 16, fontSize: 15 }}>
              <div className="sum-row"><span>{c.subtotalCount(count)}</span><span>{baht(subtotal)}</span></div>
              <div className="sum-row"><span>{c.shippingWeight(kg)}</span><span>{baht(shipping)}</span></div>
            </div>
            <table className="ship-table">
              <caption>{c.ratesCaption}</caption>
              <tbody>
                {tiers.map((x, i) => (
                  <tr key={i} data-current={i === tier}>
                    <td>{tierRange(tiers, i, t.shippingTiers)}</td>
                    <td style={{ textAlign: 'right' }}>{baht(x.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="sum-row divider-top" style={{ marginTop: 16, paddingTop: 14, alignItems: 'baseline' }}>
              <span className="strong" style={{ fontSize: 16 }}>{c.grandTotal}</span>
              <span className="num-display" style={{ fontSize: 30 }}>{baht(total)}</span>
            </div>
            {items.length > 0 ? (
              <Link href="/checkout" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 18 }}>{c.checkout}</Link>
            ) : (
              <button type="button" className="btn btn--primary btn--lg btn--block" style={{ marginTop: 18, opacity: 0.4 }} disabled>{c.checkout}</button>
            )}
            <p className="small" style={{ marginTop: 12 }}>{c.transferOnly}</p>
          </aside>
        </div>

        {crossSell.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2 className="num-display" style={{ fontWeight: 300, fontSize: 28 }}>{c.crossSell}</h2>
            <div className="auto-fill" style={css({ marginTop: 16 })}>
              {crossSell.map((p) => <MiniProductCard key={p.slug} p={p} />)}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
