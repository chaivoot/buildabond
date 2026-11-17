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

/**
 * Saves the customer after an order:
 * - email + phone already the same customer → update name and address
 * - a confirmed change → update that customer's phone or email (and address)
 * - neither known → create a customer
 * - anything else (unconfirmed partial match, or two different customers) → leave records alone
 */
export async function recordCustomer(emailRaw: string, phoneRaw: string, addr: CustomerAddress, old: { phone?: string; email?: string } = {}) {
  const email = normalizeEmail(emailRaw);
  const phone = normalizePhone(phoneRaw);
  const [e, p] = await Promise.all([byEmail(email), byPhone(phone)]);
  const set = `name = $2, street = $3, subdistrict = $4, district = $5, province = $6, postcode = $7, updated_at = now()`;
  const vals = [addr.name, addr.street, addr.subdistrict, addr.district, addr.province, addr.postcode];

  if (e && p && e.id === p.id) {
    await sql(`UPDATE customers SET ${set} WHERE id = $1`, [e.id, ...vals]);
  } else if (!e && !p) {
    await sql(
      `INSERT INTO customers (id, email, phone, name, street, subdistrict, district, province, postcode) VALUES ($1,$8,$9,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING`,
      [crypto.randomUUID(), ...vals, email, phone],
    );
  } else {
    const c = await verifyChange(email, phone, old);
    if (c) await sql(`UPDATE customers SET ${set}, email = $8, phone = $9 WHERE id = $1`, [c.id, ...vals, email, phone]);
  }
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
