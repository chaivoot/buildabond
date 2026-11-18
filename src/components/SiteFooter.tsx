'use client';

import Link from 'next/link';
import { SOCIAL } from '../data/social';
import { css } from '../data/style';
import { useI18n } from '../i18n/LocaleProvider';

export function SiteFooter() {
  const { t } = useI18n();
  const f = t.footer;
  return (
    <footer className="on-dark">
      <div className="container" style={{ paddingTop: 72, paddingBottom: 40, paddingInline: 20 }}>
        <p className="display" lang="en" style={{ fontSize: 'clamp(34px, 7vw, 64px)', lineHeight: 1.1, letterSpacing: 0 }}>
          Build a Bond.
          <br />
          Move, Play &amp; Grow Together.
        </p>
        <div className="auto-grid footer-cols" style={css({ '--min': '150px', '--gap': '28px', marginTop: 48, fontSize: 15 })}>
          <div className="footer-col">
            <p>{f.products}</p>
            <Link href="/shop?cat=sb">Strength &amp; Balance</Link>
            <Link href="/shop?cat=ip">Interactive Play</Link>
            <Link href="/shop?cat=tug">Tug Toys</Link>
            <Link href="/custom">{f.customSize}</Link>
          </div>
          <div className="footer-col">
            <p>{f.help}</p>
            <Link href="/track">{f.track}</Link>
            <Link href="/products/place-board#faq">{f.shipping}</Link>
            <Link href="/business">{f.business}</Link>
            <Link href="/privacy">{f.privacy}</Link>
          </div>
          <div className="footer-col">
            <p>{f.contact}</p>
            <a href={SOCIAL.line} target="_blank" rel="noopener noreferrer">LINE</a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        <p style={{ marginTop: 48, fontSize: 13, color: 'var(--on-dark-3)' }}>© 2026 Buildabond Active Play &amp; Fitness · dev by{' '}
          <a href="https://dogsanook.com" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>
            DogSanook
          </a>
        </p>
      </div>
    </footer>
  );
}
