import { normalizeCode } from '../lib/discount';
import type { DiscountCode, DiscountKind } from '../lib/types';
import { sql } from './db';

interface Row {
  code: string; kind: string; value: number; active: boolean; min_subtotal: number; max_uses: number | null; used_count: number;
  expires_at: string | Date | null; note: string; created_at: string | Date;
}

const fromRow = (r: Row): DiscountCode => ({
  code: r.code, kind: r.kind as DiscountKind, value: Number(r.value), active: r.active, minSubtotal: Number(r.min_subtotal),
  maxUses: r.max_uses === null ? null : Number(r.max_uses), usedCount: Number(r.used_count),
  expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null, note: r.note, createdAt: new Date(r.created_at).toISOString(),
});

export async function listDiscounts(): Promise<DiscountCode[]> {
  return (await sql<Row>(`SELECT * FROM discount_codes ORDER BY created_at DESC`)).map(fromRow);
}

export async function getDiscount(code: string): Promise<DiscountCode | null> {
  const rows = await sql<Row>(`SELECT * FROM discount_codes WHERE code = $1`, [normalizeCode(code)]);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function saveDiscount(d: DiscountCode, previousCode: string | null): Promise<void> {
  const params = [d.code, d.kind, d.value, d.active, d.minSubtotal, d.maxUses, d.expiresAt, d.note];
  if (previousCode) {
    await sql(
      `UPDATE discount_codes SET code = $1, kind = $2, value = $3, active = $4, min_subtotal = $5, max_uses = $6, expires_at = $7, note = $8 WHERE code = $9`,
      [...params, previousCode],
    );
  } else {
    await sql(
      `INSERT INTO discount_codes (code, kind, value, active, min_subtotal, max_uses, expires_at, note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      params,
    );
  }
}

export async function deleteDiscount(code: string): Promise<void> {
  await sql(`DELETE FROM discount_codes WHERE code = $1`, [code]);
}

/** Counts one use, only if the code is still usable; false if someone used the last one first. */
export async function redeemDiscount(code: string): Promise<boolean> {
  const rows = await sql(
    `UPDATE discount_codes SET used_count = used_count + 1
     WHERE code = $1 AND active AND (max_uses IS NULL OR used_count < max_uses) AND (expires_at IS NULL OR expires_at >= now())
     RETURNING code`,
    [code],
  );
  return rows.length > 0;
}

/** Gives a use back, e.g. when the order couldn't be saved after redeeming. */
export async function releaseDiscount(code: string): Promise<void> {
  await sql(`UPDATE discount_codes SET used_count = GREATEST(0, used_count - 1) WHERE code = $1`, [code]);
}
