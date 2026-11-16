import type { CategoryId, Product } from '../lib/types';

export type { CategoryId, ColorOption, Product } from '../lib/types';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'sb', label: 'Strength & Balance' },
  { id: 'ip', label: 'Interactive Play' },
  { id: 'tug', label: 'Tug Toys' },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function productHref(p: Product): string {
  if (p.custom) return '/custom';
  if (p.comingSoon) return '/shop';
  return `/products/${p.slug}`;
}
