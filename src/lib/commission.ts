import type { CommissionTier, DiscountCode } from './types';

type Plan = Pick<DiscountCode, 'commissionPercent' | 'commissionTiers' | 'commissionTierMode'>;

/** Tiers sorted, with the first starting at ฿0 and duplicates dropped. */
export function normalizeTiers(tiers: CommissionTier[]): CommissionTier[] {
  const clean = tiers
    .map((t) => ({ from: Math.max(0, Math.round(Number(t.from) || 0)), percent: Math.max(0, Math.min(100, Math.round((Number(t.percent) || 0) * 100) / 100)) }))
    .sort((a, b) => a.from - b.from)
    .filter((t, i, all) => i === 0 || t.from !== all[i - 1].from);
  if (clean.length) clean[0] = { ...clean[0], from: 0 };
  return clean;
}

/** The tier a total falls in (the highest `from` it has reached). */
export function tierFor(tiers: CommissionTier[], net: number): CommissionTier | null {
  let hit: CommissionTier | null = null;
  for (const t of tiers) if (net >= t.from) hit = t;
  return hit;
}

/**
 * Commission on net sales for a period (items after discount, paid orders).
 * Flat: net × percent. Tiered "whole": the tier reached sets the rate for everything.
 * Tiered "marginal": each band is paid at its own rate, like tax brackets.
 */
export function commissionFor(plan: Plan, net: number): number {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  if (net <= 0) return 0;
  const tiers = normalizeTiers(plan.commissionTiers ?? []);
  if (!tiers.length) return round2((net * plan.commissionPercent) / 100);
  if (plan.commissionTierMode !== 'marginal') return round2((net * (tierFor(tiers, net)?.percent ?? 0)) / 100);
  let total = 0;
  tiers.forEach((t, i) => {
    const top = tiers[i + 1]?.from ?? Infinity;
    const band = Math.max(0, Math.min(net, top) - t.from);
    total += (band * t.percent) / 100;
  });
  return round2(total);
}

/** Short description for lists, e.g. "10%" or "ขั้นบันได 5% → 10% → 15%". */
export function commissionSummary(plan: Plan): string {
  const tiers = normalizeTiers(plan.commissionTiers ?? []);
  if (!tiers.length) return plan.commissionPercent > 0 ? `${plan.commissionPercent}%` : '';
  return `ขั้นบันได${plan.commissionTierMode === 'marginal' ? 'สะสม' : ''} ${tiers.map((t) => `${t.percent}%`).join(' → ')}`;
}
