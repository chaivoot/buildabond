import type { ShippingTier } from './types';

const kg = (n: number) => `${n} กก.`;

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

/** "ต่ำกว่า 1 กก." / "1-5 กก." / "5 กก. ขึ้นไป" */
export function tierRange(tiers: ShippingTier[], i: number): string {
  const lo = i === 0 ? 0 : tiers[i - 1].upToKg ?? 0;
  const hi = tiers[i].upToKg;
  if (hi === null) return `${kg(lo)} ขึ้นไป`;
  if (lo === 0) return `ต่ำกว่า ${kg(hi)}`;
  return `${lo}-${kg(hi)}`;
}

/** Compact label for the drawer meter: "< 1 กก. ฿50" */
export function tierShort(tiers: ShippingTier[], i: number): string {
  const lo = i === 0 ? 0 : tiers[i - 1].upToKg ?? 0;
  const hi = tiers[i].upToKg;
  const fee = `฿${tiers[i].fee.toLocaleString('en-US')}`;
  if (hi === null) return `${lo} กก.+ ${fee}`;
  if (lo === 0) return `< ${hi} กก. ${fee}`;
  return `${lo}-${hi} กก. ${fee}`;
}

/** One line for product pages: "ต่ำกว่า 1 กก. ฿50 · 1-5 กก. ฿100 · 5 กก. ขึ้นไป ฿200" */
export function tiersSummary(tiers: ShippingTier[]): string {
  return tiers.map((t, i) => `${tierRange(tiers, i)} ฿${t.fee.toLocaleString('en-US')}`).join(' · ');
}
