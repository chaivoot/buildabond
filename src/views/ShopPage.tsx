'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ProductTile } from '../components/ProductTile';
import { SiteHeader } from '../components/SiteHeader';
import { img } from '../data/images';
import { CATEGORIES, SHOP_FILTERS, type ShopFilter, type Product } from '../data/products';
import { SIZES } from '../data/sizes';
import { useI18n } from '../i18n/LocaleProvider';
import './ShopPage.css';

type Sort = 'featured' | 'asc' | 'desc';

export function ShopPage({ cat, products }: { cat: ShopFilter | 'all'; products: Product[] }) {
  const { t } = useI18n();
  const s = t.shop;
  const router = useRouter();
  const [sort, setSort] = useState<Sort>('featured');

  const list = useMemo(() => {
    const group = SHOP_FILTERS.find((f) => f.id === cat);
    const filtered = products.filter((p) => !group || group.cats.includes(p.cat));
    // Featured order follows the group's category order (tug toys before interactive play).
    if (sort === 'featured') return group ? group.cats.flatMap((c) => filtered.filter((p) => p.cat === c)) : filtered;
    // Coming-soon items have no price; keep them last.
    return [...filtered].sort((a, b) => {
      if (a.comingSoon !== b.comingSoon) return a.comingSoon ? 1 : -1;
      return sort === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }, [cat, sort, products]);

  const chips: { id: ShopFilter | 'all'; label: string }[] = [{ id: 'all', label: s.all }, ...SHOP_FILTERS];
  const group = SHOP_FILTERS.find((f) => f.id === cat);
  // On a shared page, label each category's run of products (only in featured order, where they're grouped).
  const sections = group && group.cats.length > 1 && sort === 'featured' ? group.cats.map((c) => ({ c, items: list.filter((p) => p.cat === c) })).filter((x) => x.items.length) : null;

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

        {sections ? (
          sections.map(({ c, items }) => (
            <section key={c} aria-labelledby={`shop-sec-${c}`}>
              <h2 id={`shop-sec-${c}`} className="shop-section-title">{CATEGORIES.find((x) => x.id === c)?.label}</h2>
              <div className="shop-grid" style={{ marginTop: 14 }}>
                {items.map((p) => <ProductTile key={p.slug} p={p} />)}
              </div>
            </section>
          ))
        ) : (
          <div className="shop-grid">
            {list.map((p) => (
              <ProductTile key={p.slug} p={p} />
            ))}
          </div>
        )}

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
