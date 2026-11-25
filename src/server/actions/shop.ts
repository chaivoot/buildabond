'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { emailOrderPlaced, emailSlipUploaded } from '../orderEmails';
import { headers } from 'next/headers';
import { priceLine, type CartLineInput } from '../../lib/pricing';
import { shippingFee } from '../../lib/shipping';
import { codeProblem, discountFor, normalizeCode, type DiscountRule } from '../../lib/discount';
import { getDiscount, redeemDiscount, releaseDiscount } from '../discounts';
import { moveStock } from '../stock';
import type { Dict } from '../../i18n/th';
import type { Order, OrderItem } from '../../lib/types';
import { allowAttempt, isEmail, isPhone, lookupCustomer, normalizeEmail, normalizePhone, recordCustomer, verifiedAddress, type CustomerAddress, type Lookup } from '../customers';
import { formatPhone, isThaiPhone } from '../../lib/phone';
import { attachSlip, createOrder, linkOrderToCustomer, findOrderByContact, getOrderWithKey } from '../orders';
import { listProducts } from '../products';
import { createRequest } from '../requests';
import { getSettings } from '../settings';
import { storeImage } from '../upload';

export interface CheckoutInput {
  name: string;
  phone: string;
  email: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  note: string;
  lines: CartLineInput[];
  /** Set when the customer confirmed a changed phone (old phone) or changed email (old email). */
  oldPhone?: string;
  oldEmail?: string;
  /** Discount code the customer applied, if any; checked again here. */
  discountCode?: string;
  /** Site language at checkout; the customer's emails use it. */
  lang?: 'th' | 'en';
}

/** Errors are codes; the browser shows them in the visitor's language (dictionary: errors). */
export type ErrorCode = keyof Dict['errors'];
type Result<T> = ({ ok: true } & T) | { ok: false; error: ErrorCode };

const isErrorCode = (v: unknown): v is ErrorCode =>
  ['noFile', 'fileType', 'fileSize'].includes(String(v));

const clean = (s: unknown, max = 500) => String(s ?? '').trim().slice(0, max);

