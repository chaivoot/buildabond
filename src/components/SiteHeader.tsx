'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useCart } from '../context/CartContext';
import { LANG_COOKIE } from '../i18n/config';
import { useI18n } from '../i18n/LocaleProvider';
import { BagIcon, CloseIcon, MenuIcon } from './Icons';
import { Logo } from './Logo';
import './SiteHeader.css';

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

/** TH / EN switch. URLs don't carry the language, so it's stored in a cookie and the page reloads. */
export function LangToggle() {
  const { lang, t } = useI18n();
  const next = lang === 'th' ? 'en' : 'th';
  const switchLang = () => {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  };
  return (
    <button type="button" className="site-header__lang" aria-label={t.common.switchLang} lang={next} onClick={switchLang}>
      <span data-on={lang === 'th'}>TH</span> / <span data-on={lang === 'en'}>EN</span>
    </button>
  );
}

export function SiteHeader({ variant = 'store', showNav = false, sticky = true, right }: Props) {
  const { t } = useI18n();
  const { count, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navVisible = showNav || menuOpen;
  const nav = [
    { to: '/shop?cat=sb', label: 'Strength & Balance' },
    { to: '/shop?cat=ip', label: 'Interactive Play' },
    { to: '/shop?cat=tug', label: 'Tug Toys' },
    { to: '/custom', label: t.common.navCustom },
    { to: '/business', label: t.common.navBusiness },
    { to: '/track', label: t.common.navTrack },
  ];

  return (
    <header className={`site-header${sticky ? ' site-header--sticky' : ''}`}>
      <div className={`container site-header__bar${variant === 'store' ? ' site-header__bar--store' : ''}`}>
        <Logo />
        {variant === 'store' ? (
          <>
            <LangToggle />
            {right ?? (
              <>
                <button type="button" className="icon-btn" aria-label={t.common.cartAria(count)} onClick={openDrawer}>
                  <BagIcon />
                  {count > 0 && <span className="site-header__badge">{count}</span>}
                </button>
                {!showNav && (
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangToggle />
            {right}
          </div>
        )}
      </div>
      {variant === 'store' && navVisible && (
        <nav aria-label={t.common.categoriesNav} className="container site-header__nav">
          {nav.map((n) => (
            <Link key={n.to} href={n.to} onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
