import { sql } from './db';

export interface CustomerAddress {
  name: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
}

export interface Customer extends CustomerAddress {
  id: string;
  email: string;
  phone: string;
}

export const normalizeEmail = (s: string) => s.trim().toLowerCase();

/** Digits only, with +66 / 66 converted to a leading 0 (Thai numbers). */
export function normalizePhone(s: string): string {
  const d = s.replace(/\D/g, '');
  return d.startsWith('66') && d.length === 11 ? `0${d.slice(2)}` : d;
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const isPhone = (s: string) => s.length >= 9 && s.length <= 10;

const addressOf = (c: Customer): CustomerAddress => ({
  name: c.name, street: c.street, subdistrict: c.subdistrict, district: c.district, province: c.province, postcode: c.postcode,
});

async function byEmail(email: string) {
  return (await sql<Customer>(`SELECT * FROM customers WHERE email = $1`, [email]))[0] ?? null;
}
async function byPhone(phone: string) {
  return (await sql<Customer>(`SELECT * FROM customers WHERE phone = $1`, [phone]))[0] ?? null;
}

export type Lookup =
  | { status: 'match'; address: CustomerAddress }
  | { status: 'phoneChanged' } // email known, phone different: confirm with the old phone
  | { status: 'emailChanged' } // phone known, email different: confirm with the old email
  | { status: 'new' };

/** Matches email + phone against saved customers. Reveals an address only when both belong to the same customer. */
export async function lookupCustomer(emailRaw: string, phoneRaw: string): Promise<Lookup> {
  const email = normalizeEmail(emailRaw);
  const phone = normalizePhone(phoneRaw);
  const [e, p] = await Promise.all([byEmail(email), byPhone(phone)]);
  if (e && p && e.id === p.id) return { status: 'match', address: addressOf(e) };
  if (e && !p) return { status: 'phoneChanged' };
  if (p && !e) return { status: 'emailChanged' };
  // Neither known, or email and phone belong to two different customers: treat as new (no prefill).
  return { status: 'new' };
}

/**
 * Confirms a changed phone (old phone given) or changed email (old email given).
 * Returns the customer when the old value matches the record found by the unchanged one.
 */
export async function verifyChange(emailRaw: string, phoneRaw: string, old: { phone?: string; email?: string }): Promise<Customer | null> {
  const email = normalizeEmail(emailRaw);
  const phone = normalizePhone(phoneRaw);
  if (old.phone) {
    const c = await byEmail(email);
    return c && c.phone === normalizePhone(old.phone) && !(await byPhone(phone)) ? c : null;
  }
  if (old.email) {
    const c = await byPhone(phone);
    return c && c.email === normalizeEmail(old.email) && !(await byEmail(email)) ? c : null;
  }
  return null;
}

export const verifiedAddress = async (...args: Parameters<typeof verifyChange>) => {
  const c = await verifyChange(...args);
  return c ? addressOf(c) : null;
};

const formatAddress = (a: CustomerAddress) => [a.street, a.subdistrict, a.district, a.province, a.postcode].filter(Boolean).join(' ');

export type CustomerEventKind = 'created' | 'name' | 'address' | 'phone' | 'email';

async function logEvent(customerId: string, kind: CustomerEventKind, oldValue: string, newValue: string, orderId: string | null) {
  await sql(`INSERT INTO customer_events (id, customer_id, kind, old_value, new_value, order_id) VALUES ($1,$2,$3,$4,$5,$6)`, [
    crypto.randomUUID(), customerId, kind, oldValue, newValue, orderId,
  ]);
}

/** Logs what differs between the saved customer and the details on a new order. */
async function logChanges(c: Customer, next: CustomerAddress & { email: string; phone: string }, orderId: string | null) {
  if (c.name !== next.name) await logEvent(c.id, 'name', c.name, next.name, orderId);
  const oldAddr = formatAddress(c);
  const newAddr = formatAddress(next);
  if (oldAddr !== newAddr) await logEvent(c.id, 'address', oldAddr, newAddr, orderId);
  if (c.phone !== next.phone) await logEvent(c.id, 'phone', c.phone, next.phone, orderId);
  if (c.email !== next.email) await logEvent(c.id, 'email', c.email, next.email, orderId);
}

/**
 * Saves the customer for an order and returns their id (null when the order can't be linked):
 * - email + phone already the same customer → update name and address
 * - a confirmed change → update that customer's phone or email (and address)
 * - neither known → create a customer
 * - anything else (unconfirmed partial match, or two different customers) → leave records alone
 * Every change is written to customer_events with the order it came from.
 */
export async function recordCustomer(
  emailRaw: string,
  phoneRaw: string,
  addr: CustomerAddress,
  old: { phone?: string; email?: string } = {},
  orderId: string | null = null,
): Promise<string | null> {
  const email = normalizeEmail(emailRaw);
  const phone = normalizePhone(phoneRaw);
  const [e, p] = await Promise.all([byEmail(email), byPhone(phone)]);
  const next = { ...addr, email, phone };
  const set = `name = $2, street = $3, subdistrict = $4, district = $5, province = $6, postcode = $7, updated_at = now()`;
  const vals = [addr.name, addr.street, addr.subdistrict, addr.district, addr.province, addr.postcode];

  if (e && p && e.id === p.id) {
    await logChanges(e, next, orderId);
    await sql(`UPDATE customers SET ${set} WHERE id = $1`, [e.id, ...vals]);
    return e.id;
  }
  if (!e && !p) {
    const id = crypto.randomUUID();
    const created = await sql(
      `INSERT INTO customers (id, email, phone, name, street, subdistrict, district, province, postcode) VALUES ($1,$8,$9,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING RETURNING id`,
      [id, ...vals, email, phone],
    );
    if (!created.length) return null;
    await logEvent(id, 'created', '', addr.name, orderId);
    return id;
  }
  const c = await verifyChange(email, phone, old);
  if (!c) return null;
  await logChanges(c, next, orderId);
  await sql(`UPDATE customers SET ${set}, email = $8, phone = $9 WHERE id = $1`, [c.id, ...vals, email, phone]);
  return c.id;
}

/* ---------- Admin: customers and their history ---------- */

export interface CustomerSummary extends Customer {
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
}

export interface CustomerEvent {
  id: string;
  at: string;
  kind: CustomerEventKind;
  oldValue: string;
  newValue: string;
  orderId: string | null;
}

interface SummaryRow extends Customer {
  order_count: string | number;
  total_spent: string | number | null;
  last_order_at: string | Date | null;
  created_at: string | Date;
}

const toSummary = (r: SummaryRow): CustomerSummary => ({
  id: r.id, email: r.email, phone: r.phone, name: r.name, street: r.street, subdistrict: r.subdistrict, district: r.district,
  province: r.province, postcode: r.postcode, orderCount: Number(r.order_count), totalSpent: Number(r.total_spent ?? 0),
  lastOrderAt: r.last_order_at ? new Date(r.last_order_at).toISOString() : null, createdAt: new Date(r.created_at).toISOString(),
});

const SUMMARY = `SELECT c.*, count(o.id) AS order_count,
    coalesce(sum(o.total) FILTER (WHERE o.status <> 'ยกเลิก'), 0) AS total_spent, max(o.created_at) AS last_order_at
  FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`;

export async function listCustomers(): Promise<CustomerSummary[]> {
  const rows = await sql<SummaryRow>(`${SUMMARY} GROUP BY c.id ORDER BY max(o.created_at) DESC NULLS LAST, c.created_at DESC`);
  return rows.map(toSummary);
}

export async function getCustomerHistory(id: string) {
  const [row] = await sql<SummaryRow>(`${SUMMARY} WHERE c.id = $1 GROUP BY c.id`, [id]);
  if (!row) return null;
  const events = await sql<{ id: string; at: string | Date; kind: CustomerEventKind; old_value: string; new_value: string; order_id: string | null }>(
    `SELECT * FROM customer_events WHERE customer_id = $1 ORDER BY at DESC`,
    [id],
  );
  return {
    customer: toSummary(row),
    events: events.map((e): CustomerEvent => ({
      id: e.id, at: new Date(e.at).toISOString(), kind: e.kind, oldValue: e.old_value, newValue: e.new_value, orderId: e.order_id,
    })),
  };
}

/* ---------- Rate limit for lookups (guessing protection) ---------- */

const WINDOW_MIN = 15;
const MAX_ATTEMPTS = 20;

/** Records an attempt for this IP and returns false once it has made too many recently. */
export async function allowAttempt(ip: string): Promise<boolean> {
  const [{ n }] = await sql<{ n: string | number }>(
    `SELECT count(*) AS n FROM lookup_attempts WHERE ip = $1 AND at > now() - interval '${WINDOW_MIN} minutes'`,
    [ip],
  );
  if (Number(n) >= MAX_ATTEMPTS) return false;
  await sql(`INSERT INTO lookup_attempts (ip) VALUES ($1)`, [ip]);
  if (Math.random() < 0.05) await sql(`DELETE FROM lookup_attempts WHERE at < now() - interval '1 day'`);
  return true;
}
