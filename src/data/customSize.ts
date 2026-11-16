/**
 * Pricing rules for made-to-measure boxes (all sizes in cm):
 * - Jump Box  ฿2,590: height ≤ 40 and W + L + H ≤ 120
 * - Platform  ฿2,990: height ≤ 10 and 120 < W + L + H ≤ 150
 * - Anything else needs a manual quote.
 */
export type CustomQuote =
  | { ok: true; model: 'Jump Box' | 'Platform'; price: number; rule: string; sum: number }
  | { ok: false; reason: string; sum: number };

export function quoteCustomSize(w: number, l: number, h: number): CustomQuote {
  const sum = Math.round((w + l + h) * 10) / 10;
  if (!(w > 0 && l > 0 && h > 0)) return { ok: false, reason: 'กรอกขนาดให้ครบทั้ง 3 ช่อง', sum };
  if (sum <= 120 && h <= 40) return { ok: true, model: 'Jump Box', price: 2590, rule: 'สูงไม่เกิน 40 cm · รวมไม่เกิน 120 cm', sum };
  if (sum > 120 && sum <= 150 && h <= 10) return { ok: true, model: 'Platform', price: 2990, rule: 'สูงไม่เกิน 10 cm · รวม 121-150 cm', sum };
  if (sum > 150) return { ok: false, reason: `ขนาดรวม ${sum} cm เกิน 150 cm`, sum };
  if (sum <= 120) return { ok: false, reason: 'กล่องกระโดดต้องสูงไม่เกิน 40 cm', sum };
  return { ok: false, reason: 'ฐานรองขนาดรวม 121-150 cm ต้องสูงไม่เกิน 10 cm', sum };
}
