'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SIZES } from '../data/sizes';
import { categoryLabel, productHref, type Product } from '../data/products';
import { useI18n } from '../i18n/LocaleProvider';
import './ProductTile.css';

export function ProductTile({ p }: { p: Product }) {
  const { t } = useI18n();
  return (
    <Link href={productHref(p)} className="product-tile">
      <div className="product-tile__media tile-bg">
        {p.img && (
          <Image
            src={p.img}
            alt={p.name}
            fill
            sizes={SIZES.tile}
            className={p.cover ? 'product-tile__img--cover' : 'product-tile__img--cutout cutout'}
          />
        )}
        {p.comingSoon && <span className="product-tile__soon">{t.shop.comingSoon}</span>}
        {p.badge && <span className="tag tag--white product-tile__badge">{p.badge}</span>}
      </div>
      <div className="product-tile__body">
        <span className="product-tile__group">{categoryLabel(p.cat)}</span>
        <span className="product-tile__name">{p.name}</span>
        <span className="product-tile__th">{p.th}</span>
        <span className="product-tile__price">{p.priceLabel}</span>
        {p.colors.length > 0 && (
          <div className="product-tile__swatches" aria-label={p.swatchesLabel}>
            {p.colors.map((c) => (
              <span key={c.label} className="swatch swatch--sm" style={{ background: c.swatch }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/** Compact card used in "ใช้ร่วมกันได้" / cross-sell rows. */
export function MiniProductCard({ p }: { p: Product }) {
  return (
    <Link href={productHref(p)} className="mini-card">
      <div className="tile-bg mini-card__media">
        {p.img && <Image src={p.img} alt={p.name} fill sizes="200px" className="cutout" />}
      </div>
      <span className="mini-card__name">{p.name}</span>
      <span className="mini-card__price">{p.priceLabel}</span>
    </Link>
  );
}
