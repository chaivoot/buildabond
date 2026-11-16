'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { SHIPPING_TIERS } from '../data/shipping';
import { CloseIcon } from './Icons';
import { QtyStepper } from './QtyStepper';
import './CartDrawer.css';

export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, count, kg, tier, shipping, subtotal, total, setQty } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="cart-drawer">
      <button type="button" className="cart-drawer__scrim" aria-label="ปิดตะกร้า" tabIndex={-1} onClick={closeDrawer} />
      <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="cart-drawer__panel">
        <div className="cart-drawer__head">
          <h2 id="cart-title">
            ตะกร้า <span>({count} ชิ้น)</span>
          </h2>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="ปิด" onClick={closeDrawer}>
            <CloseIcon />
          </button>
        </div>

        <div className="cart-drawer__ship">
          <div className="sum-row">
            <span>น้ำหนักรวมประมาณ {kg} กก.</span>
            <span className="strong">ค่าส่ง {baht(shipping)}</span>
          </div>
          <div className="cart-drawer__tiers" aria-hidden="true">
            {SHIPPING_TIERS.map((t, i) => (
              <div key={t.short}>
                <span className="cart-drawer__tier-bar" data-on={i <= tier} />
                <span className="cart-drawer__tier-label" data-current={i === tier}>{t.short}</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="cart-drawer__list">
          {items.length === 0 && <li className="cart-drawer__empty">ตะกร้ายังว่าง</li>}
          {items.map((it) => (
            <li key={it.id} className="cart-drawer__item">
              <Image src={it.img} alt="" sizes="76px" />
              <div className="cart-drawer__info">
                <span className="cart-drawer__name">{it.name}</span>
                <span className="small">{it.opt}</span>
                <span className="cart-drawer__status">{it.status.split(' · ')[0]}</span>
                <div className="row-between" style={{ marginTop: 6 }}>
                  <QtyStepper size="sm" value={it.qty} onChange={(v) => setQty(it.id, v)} />
                  <span className="strong">{baht(it.unitPrice * it.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-drawer__foot">
          <div className="sum-row muted" style={{ fontSize: 14 }}><span>ยอดสินค้า</span><span>{baht(subtotal)}</span></div>
          <div className="sum-row muted" style={{ fontSize: 14 }}><span>ค่าส่ง</span><span>{baht(shipping)}</span></div>
          <div className="sum-row cart-drawer__total"><span>รวม</span><span>{baht(total)}</span></div>
          <Link href="/checkout" className="btn btn--primary btn--block" style={{ marginTop: 6, height: 52 }} onClick={closeDrawer}>
            ไปชำระเงิน
          </Link>
          <Link href="/cart" className="btn btn--ghost btn--block btn--sm" style={{ fontSize: 15 }} onClick={closeDrawer}>
            ดูตะกร้าแบบเต็ม
          </Link>
        </div>
      </aside>
    </div>
  );
}
