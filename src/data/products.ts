import type { CategoryId, Product } from '../lib/types';

export type { CategoryId, ColorOption, Product } from '../lib/types';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'sb', label: 'Strength & Balance' },
  { id: 'ip', label: 'Interactive Play' },
  { id: 'tug', label: 'Tug Toys' },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

/**
 * Shop pages / menu groups. Tug toys and interactive play share one page, tug first, so someone shopping
 * for a tug toy scrolls on into the flirt pole. Old links (?cat=ip / ?cat=tug) open the shared page.
 */
export type ShopFilter = 'sb' | 'play';
export const SHOP_FILTERS: { id: ShopFilter; label: string; cats: CategoryId[] }[] = [
  { id: 'sb', label: 'Strength & Balance', cats: ['sb'] },
  { id: 'play', label: 'Tug & Interactive Toys', cats: ['tug', 'ip'] },
];
export const filterForCategory = (c: CategoryId): ShopFilter => (c === 'sb' ? 'sb' : 'play');
/** ?cat= value → shop page; unknown values show everything. */
export function parseShopFilter(raw: string | undefined): ShopFilter | 'all' {
  if (raw === 'sb' || raw === 'play') return raw;
  if (raw === 'ip' || raw === 'tug') return 'play';
  return 'all';
}

export function productHref(p: Product): string {
  if (p.custom) return '/custom';
  if (p.comingSoon) return '/shop';
  return `/products/${p.slug}`;
}
