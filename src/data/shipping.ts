/**
 * Shipping is a flat fee by total order weight:
 * under 1 kg ฿50 · 1–5 kg ฿100 · 5 kg and up ฿200.
 */
export const SHIPPING_TIERS = [
  { range: 'ต่ำกว่า 1 กก.', short: '< 1 กก. ฿50', fee: 50 },
  { range: '1-5 กก.', short: '1-5 กก. ฿100', fee: 100 },
  { range: '5 กก. ขึ้นไป', short: '5 กก.+ ฿200', fee: 200 },
] as const;

/** -1 when the cart is empty. */
export function shippingTier(kg: number): number {
  if (kg <= 0) return -1;
  return kg < 1 ? 0 : kg < 5 ? 1 : 2;
}

export function shippingFee(kg: number): number {
  const t = shippingTier(kg);
  return t < 0 ? 0 : SHIPPING_TIERS[t].fee;
}
