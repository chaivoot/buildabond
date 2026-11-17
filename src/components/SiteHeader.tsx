'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCart } from '../context/CartContext';
import { LANG_COOKIE } from '../i18n/config';
import { useI18n } from '../i18n/LocaleProvider';
import { BagIcon } from './Icons';
import { Logo } from './Logo';
import './SiteHeader.css';

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

/**
 * The storefront header, the same on every page: logo, language, cart and the category bar.
 * It stays at the top while scrolling (height: --header-full in global.css).
 * `extra` adds a page-specific action next to the cart (e.g. "Contact sales").
 * `activeCat` highlights a category link (the shop page passes its current filter).
 */
export function SiteHeader({ extra, activeCat }: { extra?: ReactNode; activeCat?: string } = {}) {
  const { t } = useI18n();
  const { count, openDrawer } = useCart();
  const path = usePathname();
  // Middleware serves /th/... and /en/... behind clean URLs; ignore an explicit prefix when matching.
  const current = path.replace(/^\/(en|th)(?=\/|$)/, '') || '/';
  const nav = [
    { to: '/shop?cat=sb', label: 'Strength & Balance', active: activeCat === 'sb' },
    { to: '/shop?cat=ip', label: 'Interactive Play', active: activeCat === 'ip' },
    { to: '/shop?cat=tug', label: 'Tug Toys', active: activeCat === 'tug' },
    { to: '/custom', label: t.common.navCustom, active: current === '/custom' },
    { to: '/business', label: t.common.navBusiness, active: current === '/business' },
    { to: '/track', label: t.common.navTrack, active: current === '/track' },
  ];

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Logo />
        <LangToggle />
        {extra}
        <button type="button" className="icon-btn" aria-label={t.common.cartAria(count)} onClick={openDrawer}>
          <BagIcon />
          {count > 0 && <span className="site-header__badge">{count}</span>}
        </button>
      </div>
      <nav aria-label={t.common.categoriesNav} className="container site-header__nav">
        {nav.map((n) => (
          <Link key={n.to} href={n.to} aria-current={n.active ? 'page' : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
