/**
 * Order emails, sent in the background after the action that triggers them:
 * customer: order received, payment confirmed, shipped · shop: new order, slip uploaded.
 * Customer emails use the language they ordered in; shop alerts are in Thai.
 */
import { SITE } from '../data/site';
import type { Order, ShopSettings } from '../lib/types';
import { logEmail, sendEmail } from './email';
import { getOrderForEmail } from './orders';
import { getSettings } from './settings';

type Lang = 'th' | 'en';

const money = (n: number) => `฿${n.toLocaleString('en-US')}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const T = {
  th: {
    hello: (n: string) => `สวัสดีคุณ${n}`,
    orderNo: 'เลขออร์เดอร์',
    subtotal: 'ยอดสินค้า',
    discount: (c: string) => `ส่วนลด (${c})`,
    shipping: (kg: number) => `ค่าส่ง (${kg} กก.)`,
    total: 'ยอดที่ต้องโอน',
    viewOrder: 'ดูออร์เดอร์และอัปโหลดสลิป',
    viewOrderPaid: 'ดูออร์เดอร์',
    track: 'ติดตามพัสดุ',
    footer: 'มีคำถาม ตอบกลับอีเมลนี้ หรือทักทาง LINE @730ogvop ได้เลย',
    placed: {
      subject: (id: string) => `ได้รับคำสั่งซื้อ ${id} แล้ว · Buildabond`,
      lead: 'ขอบคุณที่สั่งซื้อกับ Buildabond เราได้รับคำสั่งซื้อของคุณแล้ว กรุณาโอนเงินตามยอดด้านล่าง แล้วอัปโหลดสลิปในหน้าออร์เดอร์',
      pay: 'ช่องทางชำระเงิน',
      bank: (b: ShopSettings['bank']) => `${b.name} เลขที่ ${b.number} ชื่อบัญชี ${b.holder}`,
      promptpay: 'หรือสแกน QR พร้อมเพย์ได้ในหน้าออร์เดอร์',
    },
    confirmed: {
      subject: (id: string) => `ยืนยันการชำระเงิน ${id} แล้ว · Buildabond`,
      lead: 'เราได้รับเงินแล้ว ขอบคุณครับ ทีมกำลังเตรียมสินค้า และจะส่งอีเมลแจ้งเลขพัสดุเมื่อจัดส่ง',
    },
    shipped: {
      subject: (id: string) => `จัดส่งออร์เดอร์ ${id} แล้ว · Buildabond`,
      lead: 'สินค้าของคุณออกเดินทางแล้ว',
      carrier: 'ขนส่ง',
      tracking: 'เลขพัสดุ',
    },
  },
  en: {
    hello: (n: string) => `Hi ${n},`,
    orderNo: 'Order number',
    subtotal: 'Subtotal',
    discount: (c: string) => `Discount (${c})`,
    shipping: (kg: number) => `Shipping (${kg} kg)`,
    total: 'Amount to pay',
    viewOrder: 'View order and upload slip',
    viewOrderPaid: 'View order',
    track: 'Track your parcel',
    footer: 'Questions? Reply to this email or message us on LINE @730ogvop.',
    placed: {
      subject: (id: string) => `Order ${id} received · Buildabond`,
      lead: 'Thanks for ordering from Buildabond. We’ve received your order. Please transfer the amount below, then upload your slip on the order page.',
      pay: 'How to pay',
      bank: (b: ShopSettings['bank']) => `${b.nameEn || b.name}, account ${b.number}, ${b.holder}`,
      promptpay: 'Or scan the PromptPay QR on the order page.',
    },
    confirmed: {
      subject: (id: string) => `Payment confirmed for ${id} · Buildabond`,
      lead: 'We’ve received your payment, thank you. We’re preparing your order and will email the tracking number when it ships.',
    },
    shipped: {
      subject: (id: string) => `Order ${id} has shipped · Buildabond`,
      lead: 'Your order is on its way.',
      carrier: 'Carrier',
      tracking: 'Tracking number',
    },
  },
};

const orderLink = (o: Order, key: string) => `${SITE.url}/order-placed?id=${encodeURIComponent(o.id)}&k=${encodeURIComponent(key)}`;
const adminLink = (o: Order) => `${SITE.url}/admin?order=${encodeURIComponent(o.id)}`;

function layout(body: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f1e9;font-family:-apple-system,'Segoe UI',Tahoma,sans-serif;color:#2b2016">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<p style="margin:0 0 16px;font-size:20px;font-weight:600">Buildabond</p>
<div style="background:#fff;border-radius:16px;padding:24px">${body}</div>
<p style="margin:16px 4px 0;font-size:13px;color:#6b5d4f">${esc(footer)}</p>
</div></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:22px 0 4px"><a href="${esc(href)}" style="display:inline-block;background:#2b2016;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">${esc(label)}</a></p>`;

