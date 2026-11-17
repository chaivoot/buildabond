'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useShopSettings } from '../context/SettingsContext';
import { baht } from '../data/format';
import { useI18n } from '../i18n/LocaleProvider';
import { itemName, itemOptions, itemStatus } from '../lib/cartItem';
import { tierShort } from '../lib/shipping';
import { CloseIcon } from './Icons';
import { QtyStepper } from './QtyStepper';
import './CartDrawer.css';

export function CartDrawer() {
  const { lang, t } = useI18n();
  const { drawerOpen, closeDrawer, items, count, kg, tier, shipping, subtotal, total, setQty } = useCart();
  const { shipping: tiers } = useShopSettings();
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
      <button type="button" className="cart-drawer__scrim" aria-label={t.cart.closeCart} tabIndex={-1} onClick={closeDrawer} />
      <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="cart-drawer__panel">
        <div className="cart-drawer__head">
          <h2 id="cart-title">
            {t.cart.title} <span>{t.cart.items(count)}</span>
          </h2>
          <button ref={closeRef} type="button" className="icon-btn" aria-label={t.common.close} onClick={closeDrawer}>
            <CloseIcon />
          </button>
        </div>

        <div className="cart-drawer__ship">
          <div className="sum-row">
            <span>{t.cart.weight(kg)}</span>
            <span className="strong">{t.cart.shippingFee(baht(shipping))}</span>
          </div>
          <div className="cart-drawer__tiers" aria-hidden="true">
            {tiers.map((_, i) => (
              <div key={i}>
                <span className="cart-drawer__tier-bar" data-on={i <= tier} />
                <span className="cart-drawer__tier-label" data-current={i === tier}>{tierShort(tiers, i, t.shippingTiers)}</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="cart-drawer__list">
          {items.length === 0 && <li className="cart-drawer__empty">{t.cart.empty}</li>}
          {items.map((it) => (
            <li key={it.id} className="cart-drawer__item">
              <Image src={it.img} alt="" width={76} height={76} />
              <div className="cart-drawer__info">
                <span className="cart-drawer__name">{itemName(it, t)}</span>
                <span className="small">{itemOptions(it, lang, t)}</span>
                <span className="cart-drawer__status">{itemStatus(it, t).split(' · ')[0]}</span>
                <div className="row-between" style={{ marginTop: 6 }}>
                  <QtyStepper size="sm" value={it.qty} onChange={(v) => setQty(it.id, v)} />
                  <span className="strong">{baht(it.unitPrice * it.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-drawer__foot">
          <div className="sum-row muted" style={{ fontSize: 14 }}><span>{t.cart.subtotal}</span><span>{baht(subtotal)}</span></div>
          <div className="sum-row muted" style={{ fontSize: 14 }}><span>{t.cart.shipping}</span><span>{baht(shipping)}</span></div>
          <div className="sum-row cart-drawer__total"><span>{t.cart.total}</span><span>{baht(total)}</span></div>
          <Link href="/checkout" className="btn btn--primary btn--block" style={{ marginTop: 6, height: 52 }} onClick={closeDrawer}>
            {t.cart.checkout}
          </Link>
          <Link href="/cart" className="btn btn--ghost btn--block btn--sm" style={{ fontSize: 15 }} onClick={closeDrawer}>
            {t.cart.viewFull}
          </Link>
        </div>
      </aside>
    </div>
  );
}