export async function placeOrder(input: CheckoutInput): Promise<Result<{ id: string; key: string }>> {
  const name = clean(input.name, 120);
  // Saved in one format (081-234-5678) whatever the customer or autofill typed (+66 81…, 0066…).
  const phone = formatPhone(clean(input.phone, 40));
  const addr: CustomerAddress = {
    name,
    street: clean(input.street, 300),
    subdistrict: clean(input.subdistrict, 100),
    district: clean(input.district, 100),
    province: clean(input.province, 100),
    postcode: clean(input.postcode, 10),
  };
  const address = [addr.street, addr.subdistrict, addr.district, addr.province, addr.postcode].filter(Boolean).join(' ');
  const email = clean(input.email, 200).toLowerCase();
  if (!name || !phone || !address || !email) return { ok: false, error: 'missingFields' };
  if (!isEmail(email)) return { ok: false, error: 'invalidEmail' };
  if (!isThaiPhone(phone)) return { ok: false, error: 'invalidPhone' };
  if (!Array.isArray(input.lines) || input.lines.length === 0 || input.lines.length > 50) return { ok: false, error: 'emptyCart' };

  const [products, settings] = await Promise.all([listProducts(), getSettings()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items: OrderItem[] = [];
  for (const line of input.lines) {
    const qty = Math.max(1, Math.min(99, Math.floor(Number(line.qty) || 1)));
    const priced = priceLine(line, bySlug.get(line.slug), settings);
    if (!priced) return { ok: false, error: 'unavailable' };
    items.push({ slug: priced.slug, name: priced.name, opt: priced.opt, unitPrice: priced.unitPrice, qty, kg: priced.kg, ...(priced.variant ? { variant: priced.variant } : {}) });
  }
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const kg = Math.round(items.reduce((a, i) => a + i.kg * i.qty, 0) * 10) / 10;
  const shipping = shippingFee(kg, settings.shipping);

  // Discount: re-checked against the server's own subtotal, and one use is counted before the order is saved.
  let discountCode = '';
  let discount = 0;
  const wanted = normalizeCode(clean(input.discountCode, 40));
  if (wanted) {
    const code = await getDiscount(wanted);
    const problem = codeProblem(code, subtotal);
    if (problem || !code) return { ok: false, error: problem ?? 'codeInvalid' };
    if (!(await redeemDiscount(code.code))) return { ok: false, error: 'codeUsedUp' };
    discountCode = code.code;
    discount = discountFor(code, subtotal);
  }
  const old = { phone: clean(input.oldPhone, 40) || undefined, email: clean(input.oldEmail, 200) || undefined };
  let placed: { id: string; key: string };
  try {
    placed = await createOrder({ name, phone, email, address, note: clean(input.note), customerId: null, items, subtotal, discountCode, discount, shipping, total: subtotal - discount + shipping, kg, lang: input.lang === 'en' ? 'en' : 'th' });
  } catch (e) {
    if (discountCode) await releaseDiscount(discountCode).catch(() => {});
    throw e;
  }
  const { id, key } = placed;
  try {
    await moveStock(items, -1, 'ออร์เดอร์จากเว็บ', id);
  } catch (e) {
    console.error('[stock] deduct failed', id, e);
  }
  // Remember this customer (keyed by email + phone), log any changes against this order, and link the order to them.
  try {
    const customerId = await recordCustomer(email, phone, addr, old, id);
    if (customerId) await linkOrderToCustomer(id, customerId);
  } catch {
    /* the order is placed either way */
  }
  revalidatePath('/admin');
  // Confirmation to the customer and an alert to the shop, after the response is sent.
  after(() => emailOrderPlaced(id));
  return { ok: true, id, key };
}

export type DiscountCheck = { ok: true; rule: DiscountRule; discount: number } | { ok: false; error: ErrorCode };

/** Checks a code typed at checkout against the cart (priced on the server). Rate-limited per visitor like the customer lookup. */
export async function checkDiscountCode(raw: string, lines: CartLineInput[]): Promise<DiscountCheck> {
  const wanted = normalizeCode(clean(raw, 40));
  if (!wanted) return { ok: false, error: 'codeInvalid' };
  if (!(await allowAttempt(await clientIp()))) return { ok: false, error: 'codeTooMany' };
  const [products, settings] = await Promise.all([listProducts(), getSettings()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  let subtotal = 0;
  for (const line of Array.isArray(lines) ? lines.slice(0, 50) : []) {
    const priced = priceLine(line, bySlug.get(line.slug), settings);
    if (priced) subtotal += priced.unitPrice * Math.max(1, Math.min(99, Math.floor(Number(line.qty) || 1)));
  }
  const code = await getDiscount(wanted);
  const problem = codeProblem(code, subtotal);
  if (problem || !code) return { ok: false, error: problem ?? 'codeInvalid' };
  const rule: DiscountRule = { code: code.code, kind: code.kind, value: code.value, minSubtotal: code.minSubtotal };
  return { ok: true, rule, discount: discountFor(rule, subtotal) };
}

export async function uploadSlip(id: string, key: string, form: FormData): Promise<Result<{ url: string }>> {
  const order = await getOrderWithKey(id, key);
  if (!order) return { ok: false, error: 'orderNotFound' };
  try {
    const url = await storeImage(form.get('file') as File, 'slips');
    await attachSlip(id, url);
    revalidatePath('/admin');
    after(() => emailSlipUploaded(id));
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error && isErrorCode(e.message) ? e.message : 'uploadFailed' };
  }
}

/** Fields the tracking page may show (no address). */
export type TrackedOrder = Pick<Order, 'id' | 'createdAt' | 'items' | 'total' | 'status' | 'slipAt' | 'confirmedAt' | 'shippedAt' | 'carrier' | 'tracking'>;

/** `contact` is the phone number or email used at checkout. */
export async function trackOrder(id: string, contact: string): Promise<TrackedOrder | null> {
  const o = await findOrderByContact(clean(id, 40), clean(contact, 200));
  if (!o) return null;
  const { createdAt, items, total, status, slipAt, confirmedAt, shippedAt, carrier, tracking } = o;
  return { id: o.id, createdAt, items, total, status, slipAt, confirmedAt, shippedAt, carrier, tracking };
}

export async function submitRequest(kind: 'custom' | 'business', form: FormData): Promise<Result<object>> {
  const data: Record<string, string> = {};
  let name = '';
  let contact = '';
  for (const [k, v] of form.entries()) {
    if (typeof v !== 'string' || !v.trim()) continue;
    if (k === '_name') name = clean(v, 120);
    else if (k === '_contact') contact = clean(v, 200);
    else data[clean(k, 60)] = clean(v, 1000);
  }
  if (!name || !contact) return { ok: false, error: 'missingContact' };
  await createRequest(kind, name, contact, data);
  revalidatePath('/admin/requests');
  return { ok: true };
}

/* ---------- Returning customers (email + phone) ---------- */

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

export type CustomerLookup = Lookup | { status: 'limited' };

/** Checks email + phone at checkout. Returns the saved address only when both belong to the same customer. */
export async function findReturningCustomer(email: string, phone: string): Promise<CustomerLookup> {
  const e = normalizeEmail(clean(email, 200));
  const p = normalizePhone(clean(phone, 40));
  if (!isEmail(e) || !isPhone(p)) return { status: 'new' };
  if (!(await allowAttempt(await clientIp()))) return { status: 'limited' };
  return lookupCustomer(e, p);
}

/** Confirms a changed phone (give the old phone) or changed email (give the old email); returns the saved address. */
export async function confirmCustomerChange(
  email: string,
  phone: string,
  old: { phone?: string; email?: string },
): Promise<{ ok: true; address: CustomerAddress } | { ok: false; limited?: boolean }> {
  if (!(await allowAttempt(await clientIp()))) return { ok: false, limited: true };
  const address = await verifiedAddress(clean(email, 200), clean(phone, 40), {
    phone: old.phone ? clean(old.phone, 40) : undefined,
    email: old.email ? clean(old.email, 200) : undefined,
  });
  return address ? { ok: true, address } : { ok: false };
}
