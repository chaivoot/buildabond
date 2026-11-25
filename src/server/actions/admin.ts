'use server';

import { youTubeId } from '../../lib/video';
import { normalizeCode } from '../../lib/discount';
import { normalizeTiers } from '../../lib/commission';
import { deleteDiscount, getDiscount, saveDiscount } from '../discounts';
import type { DiscountCode } from '../../lib/types';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { emailOrderPlaced, emailPaymentConfirmed, emailShipped } from '../orderEmails';
import { codeProblem, discountFor } from '../../lib/discount';
import { redeemDiscount } from '../discounts';
import { priceLine } from '../../lib/pricing';
import { shippingFee } from '../../lib/shipping';
import { formatPhone, isThaiPhone } from '../../lib/phone';
import { SITE } from '../../data/site';
import { customerIdByPhone, recordCustomer } from '../customers';
import { listProducts } from '../products';
import { getSettings } from '../settings';
import { sendEmail } from '../email';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { th } from '../../i18n/th';
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_DAYS, verifySessionToken } from '../../lib/auth';
import type { OrderItem, OrderStatus, Product, RequestStatus, ShopSettings } from '../../lib/types';
import { createOrder, getOrder, linkOrderToCustomer, orderAccessKey, setOrderCode, setOrderStatus, shipOrder } from '../orders';
import { listStock, moveStock, renameStock, setStock } from '../stock';
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
  const before = await getOrder(id);
  await setOrderStatus(id, status);
  // Cancelling puts the items back in stock; reopening a cancelled order takes them out again.
  if (before && before.status !== status && (status === 'ยกเลิก' || before.status === 'ยกเลิก')) {
    await moveStock(before.items, status === 'ยกเลิก' ? 1 : -1, status === 'ยกเลิก' ? 'ยกเลิกออร์เดอร์' : 'เปิดออร์เดอร์ที่ยกเลิกอีกครั้ง', id).catch((e) => console.error('[stock]', e));
  }
  revalidatePath('/admin');
  if (status === 'ยืนยันแล้ว') after(() => emailPaymentConfirmed(id));
}

export async function markShipped(id: string, carrier: string, tracking: string) {
  await requireAdmin();
  if (!tracking.trim()) throw new Error('กรอกเลขพัสดุ');
  await shipOrder(id, carrier.trim(), tracking.trim().toUpperCase());
  revalidatePath('/admin');
  after(() => emailShipped(id));
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
    ...(z.soldOut ? { soldOut: true } : {}),
  }));
  if (sizes.length > 12) return { error: 'ใส่ได้ไม่เกิน 12 ขนาด' };
  if (sizes.some((z) => !z.label)) return { error: 'กรอกชื่อขนาดให้ครบทุกแถว' };
  if (sizes.some((z) => z.price <= 0)) return { error: 'กรอกราคาของทุกขนาด' };
  const colorImages = Object.fromEntries(
    Object.entries(product.detail.colorImages ?? {}).filter(([k, v]) => typeof v === 'string' && v && product.colors.some((c) => (c.labelTh ?? c.label) === k)),
  );
  const colorKeys = new Set(product.colors.map((c) => c.labelTh ?? c.label));
  const soldOutColors = (product.detail.soldOutColors ?? []).filter((k) => colorKeys.has(k));
  product = { ...product, detail: { ...product.detail, videos, sizes, colorImages, soldOutColors } };
  if (slug !== previousSlug && (await getProduct(slug))) return { error: 'มีสินค้าที่ใช้ลิงก์นี้แล้ว' };
  await upsertProduct({ ...product, slug }, previousSlug ?? undefined);
  if (previousSlug && previousSlug !== slug) await renameStock(previousSlug, slug);
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
      commissionTiers: normalizeTiers(Array.isArray(input.commissionTiers) ? input.commissionTiers.slice(0, 10) : []),
      commissionTierMode: input.commissionTierMode === 'marginal' ? 'marginal' : 'whole',
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

/* ---------- Email test ---------- */

