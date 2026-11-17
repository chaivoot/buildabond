import type { CategoryId, ColorOption, Product, ProductDetail, ProductText, StockStatus } from '../lib/types';
import { sql, toJson } from './db';

interface Row {
  slug: string; sort: number; cat: string; name: string; th: string; price_label: string; price: number; kg: number; img: string;
  cover: boolean; badge: string; coming_soon: boolean; custom: boolean; colors: ColorOption[]; colors_label: string;
  swatches_label: string; magnets: boolean; magnet_count: number; sku: string; stock: string; visible: boolean; detail: ProductDetail; en: ProductText;
}

const fromRow = (r: Row): Product => ({
  slug: r.slug, sort: r.sort, cat: r.cat as CategoryId, name: r.name, th: r.th, priceLabel: r.price_label, price: r.price,
  kg: Number(r.kg), img: r.img, cover: r.cover, badge: r.badge, comingSoon: r.coming_soon, custom: r.custom,
  colors: r.colors ?? [], colorsLabel: r.colors_label, swatchesLabel: r.swatches_label, magnets: r.magnets, magnetCount: Number(r.magnet_count ?? 0), sku: r.sku,
  stock: r.stock as StockStatus, visible: r.visible, detail: r.detail ?? {}, en: r.en ?? {},
});

export async function listProducts({ includeHidden = false } = {}): Promise<Product[]> {
  const rows = await sql<Row>(`SELECT * FROM products ${includeHidden ? '' : 'WHERE visible'} ORDER BY sort, name`);
  return rows.map(fromRow);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const rows = await sql<Row>(`SELECT * FROM products WHERE slug = $1`, [slug]);
  return rows[0] ? fromRow(rows[0]) : null;
}

/** Products with their own product page (not coming-soon, not made-to-measure). */
export const isSellable = (p: Product | null | undefined): p is Product => !!p && p.visible && !p.comingSoon && !p.custom;

export async function upsertProduct(p: Product, previousSlug?: string): Promise<void> {
  const params = [p.slug, p.sort, p.cat, p.name, p.th, p.priceLabel, p.price, p.kg, p.img, p.cover, p.badge, p.comingSoon, p.custom,
    toJson(p.colors), p.colorsLabel, p.swatchesLabel, p.magnets, p.sku, p.stock, p.visible, toJson(p.detail), toJson(p.en ?? {}), Math.max(0, Math.floor(p.magnetCount || 0))];
  if (previousSlug && previousSlug !== p.slug) {
    await sql(`UPDATE products SET slug = $1 WHERE slug = $2`, [p.slug, previousSlug]);
  }
  await sql(
    `INSERT INTO products (slug, sort, cat, name, th, price_label, price, kg, img, cover, badge, coming_soon, custom, colors,
      colors_label, swatches_label, magnets, sku, stock, visible, detail, en, magnet_count)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
     ON CONFLICT (slug) DO UPDATE SET sort = EXCLUDED.sort, cat = EXCLUDED.cat, name = EXCLUDED.name, th = EXCLUDED.th,
      price_label = EXCLUDED.price_label, price = EXCLUDED.price, kg = EXCLUDED.kg, img = EXCLUDED.img, cover = EXCLUDED.cover,
      badge = EXCLUDED.badge, coming_soon = EXCLUDED.coming_soon, custom = EXCLUDED.custom, colors = EXCLUDED.colors,
      colors_label = EXCLUDED.colors_label, swatches_label = EXCLUDED.swatches_label, magnets = EXCLUDED.magnets, magnet_count = EXCLUDED.magnet_count, sku = EXCLUDED.sku,
      stock = EXCLUDED.stock, visible = EXCLUDED.visible, detail = EXCLUDED.detail, en = EXCLUDED.en, updated_at = now()`,
    params,
  );
}

export async function deleteProduct(slug: string): Promise<void> {
  await sql(`DELETE FROM products WHERE slug = $1`, [slug]);
}
