'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ProductTile } from '../components/ProductTile';
import { SiteHeader } from '../components/SiteHeader';
import { img } from '../data/images';
import { CATEGORIES, type CategoryId, type Product } from '../data/products';
import { SIZES } from '../data/sizes';
import { useI18n } from '../i18n/LocaleProvider';
import './ShopPage.css';

type Sort = 'featured' | 'asc' | 'desc';

export function ShopPage({ cat, products }: { cat: CategoryId | 'all'; products: Product[] }) {
  const { t } = useI18n();
  const s = t.shop;
  const router = useRouter();
  const [sort, setSort] = useState<Sort>('featured');

  const list = useMemo(() => {
    const filtered = products.filter((p) => cat === 'all' || p.cat === cat);
    if (sort === 'featured') return filtered;
    // Coming-soon items have no price; keep them last.
    return [...filtered].sort((a, b) => {
      if (a.comingSoon !== b.comingSoon) return a.comingSoon ? 1 : -1;
      return sort === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }, [cat, sort, products]);

  const chips: { id: CategoryId | 'all'; label: string }[] = [{ id: 'all', label: s.all }, ...CATEGORIES];

  return (
    <>
      <SiteHeader activeCat={cat} />
      <main className="container" style={{ paddingTop: 36, paddingBottom: 80 }}>
        <h1 className="display">{s.title}</h1>
        <p className="lead" style={{ marginTop: 12, maxWidth: 560, fontSize: 16, lineHeight: 1.7 }}>{s.lead}</p>

        <div role="group" aria-label={s.filterAria} className="shop-filters">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={c.id === cat}
              onClick={() => router.replace(c.id === 'all' ? '/shop' : `/shop?cat=${c.id}`, { scroll: false })}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="row-between muted" style={{ marginTop: 14, fontSize: 14 }}>
          <span>{s.count(list.length)}</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {s.sortBy}
            <select className="input" style={{ height: 44, width: 'auto', fontSize: 14 }} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">{s.sortFeatured}</option>
              <option value="asc">{s.sortAsc}</option>
              <option value="desc">{s.sortDesc}</option>
            </select>
          </label>
        </div>

        <div className="shop-grid">
          {list.map((p) => (
            <ProductTile key={p.slug} p={p} />
          ))}
        </div>

        <Link href="/custom" className="on-dark shop-custom">
          <Image src={img.jumpBox} alt={s.customAlt} sizes={SIZES.half} />
          <div className="shop-custom__body">
            <p className="num-display" style={{ fontWeight: 300, fontSize: 30, lineHeight: 1.2 }}>{s.customTitle}</p>
            <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: 'var(--on-dark-2)' }}>{s.customBody}</p>
            <span className="btn btn--light btn--sm" style={{ marginTop: 16, height: 48, padding: '0 24px', fontSize: 16 }}>{s.customCta}</span>
          </div>
        </Link>
      </main>
    </>
  );
}
