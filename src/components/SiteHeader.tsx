'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { BagIcon, CloseIcon, MenuIcon } from './Icons';
import { Logo } from './Logo';
import './SiteHeader.css';

const NAV = [
  { to: '/shop?cat=sb', label: 'Strength & Balance' },
  { to: '/shop?cat=ip', label: 'Interactive Play' },
  { to: '/shop?cat=tug', label: 'Tug Toys' },
  { to: '/custom', label: 'สั่งทำ' },
  { to: '/business', label: 'สำหรับธุรกิจ' },
  { to: '/track', label: 'ติดตามออร์เดอร์' },
];

interface Props {
  /**
   * store   – language, cart and menu (storefront pages)
   * simple  – logo plus an optional right-hand slot (cart, checkout, order pages)
   */
  variant?: 'store' | 'simple';
  /** Always show the category nav row (home page). */
  showNav?: boolean;
  sticky?: boolean;
  /** Replaces the cart + menu buttons in the store variant, or fills the right side of the simple variant. */
  right?: ReactNode;
}

export function SiteHeader({ variant = 'store', showNav = false, sticky = true, right }: Props) {
  const { count, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navVisible = showNav || menuOpen;

  return (
    <header className={`site-header${sticky ? ' site-header--sticky' : ''}`}>
      <div className={`container site-header__bar${variant === 'store' ? ' site-header__bar--store' : ''}`}>
        <Logo />
        {variant === 'store' ? (
          <>
            <button type="button" className="site-header__lang" aria-label="เปลี่ยนภาษาเป็นอังกฤษ">
              <b>TH</b> <span>/ EN</span>
            </button>
            {right ?? (
              <>
                <button type="button" className="icon-btn" aria-label={`ตะกร้า มี ${count} ชิ้น`} onClick={openDrawer}>
                  <BagIcon />
                  {count > 0 && <span className="site-header__badge">{count}</span>}
                </button>
                {!showNav && (
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    {menuOpen ? <CloseIcon /> : <MenuIcon />}
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          right
        )}
      </div>
      {variant === 'store' && navVisible && (
        <nav aria-label="หมวดสินค้า" className="container site-header__nav">
          {NAV.map((n) => (
            <Link key={n.label} href={n.to} onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
