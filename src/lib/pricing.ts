import { quoteCustomSize } from './customSize';
import type { Product, ShopSettings } from './types';

/** What the cart sends to the server for each line. Prices are recomputed server-side. */
export interface CartLineInput {
  slug: string;
  qty: number;
  color?: number;
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
export function priceLine(line: CartLineInput, product: Product | undefined, settings: ShopSettings): PricedLine | null {
  if (line.custom) {
    const { w, l, h } = line.custom;
    const q = quoteCustomSize(w, l, h);
    if (!q.ok) return null;
    const color = ['ฟ้า', 'ส้ม', 'ผสม'][line.color ?? 0] ?? 'ฟ้า';
    return { slug: CUSTOM_SLUG, name: `${q.model} สั่งทำ`, opt: `${w}×${l}×${h} cm · ${color}`, unitPrice: q.price, kg: CUSTOM_KG, status: 'ผลิตตามสั่ง · 28-35 วัน' };
  }
  if (!product || !product.visible || product.comingSoon || product.custom) return null;
  const magnets = product.magnets ? Math.max(0, Math.min(settings.maxMagnets, Math.floor(line.magnets ?? 0))) : 0;
  const color = product.colors.length ? product.colors[Math.max(0, Math.min(product.colors.length - 1, line.color ?? 0))] : null;
  const opt = [color?.label, magnets ? `แม่เหล็ก ${magnets} ชิ้น` : null].filter(Boolean).join(' · ') || '—';
  const status =
    product.stock === 'preorder' ? 'พรีออเดอร์ · 28-35 วัน' : product.colors.length && product.cat === 'sb' ? 'พร้อมส่ง · ทำผิวยาง 3-5 วัน' : 'พร้อมส่ง';
  return { slug: product.slug, name: product.name, opt, unitPrice: product.price + magnets * settings.magnetPrice, kg: product.kg, status };
}
