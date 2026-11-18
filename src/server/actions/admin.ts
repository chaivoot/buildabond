'use server';

import { youTubeId } from '../../lib/video';
import { normalizeCode } from '../../lib/discount';
import { deleteDiscount, getDiscount, saveDiscount } from '../discounts';
import type { DiscountCode } from '../../lib/types';
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
  const videos = (product.detail.videos ?? []).map((v) => v.trim()).filter(Boolean);
  const badVideo = videos.find((v) => !youTubeId(v));
  if (badVideo) return { error: `ลิงก์วิดีโอไม่ถูกต้อง: ${badVideo}` };
  const sizes = (product.detail.sizes ?? []).map((z) => ({
    label: String(z.label ?? '').trim().slice(0, 60),
    ...(String(z.labelEn ?? '').trim() ? { labelEn: String(z.labelEn).trim().slice(0, 60) } : {}),
    price: Math.max(0, Math.round(Number(z.price) || 0)),
    kg: Math.max(0, Math.round((Number(z.kg) || 0) * 100) / 100),
  }));
  if (sizes.length > 12) return { error: 'ใส่ได้ไม่เกิน 12 ขนาด' };
  if (sizes.some((z) => !z.label)) return { error: 'กรอกชื่อขนาดให้ครบทุกแถว' };
  if (sizes.some((z) => z.price <= 0)) return { error: 'กรอกราคาของทุกขนาด' };
  const colorImages = Object.fromEntries(
    Object.entries(product.detail.colorImages ?? {}).filter(([k, v]) => typeof v === 'string' && v && product.colors.some((c) => (c.labelTh ?? c.label) === k)),
  );
  product = { ...product, detail: { ...product.detail, videos, sizes, colorImages } };
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

/* ---------- Discount codes ---------- */

export async function saveDiscountCode(input: DiscountCode, previousCode: string | null): Promise<{ error?: string }> {
  await requireAdmin();
  const code = normalizeCode(String(input.code ?? ''));
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { error: 'โค้ดใช้ได้เฉพาะ A-Z, 0-9, - และ _ ยาว 3-30 ตัว' };
  const kind = input.kind === 'amount' ? 'amount' : 'percent';
  const value = Math.round(Number(input.value) || 0);
  if (kind === 'percent' && (value < 1 || value > 100)) return { error: 'ส่วนลดเป็นเปอร์เซ็นต์ต้องอยู่ระหว่าง 1-100' };
  if (kind === 'amount' && value < 1) return { error: 'ใส่จำนวนเงินส่วนลด' };
  const maxUses = input.maxUses === null || input.maxUses === undefined || String(input.maxUses) === '' ? null : Math.max(1, Math.floor(Number(input.maxUses)));
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return { error: 'วันหมดอายุไม่ถูกต้อง' };
  if (code !== previousCode && (await getDiscount(code))) return { error: 'มีโค้ดนี้อยู่แล้ว' };
  await saveDiscount(
    {
      ...input, code, kind, value, maxUses,
      active: !!input.active,
      minSubtotal: Math.max(0, Math.round(Number(input.minSubtotal) || 0)),
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      note: String(input.note ?? '').trim().slice(0, 200),
      affiliate: String(input.affiliate ?? '').trim().slice(0, 120),
      commissionPercent: Math.max(0, Math.min(100, Math.round((Number(input.commissionPercent) || 0) * 100) / 100)),
    },
    previousCode,
  );
  revalidatePath('/admin/discounts');
  return {};
}

export async function removeDiscountCode(code: string) {
  await requireAdmin();
  await deleteDiscount(code);
  revalidatePath('/admin/discounts');
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