/** Sends a test email now (not in the background) and returns Resend's answer, for checking the setup. */
export async function sendTestEmail(to: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const addr = String(to ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return { ok: false, message: 'อีเมลไม่ถูกต้อง' };
  const res = await sendEmail({
    to: addr,
    subject: 'ทดสอบอีเมลจาก Buildabond',
    text: 'ถ้าได้รับอีเมลนี้ แปลว่าระบบส่งอีเมลของเว็บ build-a-bond.com ใช้งานได้แล้ว',
    html: '<p>ถ้าได้รับอีเมลนี้ แปลว่าระบบส่งอีเมลของเว็บ <strong>build-a-bond.com</strong> ใช้งานได้แล้ว</p>',
  });
  revalidatePath('/admin/settings');
  return res.ok
    ? { ok: true, message: `ส่งแล้ว (Resend id ${res.id}) ลองเช็กกล่องจดหมาย และโฟลเดอร์สแปม/Promotions` }
    : { ok: false, message: res.error };
}

/* ---------- Settings ---------- */

export async function updateSettings(s: ShopSettings): Promise<{ error?: string }> {
  await requireAdmin();
  const tiers = s.shipping;
  for (let i = 0; i < tiers.length - 1; i++) {
    const t = tiers[i].upToKg;
    if (t === null || t <= 0 || (i > 0 && t <= (tiers[i - 1].upToKg ?? 0))) return { error: 'น้ำหนักของแต่ละช่วงค่าส่งต้องเรียงจากน้อยไปมาก' };
  }
  const shopEmail = String(s.shopEmail ?? '').trim();
  if (shopEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shopEmail)) return { error: 'อีเมลร้านไม่ถูกต้อง' };
  await saveSettings({ ...s, shopEmail, shipping: tiers.map((t, i) => ({ ...t, upToKg: i === tiers.length - 1 ? null : t.upToKg })) });
  refreshStore();
  revalidatePath('/admin/settings');
  return {};
}

/* ---------- Orders entered by the admin (LINE, Facebook, phone …) ---------- */

export interface AdminOrderLine {
  /** Catalogue product; omit for a custom line (name + price + kg). */
  slug?: string;
  size?: number;
  color?: number;
  magnets?: boolean;
  qty: number;
  /** Overrides the catalogue price for this line (deals, quotes). */
  unitPrice?: number | null;
  name?: string;
  kg?: number;
}

export interface AdminOrderInput {
  source: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  note: string;
  lines: AdminOrderLine[];
  discountCode: string;
  /** false: the code only credits its affiliate; the customer doesn't get its discount. */
  applyCodeDiscount?: boolean;
  /** Baht off when the code's discount isn't used. */
  manualDiscount: number;
  /** null = shipping from the weight tiers */
  shipping: number | null;
  paid: boolean;
  emailCustomer: boolean;
}

const ADMIN_SOURCES = ['line', 'facebook', 'instagram', 'phone', 'walkin', 'other'];

