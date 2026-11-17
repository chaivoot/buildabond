import type { OrderStatus } from '../lib/types';

export type { OrderStatus };

export const ORDER_STATUSES: OrderStatus[] = ['รอชำระ', 'ส่งสลิปแล้ว', 'ยืนยันแล้ว', 'จัดส่งแล้ว', 'ยกเลิก'];

const TONE: Record<OrderStatus, string> = {
  'รอชำระ': 'tag--orange',
  'ส่งสลิปแล้ว': 'tag--sky',
  'ยืนยันแล้ว': 'tag--green',
  'จัดส่งแล้ว': 'tag--stone',
  'ยกเลิก': 'tag--sand',
};

/** `label` overrides the text (the storefront passes a translated status). */
export function StatusPill({ status, label, shippedTone = 'tag--stone' }: { status: OrderStatus; label?: string; shippedTone?: string }) {
  const tone = status === 'จัดส่งแล้ว' ? shippedTone : TONE[status];
  return <span className={`tag ${tone}`} style={{ flex: 'none' }}>{label ?? status}</span>;
}
