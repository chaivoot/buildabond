/**
 * Pricing rules for made-to-measure boxes (all sizes in cm):
 * - Jump Box  ฿2,590: height ≤ 40 and W + L + H ≤ 120
 * - Platform  ฿2,990: height ≤ 10 and 120 < W + L + H ≤ 150
 * - Anything else needs a manual quote.
 * Returns codes; the UI turns them into text (see dictionaries: custom.rules / custom.reasons).
 */
export type CustomQuote =
  | { ok: true; model: 'Jump Box' | 'Platform'; price: number; rule: 'jump' | 'platform'; sum: number }
  | { ok: false; reason: 'incomplete' | 'over' | 'jumpTooTall' | 'platformTooTall'; sum: number };

export function quoteCustomSize(w: number, l: number, h: number): CustomQuote {
  const sum = Math.round((w + l + h) * 10) / 10;
  if (!(w > 0 && l > 0 && h > 0)) return { ok: false, reason: 'incomplete', sum };
  if (sum <= 120 && h <= 40) return { ok: true, model: 'Jump Box', price: 2590, rule: 'jump', sum };
  if (sum > 120 && sum <= 150 && h <= 10) return { ok: true, model: 'Platform', price: 2990, rule: 'platform', sum };
  if (sum > 150) return { ok: false, reason: 'over', sum };
  if (sum <= 120) return { ok: false, reason: 'jumpTooTall', sum };
  return { ok: false, reason: 'platformTooTall', sum };
}
