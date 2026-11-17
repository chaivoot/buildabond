'use server';

import { revalidatePath } from 'next/cache';
import { priceLine, type CartLineInput } from '../../lib/pricing';
import { shippingFee } from '../../lib/shipping';
import type { Dict } from '../../i18n/th';
import type { Order, OrderItem } from '../../lib/types';
import { attachSlip, createOrder, findOrderByContact, getOrderWithKey } from '../orders';
import { listProducts } from '../products';
import { createRequest } from '../requests';
import { getSettings } from '../settings';
import { storeImage } from '../upload';

export interface CheckoutInput {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  lines: CartLineInput[];
}

/** Errors are codes; the browser shows them in the visitor's language (dictionary: errors). */
export type ErrorCode = keyof Dict['errors'];
type Result<T> = ({ ok: true } & T) | { ok: false; error: ErrorCode };

const isErrorCode = (v: unknown): v is ErrorCode =>
  ['noFile', 'fileType', 'fileSize'].includes(String(v));

const clean = (s: unknown, max = 500) => String(s ?? '').trim().slice(0, max);

export async function placeOrder(input: CheckoutInput): Promise<Result<{ id: string; key: string }>> {
  const name = clean(input.name, 120);
  const phone = clean(input.phone, 40);
  const address = clean(input.address, 600);
  const email = clean(input.email, 200).toLowerCase();
  if (!name || !phone || !address || !email) return { ok: false, error: 'missingFields' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'invalidEmail' };
  if (!Array.isArray(input.lines) || input.lines.length === 0 || input.lines.length > 50) return { ok: false, error: 'emptyCart' };

  const [products, settings] = await Promise.all([listProducts(), getSettings()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items: OrderItem[] = [];
  for (const line of input.lines) {
    const qty = Math.max(1, Math.min(99, Math.floor(Number(line.qty) || 1)));
    const priced = priceLine(line, bySlug.get(line.slug), settings);
    if (!priced) return { ok: false, error: 'unavailable' };
    items.push({ slug: priced.slug, name: priced.name, opt: priced.opt, unitPrice: priced.unitPrice, qty, kg: priced.kg });
  }
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const kg = Math.round(items.reduce((a, i) => a + i.kg * i.qty, 0) * 10) / 10;
  const shipping = shippingFee(kg, settings.shipping);
  const { id, key } = await createOrder({ name, phone, email, address, note: clean(input.note), items, subtotal, shipping, total: subtotal + shipping, kg });
  revalidatePath('/admin');
  return { ok: true, id, key };
}

export async function uploadSlip(id: string, key: string, form: FormData): Promise<Result<{ url: string }>> {
  const order = await getOrderWithKey(id, key);
  if (!order) return { ok: false, error: 'orderNotFound' };
  try {
    const url = await storeImage(form.get('file') as File, 'slips');
    await attachSlip(id, url);
    revalidatePath('/admin');
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
