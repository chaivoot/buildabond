import Image from 'next/image';
import { SIZES } from '../data/sizes';
import Link from 'next/link';
import { categoryLabel, productHref, type Product } from '../data/products';
import './ProductTile.css';

export function ProductTile({ p }: { p: Product }) {
  return (
    <Link href={productHref(p)} className="product-tile">
      <div className="product-tile__media tile-bg">
        {p.img && (
          <Image
            sizes={SIZES.tile}
            src={p.img}
            alt={p.name}
            className={p.cover ? 'product-tile__img--cover' : 'product-tile__img--cutout cutout'}
          />
        )}
        {p.comingSoon && <span className="product-tile__soon">เร็ว ๆ นี้</span>}
        {p.badge && <span className="tag tag--white product-tile__badge">{p.badge}</span>}
      </div>
      <div className="product-tile__body">
        <span className="product-tile__group">{categoryLabel(p.cat)}</span>
        <span className="product-tile__name">{p.name}</span>
        <span className="product-tile__th">{p.th}</span>
        <span className="product-tile__price">{p.priceLabel}</span>
        {p.colors && (
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
        <Image src={p.img!} alt={p.name} className="cutout" sizes="200px" />
      </div>
      <span className="mini-card__name">{p.name}</span>
      <span className="mini-card__price">{p.priceLabel}</span>
    </Link>
  );
}
