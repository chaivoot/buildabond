import { quoteCustomSize } from './customSize';
import type { Product, ShopSettings } from './types';

/** What the cart sends to the server for each line. Prices are recomputed server-side. */
export interface CartLineInput {
  slug: string;
  qty: number;
  color?: number;
  /** Index into product.detail.sizes */
  size?: number;
  /** Magnets chosen: any positive number means "yes"; the count always comes from the product. */
  magnets?: number;
  /** Made-to-measure dimensions in cm */
  custom?: { w: number; l: number; h: number };
}

export const CUSTOM_KG = 6; // TODO: confirm made-to-measure weights
export const CUSTOM_SLUG = 'custom';

export interface PricedLine {
  slug: string;
  name: string;
  opt: string;
  unitPrice: number;
  kg: number;
  status: string;
}

/** Price one cart line from the catalogue. Returns null if it can't be sold. */
/** `allowSoldOut`: admin-entered orders may still use an option marked sold out. */
export function priceLine(line: CartLineInput, product: Product | undefined, settings: ShopSettings, opts: { allowSoldOut?: boolean } = {}): PricedLine | null {
  if (line.custom) {
    const { w, l, h } = line.custom;
    const q = quoteCustomSize(w, l, h);
    if (!q.ok) return null;
    const color = ['ฟ้า', 'ส้ม', 'ผสม'][line.color ?? 0] ?? 'ฟ้า';
    return { slug: CUSTOM_SLUG, name: `${q.model} สั่งทำ`, opt: `${w}×${l}×${h} cm · ${color}`, unitPrice: q.price, kg: CUSTOM_KG, status: 'ผลิตตามสั่ง · 28-35 วัน' };
  }
  if (!product || !product.visible || product.comingSoon || product.custom) return null;
  const magnets = product.magnets && (line.magnets ?? 0) > 0 ? Math.max(0, Math.floor(product.magnetCount)) : 0;
  const color = product.colors.length ? product.colors[Math.max(0, Math.min(product.colors.length - 1, line.color ?? 0))] : null;
  const size = pickSize(product, line.size);
  if (!opts.allowSoldOut && (size?.soldOut || (color && isColorSoldOut(product, color)))) return null;
  const opt = [size?.label, color?.label, magnets ? `แม่เหล็ก ${magnets} ชิ้น` : null].filter(Boolean).join(' · ') || '—';
  const status =
    product.stock === 'preorder' ? 'พรีออเดอร์ · 28-35 วัน' : product.colors.length && product.cat === 'sb' ? 'พร้อมส่ง · ทำผิวยาง 3-5 วัน' : 'พร้อมส่ง';
  const base = size ? size.price : product.price;
  return { slug: product.slug, name: product.name, opt, unitPrice: base + magnets * settings.magnetPrice, kg: size ? size.kg : product.kg, status };
}

/** The chosen size, clamped to the product's list; null when the product has no sizes. */
export function pickSize(product: Product, index: number | undefined) {
  const sizes = product.detail.sizes ?? [];
  if (!sizes.length) return null;
  return sizes[Math.max(0, Math.min(sizes.length - 1, Math.floor(Number(index) || 0)))];
}

/** A colour marked out of stock in the admin (matched by its Thai label). */
export const isColorSoldOut = (product: Product, color: { label: string; labelTh?: string }) =>
  (product.detail.soldOutColors ?? []).includes(color.labelTh ?? color.label);

/** First option that isn't sold out (0 if all are). */
export function firstAvailable<T>(items: T[], soldOut: (t: T) => boolean): number {
  const i = items.findIndex((t) => !soldOut(t));
  return i < 0 ? 0 : i;
}
