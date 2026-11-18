import type { DiscountCode } from './types';

/** What the checkout needs to show and recompute a code's discount as the cart changes. */
export type DiscountRule = Pick<DiscountCode, 'code' | 'kind' | 'value' | 'minSubtotal'>;

export const normalizeCode = (s: string) => s.trim().toUpperCase().replace(/\s+/g, '');

/** Baht off a subtotal: percent rounds down, never more than the subtotal; 0 below the minimum. */
export function discountFor(rule: DiscountRule, subtotal: number): number {
  if (subtotal <= 0 || subtotal < rule.minSubtotal) return 0;
  const off = rule.kind === 'percent' ? Math.floor((subtotal * rule.value) / 100) : Math.round(rule.value);
  return Math.max(0, Math.min(subtotal, off));
}

export const discountLabel = (rule: Pick<DiscountRule, 'kind' | 'value'>) =>
  rule.kind === 'percent' ? `${rule.value}%` : `฿${rule.value.toLocaleString('en-US')}`;

export type CodeProblem = 'codeInvalid' | 'codeExpired' | 'codeUsedUp' | 'codeMinSubtotal';

/** Why a code can't be used right now, or null if it can. */
export function codeProblem(c: DiscountCode | null, subtotal: number, now = new Date()): CodeProblem | null {
  if (!c || !c.active) return 'codeInvalid';
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now.getTime()) return 'codeExpired';
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return 'codeUsedUp';
  if (subtotal < c.minSubtotal) return 'codeMinSubtotal';
  return null;
}
