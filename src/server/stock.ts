/**
 * Stock counts, admin-only for now (the storefront doesn't read them).
 * Kept in their own table, not in the product row, so a product save from an editor opened earlier
 * can't overwrite counts that orders have since taken off. Variants with no row aren't tracked.
 */
import type { OrderItem } from '../lib/types';
import { sql } from './db';

export type StockMap = Record<string, Record<string, number>>; // slug → variant → qty

export async function listStock(slug?: string): Promise<StockMap> {
  const rows = await sql<{ slug: string; variant: string; qty: number }>(
    slug ? `SELECT slug, variant, qty FROM stock_levels WHERE slug = $1` : `SELECT slug, variant, qty FROM stock_levels`,
    slug ? [slug] : [],
  );
  const out: StockMap = {};
  for (const r of rows) (out[r.slug] ??= {})[r.variant] = Number(r.qty);
  return out;
}

/** Sets counts typed in the admin. null stops tracking that variant. */
export async function setStock(slug: string, changes: Record<string, number | null>): Promise<void> {
  for (const [variant, qty] of Object.entries(changes)) {
    if (qty === null) {
      await sql(`DELETE FROM stock_levels WHERE slug = $1 AND variant = $2`, [slug, variant]);
      continue;
    }
    const before = await sql<{ qty: number }>(`SELECT qty FROM stock_levels WHERE slug = $1 AND variant = $2`, [slug, variant]);
    await sql(
      `INSERT INTO stock_levels (slug, variant, qty) VALUES ($1, $2, $3)
       ON CONFLICT (slug, variant) DO UPDATE SET qty = EXCLUDED.qty, updated_at = now()`,
      [slug, variant, qty],
    );
    const change = qty - Number(before[0]?.qty ?? 0);
    if (change) await sql(`INSERT INTO stock_log (slug, variant, change, qty_after, reason) VALUES ($1, $2, $3, $4, 'แก้ในหลังบ้าน')`, [slug, variant, change, qty]);
  }
}

/** Takes items off stock (sign -1, an order) or puts them back (+1, a cancellation). Untracked variants are skipped. */
export async function moveStock(items: OrderItem[], sign: 1 | -1, reason: string, orderId: string): Promise<void> {
  for (const i of items) {
    if (!i.variant || !i.slug) continue;
    const delta = sign * i.qty;
    const rows = await sql<{ qty: number }>(
      `UPDATE stock_levels SET qty = qty + $3, updated_at = now() WHERE slug = $1 AND variant = $2 RETURNING qty`,
      [i.slug, i.variant, delta],
    );
    if (rows.length) {
      await sql(`INSERT INTO stock_log (slug, variant, change, qty_after, reason, order_id) VALUES ($1, $2, $3, $4, $5, $6)`, [i.slug, i.variant, delta, rows[0].qty, reason, orderId]);
    }
  }
}

export interface StockLogRow { at: string; variant: string; change: number; qtyAfter: number | null; reason: string; orderId: string | null }

export async function stockHistory(slug: string, limit = 40): Promise<StockLogRow[]> {
  const rows = await sql<{ at: string | Date; variant: string; change: number; qty_after: number | null; reason: string; order_id: string | null }>(
    `SELECT at, variant, change, qty_after, reason, order_id FROM stock_log WHERE slug = $1 ORDER BY id DESC LIMIT $2`,
    [slug, limit],
  );
  return rows.map((r) => ({ at: new Date(r.at).toISOString(), variant: r.variant, change: Number(r.change), qtyAfter: r.qty_after === null ? null : Number(r.qty_after), reason: r.reason, orderId: r.order_id }));
}

/** Keeps a product's stock when its slug changes. */
export async function renameStock(from: string, to: string): Promise<void> {
  await sql(`UPDATE stock_levels SET slug = $2 WHERE slug = $1`, [from, to]);
  await sql(`UPDATE stock_log SET slug = $2 WHERE slug = $1`, [from, to]);
}