function summary(o: Order, t: (typeof T)[Lang]) {
  const row = (l: string, r: string, style = '') => `<tr><td style="padding:6px 0;${style}">${l}</td><td style="padding:6px 0;text-align:right;${style}">${r}</td></tr>`;
  const items = o.items
    .map((i) => row(`${esc(i.name)}${i.opt && i.opt !== '—' ? `<br><span style="color:#6b5d4f;font-size:13px">${esc(i.opt)}</span>` : ''}${i.qty > 1 ? ` × ${i.qty}` : ''}`, money(i.unitPrice * i.qty)))
    .join('');
  return `<table style="width:100%;border-collapse:collapse;font-size:15px;margin-top:14px">${items}
${row(t.subtotal, money(o.subtotal), 'border-top:1px solid #eee5d8')}
${o.discount > 0 ? row(esc(t.discount(o.discountCode)), `−${money(o.discount)}`, 'color:#1d6b2a') : ''}
${row(t.shipping(o.kg), money(o.shipping))}
${row(`<strong>${t.total}</strong>`, `<strong>${money(o.total)}</strong>`, 'font-size:17px')}</table>`;
}

const textSummary = (o: Order, t: (typeof T)[Lang]) =>
  [
    ...o.items.map((i) => `- ${i.name}${i.opt && i.opt !== '—' ? ` (${i.opt})` : ''}${i.qty > 1 ? ` × ${i.qty}` : ''}: ${money(i.unitPrice * i.qty)}`),
    `${t.subtotal}: ${money(o.subtotal)}`,
    o.discount > 0 ? `${t.discount(o.discountCode)}: −${money(o.discount)}` : '',
    `${t.shipping(o.kg)}: ${money(o.shipping)}`,
    `${t.total}: ${money(o.total)}`,
  ].filter(Boolean).join('\n');

/** Runs one order email job; anything unexpected is written to the email log instead of vanishing. */
async function guarded(job: string, id: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    console.error('[email]', job, id, e);
    await logEmail('', `${job} ${id}`, 'failed', e instanceof Error ? e.message : String(e));
  }
}

async function load(id: string) {
  const [info, settings] = await Promise.all([getOrderForEmail(id), getSettings()]);
  return info ? { ...info, settings } : null;
}

/** Customer: "we got your order, here's how to pay" · Shop: new order alert. */
export const emailOrderPlaced = (id: string, opts: { notifyShop?: boolean } = {}) => guarded('emailOrderPlaced', id, async () => {
  const x = await load(id);
  if (!x) return;
  const { order: o, key, lang, settings: s } = x;
  const t = T[lang];
  const pay = `<p style="margin:18px 0 4px;font-weight:600">${t.placed.pay}</p><p style="margin:0">${esc(t.placed.bank(s.bank))}${s.promptpay ? `<br>${t.placed.promptpay}` : ''}</p>`;
  const notifyShop = opts.notifyShop !== false;
  await Promise.all([
    sendEmail({
      to: o.email,
      replyTo: s.shopEmail,
      subject: t.placed.subject(o.id),
      html: layout(`<p style="margin:0">${esc(t.hello(o.name))}</p><p>${t.placed.lead}</p><p style="margin:0;color:#6b5d4f">${t.orderNo} <strong style="color:#2b2016">${o.id}</strong></p>${summary(o, t)}${pay}${button(orderLink(o, key), t.viewOrder)}`, t.footer),
      text: `${t.hello(o.name)}\n\n${t.placed.lead}\n\n${t.orderNo}: ${o.id}\n${textSummary(o, t)}\n\n${t.placed.pay}: ${t.placed.bank(s.bank)}\n${orderLink(o, key)}\n\n${t.footer}`,
    }),
    notifyShop && sendEmail({
      to: s.shopEmail,
      replyTo: o.email,
      subject: `ออร์เดอร์ใหม่ ${o.id} · ${money(o.total)} · ${o.name}`,
      html: layout(`<p style="margin:0">มีออร์เดอร์ใหม่ รอลูกค้าโอนเงิน</p><p style="margin:10px 0 0">${esc(o.name)} · ${esc(o.phone)} · ${esc(o.email)}<br>${esc(o.address)}${o.note ? `<br>หมายเหตุ: ${esc(o.note)}` : ''}</p>${summary(o, T.th)}${button(adminLink(o), 'เปิดในหลังบ้าน')}`, 'อีเมลแจ้งเตือนจากเว็บ build-a-bond.com'),
      text: `ออร์เดอร์ใหม่ ${o.id}\n${o.name} · ${o.phone} · ${o.email}\n${o.address}\n${textSummary(o, T.th)}\n${adminLink(o)}`,
    }),
  ]);
});

