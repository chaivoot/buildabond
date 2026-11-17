'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { th } from '../../i18n/th';
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_DAYS, verifySessionToken } from '../../lib/auth';
import type { OrderStatus, Product, RequestStatus, ShopSettings } from '../../lib/types';
import { setOrderStatus, shipOrder } from '../orders';
import { deleteProduct, getProduct, upsertProduct } from '../products';
import { setRequestStatus } from '../requests';
import { saveSettings } from '../settings';
import { storeImage } from '../upload';

async function requireAdmin() {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) throw new Error('กรุณาเข้าสู่ระบบใหม่');
}

/** Storefront pages are cached; refresh them after catalogue or settings edits. */
const refreshStore = () => revalidatePath('/', 'layout');

export async function login(_: unknown, form: FormData): Promise<{ error: string }> {
  if (!(await checkPassword(String(form.get('password') ?? '')))) return { error: 'รหัสผ่านไม่ถูกต้อง' };
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86_400,
  });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/admin/login');
}

/* ---------- Orders ---------- */

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  await setOrderStatus(id, status);
  revalidatePath('/admin');
}

export async function markShipped(id: string, carrier: string, tracking: string) {
  await requireAdmin();
  if (!tracking.trim()) throw new Error('กรอกเลขพัสดุ');
  await shipOrder(id, carrier.trim(), tracking.trim().toUpperCase());
  revalidatePath('/admin');
}

/* ---------- Products ---------- */

export async function uploadProductImage(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  try {
    return { url: await storeImage(form.get('file') as File, 'products') };
  } catch (e) {
    const code = e instanceof Error ? (e.message as keyof typeof th.errors) : 'uploadFailed';
    return { error: th.errors[code] ?? th.errors.uploadFailed };
  }
}

export async function saveProduct(product: Product, previousSlug: string | null): Promise<{ error?: string }> {
  await requireAdmin();
  const slug = product.slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: 'ลิงก์สินค้า (slug) ใช้ได้เฉพาะ a-z, 0-9 และ -' };
  if (!product.name.trim()) return { error: 'กรอกชื่อสินค้า' };
  if (product.magnets && !(product.magnetCount >= 1)) return { error: 'ใส่จำนวนแม่เหล็กที่ใช้ (อย่างน้อย 1 ชิ้น)' };
  if (slug !== previousSlug && (await getProduct(slug))) return { error: 'มีสินค้าที่ใช้ลิงก์นี้แล้ว' };
  await upsertProduct({ ...product, slug }, previousSlug ?? undefined);
  refreshStore();
  revalidatePath('/admin/products');
  return {};
}

export async function removeProduct(slug: string) {
  await requireAdmin();
  await deleteProduct(slug);
  refreshStore();
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

/* ---------- Requests ---------- */

export async function updateRequestStatus(id: string, status: RequestStatus) {
  await requireAdmin();
  await setRequestStatus(id, status);
  revalidatePath('/admin/requests');
}

/* ---------- Settings ---------- */

export async function updateSettings(s: ShopSettings): Promise<{ error?: string }> {
  await requireAdmin();
  const tiers = s.shipping;
  for (let i = 0; i < tiers.length - 1; i++) {
    const t = tiers[i].upToKg;
    if (t === null || t <= 0 || (i > 0 && t <= (tiers[i - 1].upToKg ?? 0))) return { error: 'น้ำหนักของแต่ละช่วงค่าส่งต้องเรียงจากน้อยไปมาก' };
  }
  await saveSettings({ ...s, shipping: tiers.map((t, i) => ({ ...t, upToKg: i === tiers.length - 1 ? null : t.upToKg })) });
  refreshStore();
  revalidatePath('/admin/settings');
  return {};
}
