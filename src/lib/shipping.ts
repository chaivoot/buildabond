import { th, type Dict } from '../i18n/th';
import type { ShippingTier } from './types';

type TierText = Dict['shippingTiers'];

/** Index of the tier for this weight; -1 for an empty cart. */
export function shippingTier(weight: number, tiers: ShippingTier[]): number {
  if (weight <= 0) return -1;
  const i = tiers.findIndex((t) => t.upToKg === null || weight < t.upToKg);
  return i === -1 ? tiers.length - 1 : i;
}

export function shippingFee(weight: number, tiers: ShippingTier[]): number {
  const i = shippingTier(weight, tiers);
  return i < 0 ? 0 : tiers[i].fee;
}

const bounds = (tiers: ShippingTier[], i: number) => ({ lo: i === 0 ? 0 : tiers[i - 1].upToKg ?? 0, hi: tiers[i].upToKg });
const fee = (t: ShippingTier) => `฿${t.fee.toLocaleString('en-US')}`;

/** "ต่ำกว่า 1 กก." / "1-5 กก." / "5 กก. ขึ้นไป" (or English) */
export function tierRange(tiers: ShippingTier[], i: number, text: TierText = th.shippingTiers): string {
  const { lo, hi } = bounds(tiers, i);
  if (hi === null) return text.andUp(lo);
  if (lo === 0) return text.under(hi);
  return text.range(lo, hi);
}

/** Compact label for the drawer meter: "< 1 กก. ฿50" */
export function tierShort(tiers: ShippingTier[], i: number, text: TierText = th.shippingTiers): string {
  const { lo, hi } = bounds(tiers, i);
  const label = hi === null ? text.shortUp(lo) : lo === 0 ? text.shortUnder(hi) : text.shortRange(lo, hi);
  return `${label} ${fee(tiers[i])}`;
}

/** One line for product pages: "ต่ำกว่า 1 กก. ฿50 · 1-5 กก. ฿100 · 5 กก. ขึ้นไป ฿200" */
export function tiersSummary(tiers: ShippingTier[], text: TierText = th.shippingTiers): string {
  return tiers.map((t, i) => `${tierRange(tiers, i, text)} ${fee(t)}`).join(' · ');
}
