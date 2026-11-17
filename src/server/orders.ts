import type { Order, OrderItem, OrderStatus } from '../lib/types';
import { sql, toJson } from './db';

interface Row {
  id: string; access_key: string; created_at: string | Date; name: string; phone: string; email: string | null; address: string; note: string;
  items: OrderItem[]; subtotal: number; shipping: number; total: number; kg: number; status: string; slip_url: string;
  slip_at: string | Date | null; confirmed_at: string | Date | null; shipped_at: string | Date | null; carrier: string; tracking: string;
}

const iso = (v: string | Date | null) => (v ? new Date(v).toISOString() : null);

const fromRow = (r: Row): Order => ({
  id: r.id, createdAt: iso(r.created_at)!, name: r.name, phone: r.phone, email: r.email ?? '', address: r.address, note: r.note, items: r.items,
  subtotal: r.subtotal, shipping: r.shipping, total: r.total, kg: Number(r.kg), status: r.status as OrderStatus, slipUrl: r.slip_url,
  slipAt: iso(r.slip_at), confirmedAt: iso(r.confirmed_at), shippedAt: iso(r.shipped_at), carrier: r.carrier, tracking: r.tracking,
});

export async function listOrders(): Promise<Order[]> {
  return (await sql<Row>(`SELECT * FROM orders ORDER BY created_at DESC`)).map(fromRow);
}

export async function getOrder(id: string): Promise<Order | null> {
  const rows = await sql<Row>(`SELECT * FROM orders WHERE id = $1`, [id]);
  return rows[0] ? fromRow(rows[0]) : null;
}

/** Order lookup for the customer: requires the secret key from the order link. */
export async function getOrderWithKey(id: string, key: string): Promise<Order | null> {
  const rows = await sql<Row>(`SELECT * FROM orders WHERE id = $1 AND access_key = $2`, [id, key]);
  return rows[0] ? fromRow(rows[0]) : null;
}

const digits = (s: string) => s.replace(/\D/g, '');

/** Order lookup for the tracking page: order number + the phone or email used at checkout. */
export async function findOrderByContact(id: string, contact: string): Promise<Order | null> {
  const o = await getOrder(id.trim().toUpperCase());
  if (!o) return null;
  const c = contact.trim().toLowerCase();
  if (c.includes('@')) return o.email && o.email.toLowerCase() === c ? o : null;
  return digits(o.phone) === digits(c) && digits(c) !== '' ? o : null;
}

export interface NewOrder {
  name: string; phone: string; email: string; address: string; note: string; items: OrderItem[]; subtotal: number; shipping: number; total: number; kg: number;
}

export async function createOrder(o: NewOrder): Promise<{ id: string; key: string }> {
  const [{ n }] = await sql<{ n: string | number }>(`SELECT nextval('order_seq') AS n`);
  const d = new Date(Date.now() + 7 * 3600_000); // Bangkok date for the order number
  const ymd = `${String(d.getUTCFullYear() % 100).padStart(2, '0')}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const id = `BB-${ymd}-${String(n).padStart(4, '0')}`;
  const key = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await sql(
    `INSERT INTO orders (id, access_key, name, phone, email, address, note, items, subtotal, shipping, total, kg, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'รอชำระ')`,
    [id, key, o.name, o.phone, o.email, o.address, o.note, toJson(o.items), o.subtotal, o.shipping, o.total, o.kg],
  );
  return { id, key };
}

export async function attachSlip(id: string, url: string): Promise<void> {
  await sql(`UPDATE orders SET slip_url = $2, slip_at = now(), status = CASE WHEN status = 'รอชำระ' THEN 'ส่งสลิปแล้ว' ELSE status END WHERE id = $1`, [id, url]);
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const stamp = status === 'ยืนยันแล้ว' ? ', confirmed_at = now()' : status === 'รอชำระ' ? ', confirmed_at = NULL' : '';
  await sql(`UPDATE orders SET status = $2${stamp} WHERE id = $1`, [id, status]);
}

export async function shipOrder(id: string, carrier: string, tracking: string): Promise<void> {
  await sql(`UPDATE orders SET status = 'จัดส่งแล้ว', carrier = $2, tracking = $3, shipped_at = now() WHERE id = $1`, [id, carrier, tracking]);
}