/** Shop: the customer uploaded a slip to check. */
export const emailSlipUploaded = (id: string) => guarded('emailSlipUploaded', id, async () => {
  const x = await load(id);
  if (!x) return;
  const { order: o, settings: s } = x;
  await sendEmail({
    to: s.shopEmail,
    replyTo: o.email,
    subject: `ลูกค้าส่งสลิปแล้ว ${o.id} · ${money(o.total)}`,
    html: layout(`<p style="margin:0">${esc(o.name)} อัปโหลดสลิปของออร์เดอร์ <strong>${o.id}</strong> ยอด ${money(o.total)} แล้ว ตรวจยอดแล้วกดยืนยันในหลังบ้านได้เลย</p>${o.slipUrl && !o.slipUrl.startsWith('data:') ? `<p><a href="${esc(o.slipUrl)}">ดูรูปสลิป</a></p>` : ''}${button(adminLink(o), 'ตรวจสลิปในหลังบ้าน')}`, 'อีเมลแจ้งเตือนจากเว็บ build-a-bond.com'),
    text: `${o.name} อัปโหลดสลิปของออร์เดอร์ ${o.id} ยอด ${money(o.total)}\n${adminLink(o)}`,
  });
});

/** Customer: payment confirmed by the shop. */
export const emailPaymentConfirmed = (id: string) => guarded('emailPaymentConfirmed', id, async () => {
  const x = await load(id);
  if (!x) return;
  const { order: o, key, lang, settings: s } = x;
  const t = T[lang];
  await sendEmail({
    to: o.email,
    replyTo: s.shopEmail,
    subject: t.confirmed.subject(o.id),
    html: layout(`<p style="margin:0">${esc(t.hello(o.name))}</p><p>${t.confirmed.lead}</p><p style="margin:0;color:#6b5d4f">${t.orderNo} <strong style="color:#2b2016">${o.id}</strong></p>${summary(o, t)}${button(orderLink(o, key), t.viewOrderPaid)}`, t.footer),
    text: `${t.hello(o.name)}\n\n${t.confirmed.lead}\n\n${t.orderNo}: ${o.id}\n${textSummary(o, t)}\n${orderLink(o, key)}\n\n${t.footer}`,
  });
});

/** Customer: shipped, with carrier and tracking number. */
export const emailShipped = (id: string) => guarded('emailShipped', id, async () => {
  const x = await load(id);
  if (!x) return;
  const { order: o, lang, settings: s } = x;
  const t = T[lang];
  const trackUrl = `${SITE.url}/track`;
  await sendEmail({
    to: o.email,
    replyTo: s.shopEmail,
    subject: t.shipped.subject(o.id),
    html: layout(`<p style="margin:0">${esc(t.hello(o.name))}</p><p>${t.shipped.lead}</p><p style="margin:0">${t.orderNo} <strong>${o.id}</strong><br>${t.shipped.carrier}: ${esc(o.carrier)}<br>${t.shipped.tracking}: <strong style="font-size:17px;letter-spacing:.04em">${esc(o.tracking)}</strong></p>${button(trackUrl, t.track)}`, t.footer),
    text: `${t.hello(o.name)}\n\n${t.shipped.lead}\n${t.orderNo}: ${o.id}\n${t.shipped.carrier}: ${o.carrier}\n${t.shipped.tracking}: ${o.tracking}\n${trackUrl}\n\n${t.footer}`,
  });
});