export async function createAdminOrder(input: AdminOrderInput): Promise<{ id: string; link: string } | { error: string }> {
  await requireAdmin();
  const clean = (s: unknown, max = 300) => String(s ?? '').trim().slice(0, max);
  const name = clean(input.name, 120);
  const phoneRaw = clean(input.phone, 40);
  const email = clean(input.email, 200).toLowerCase();
  if (!name) return { error: 'กรอกชื่อลูกค้า' };
  if (!phoneRaw) return { error: 'กรอกเบอร์โทรลูกค้า' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'อีเมลลูกค้าไม่ถูกต้อง' };
  const phone = isThaiPhone(phoneRaw) ? formatPhone(phoneRaw) : phoneRaw;
  const addr = {
    name, street: clean(input.street), subdistrict: clean(input.subdistrict, 100), district: clean(input.district, 100),
    province: clean(input.province, 100), postcode: clean(input.postcode, 10),
  };
  const address = [addr.street, addr.subdistrict, addr.district, addr.province, addr.postcode].filter(Boolean).join(' ');
  const lines = Array.isArray(input.lines) ? input.lines.slice(0, 50) : [];
  if (!lines.length) return { error: 'เพิ่มสินค้าอย่างน้อย 1 รายการ' };

  const [products, settings] = await Promise.all([listProducts(), getSettings()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items: OrderItem[] = [];
  for (const [i, l] of lines.entries()) {
    const qty = Math.max(1, Math.min(999, Math.floor(Number(l.qty) || 1)));
    const override = l.unitPrice === null || l.unitPrice === undefined || String(l.unitPrice) === '' ? null : Math.max(0, Math.round(Number(l.unitPrice)));
    if (l.slug) {
      const p = bySlug.get(l.slug);
      // Admin orders may include hidden / pre-order products, so price them as if visible.
      const priced = p ? priceLine({ slug: l.slug, qty, size: l.size, color: l.color, magnets: l.magnets ? 1 : 0 }, { ...p, visible: true, comingSoon: false, custom: false }, settings, { allowSoldOut: true }) : null;
      if (!priced) return { error: `รายการที่ ${i + 1}: ไม่พบสินค้านี้` };
      items.push({ slug: priced.slug, name: priced.name, opt: priced.opt, unitPrice: override ?? priced.unitPrice, qty, kg: priced.kg, ...(priced.variant ? { variant: priced.variant } : {}) });
    } else {
      const itemName = clean(l.name, 120);
      if (!itemName) return { error: `รายการที่ ${i + 1}: กรอกชื่อรายการ` };
      if (override === null) return { error: `รายการที่ ${i + 1}: กรอกราคา` };
      items.push({ slug: 'custom-line', name: itemName, opt: '—', unitPrice: override, qty, kg: Math.max(0, Number(l.kg) || 0) });
    }
  }
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const kg = Math.round(items.reduce((a, i) => a + i.kg * i.qty, 0) * 10) / 10;
  const shipping = input.shipping === null || input.shipping === undefined || String(input.shipping) === '' ? shippingFee(kg, settings.shipping) : Math.max(0, Math.round(Number(input.shipping)));

  let discountCode = '';
  let discount = 0;
  const wanted = normalizeCode(clean(input.discountCode, 40));
  if (wanted && input.applyCodeDiscount === false) {
    // Affiliate credit only: any existing code, no discount from it, no use counted.
    const code = await getDiscount(wanted);
    if (!code) return { error: th.errors.codeInvalid };
    discountCode = code.code;
    discount = Math.max(0, Math.min(subtotal, Math.round(Number(input.manualDiscount) || 0)));
  } else if (wanted) {
    const code = await getDiscount(wanted);
    const problem = codeProblem(code, subtotal);
    if (problem || !code) return { error: th.errors[problem ?? 'codeInvalid'] };
    if (!(await redeemDiscount(code.code))) return { error: th.errors.codeUsedUp };
    discountCode = code.code;
    discount = discountFor(code, subtotal);
  } else {
    discount = Math.max(0, Math.min(subtotal, Math.round(Number(input.manualDiscount) || 0)));
  }

  const source = ADMIN_SOURCES.includes(input.source) ? input.source : 'other';
  const { id, key } = await createOrder({
    name, phone, email, address, note: clean(input.note, 500), customerId: null, items, subtotal, discountCode, discount, shipping,
    total: subtotal - discount + shipping, kg, lang: 'th', source,
  });
  await moveStock(items, -1, 'ออร์เดอร์จากหลังบ้าน', id).catch((e) => console.error('[stock] deduct failed', id, e));
  if (input.paid) await setOrderStatus(id, 'ยืนยันแล้ว');
  try {
    const customerId = email ? await recordCustomer(email, phone, addr, {}, id) : await customerIdByPhone(phone);
    if (customerId) await linkOrderToCustomer(id, customerId);
  } catch {
    /* the order exists either way */
  }
  if (input.emailCustomer && email) after(() => (input.paid ? emailPaymentConfirmed(id) : emailOrderPlaced(id, { notifyShop: false })));
  revalidatePath('/admin');
  return { id, link: `${SITE.url}/order-placed?id=${encodeURIComponent(id)}&k=${key}` };
}

/** Changes which affiliate code an order counts for in the report ('' = none). */
export async function updateOrderAffiliate(id: string, raw: string): Promise<{ error?: string }> {
  await requireAdmin();
  const wanted = normalizeCode(String(raw ?? ''));
  if (wanted && !(await getDiscount(wanted))) return { error: th.errors.codeInvalid };
  await setOrderCode(id, wanted);
  revalidatePath('/admin');
  revalidatePath('/admin/discounts');
  return {};
}

/** The customer's order-page link for an existing order (to send on LINE etc.). */
export async function orderLinkForAdmin(id: string): Promise<string | null> {
  await requireAdmin();
  const key = await orderAccessKey(id);
  return key ? `${SITE.url}/order-placed?id=${encodeURIComponent(id)}&k=${key}` : null;
}

/** Checks a code for the admin order form (no rate limit, uses the form's subtotal). */
export async function checkDiscountCodeAdmin(raw: string, subtotal: number): Promise<{ ok: true; rule: { code: string; kind: 'percent' | 'amount'; value: number; minSubtotal: number } } | { ok: false; error: string }> {
  await requireAdmin();
  const code = await getDiscount(normalizeCode(String(raw ?? '')));
  const problem = codeProblem(code, Math.max(0, Number(subtotal) || 0));
  if (problem || !code) return { ok: false, error: th.errors[problem ?? 'codeInvalid'] };
  return { ok: true, rule: { code: code.code, kind: code.kind, value: code.value, minSubtotal: code.minSubtotal } };
}

/* ---------- Stock (admin only) ---------- */

/** Saves stock counts typed in the product editor; only the cells that changed are sent. null = stop tracking. */
export async function saveStock(slug: string, changes: Record<string, number | null>): Promise<{ error?: string; stock?: Record<string, number> }> {
  await requireAdmin();
  const clean: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(changes ?? {}).slice(0, 200)) {
    if (typeof k !== 'string' || !k.includes('|')) continue;
    clean[k] = v === null || v === undefined || String(v) === '' ? null : Math.round(Number(v));
    if (clean[k] !== null && !Number.isFinite(clean[k])) return { error: 'จำนวนสต็อกต้องเป็นตัวเลข' };
  }
  await setStock(slug, clean);
  revalidatePath('/admin/products');
  return { stock: (await listStock(slug))[slug] ?? {} };
}
