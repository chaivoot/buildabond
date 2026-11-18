import type { Locale } from '../i18n/config';
import type { Dict } from '../i18n/th';
import type { CartLineInput } from './pricing';
import { colorLabel } from './productText';
import type { Product } from './types';

/** A cart line. Stored without language-specific text so it can be shown in either language. */
export interface CartItem extends CartLineInput {
  id: string;
  /** Product name, or the model ("Jump Box") for made-to-measure items */
  name: string;
  img: string;
  unitPrice: number;
  kg: number;
  /** Thai colour label, translated when shown */
  colorTh?: string;
  /** Size label in Thai and English (English may be empty) */
  sizeTh?: string;
  sizeEn?: string;
  kind: 'readyFinish' | 'ready' | 'preorder' | 'custom';
}

export const stockKind = (p: Product): CartItem['kind'] =>
  p.stock === 'preorder' ? 'preorder' : p.colors.length && p.cat === 'sb' ? 'readyFinish' : 'ready';

export const itemName = (i: CartItem, t: Dict) => (i.kind === 'custom' ? t.cart.customName(i.name) : i.name);

export function itemOptions(i: CartItem, lang: Locale, t: Dict): string {
  const parts = [
    i.custom ? `${i.custom.w}×${i.custom.l}×${i.custom.h} cm` : null,
    i.sizeTh ? (lang === 'en' && i.sizeEn ? i.sizeEn : i.sizeTh) : null,
    i.colorTh ? colorLabel(i.colorTh, lang) : null,
    i.magnets ? t.product.magnetsShort(i.magnets) : null,
  ].filter(Boolean);
  return parts.join(' · ') || '—';
}

export const itemStatus = (i: CartItem, t: Dict) => t.cart.status[i.kind];

const isCartItem = (v: unknown): v is CartItem => {
  const o = v as CartItem;
  return !!o && typeof o.id === 'string' && typeof o.slug === 'string' && typeof o.qty === 'number' && typeof o.unitPrice === 'number';
};

export const parseCart = (raw: string | null): CartItem[] | null => {
  try {
    const v = JSON.parse(raw ?? '');
    return Array.isArray(v) && v.every(isCartItem) ? v : null;
  } catch {
    return null;
  }
};
