/** Shared shapes used by the storefront, the admin and the database layer. */

export type CategoryId = 'sb' | 'ip' | 'tug';

export interface ColorOption {
  /** Short chip label, e.g. "ฟ้า" */
  label: string;
  /** Full name shown next to the legend, e.g. "ฟ้า Sky Blue" */
  name: string;
  /** CSS background for the swatch dot */
  swatch: string;
  /** Original Thai label, kept when the option is shown in another language. */
  labelTh?: string;
}

/** One size of a product. Its price and weight replace the product's own when chosen. */
export interface ProductSize {
  /** e.g. "สูง 6 cm", "S" */
  label: string;
  /** English label; empty uses the Thai one. */
  labelEn?: string;
  price: number;
  /** Weight per piece in kg, used for shipping. */
  kg: number;
}

export interface ProductDetail {
  /** "แผ่นกระดาน 80 × 33 × 1.5 cm · รหัส 0101" */
  subtitle?: string;
  gallery?: { src: string; alt: string }[];
  /** YouTube links (watch, youtu.be or Shorts), shown after the photos in the gallery. */
  videos?: string[];
  /** Sizes the customer picks from; empty or missing means one size (the product's own price and weight). */
  sizes?: ProductSize[];
  /** Photo per colour, keyed by the colour's Thai label; the main image switches to it when that colour is chosen. */
  colorImages?: Record<string, string>;
  story?: { title: string; body: string; img: string; alt: string };
  moves?: { tag: string; tone: string; title: string; body: string }[];
  specs?: [string, string][];
  related?: string[];
  faq?: { q: string; a: string }[];
}

/** English copy for a product. Empty fields fall back to the Thai text. */
export interface ProductText {
  desc?: string;
  priceLabel?: string;
  badge?: string;
  subtitle?: string;
  specs?: [string, string][];
  story?: { title: string; body: string; alt: string };
  moves?: { tag: string; tone: string; title: string; body: string }[];
  faq?: { q: string; a: string }[];
  galleryAlts?: string[];
}

export type StockStatus = 'ready' | 'preorder';

export interface Product {
  slug: string;
  sort: number;
  cat: CategoryId;
  name: string;
  /** Thai one-line description */
  th: string;
  /** Price label as shown in listings, e.g. "เริ่ม ฿1,590" */
  priceLabel: string;
  /** Base unit price used by the cart and orders. */
  price: number;
  /** Weight per piece in kg, used for shipping. */
  kg: number;
  /** Main image URL (/images/..., Vercel Blob, or data: URL) */
  img: string;
  /** Lifestyle photos fill the tile; cut-out product shots are contained. */
  cover: boolean;
  badge: string;
  comingSoon: boolean;
  /** Made-to-measure items link to the custom-size calculator. */
  custom: boolean;
  colors: ColorOption[];
  colorsLabel: string;
  swatchesLabel: string;
  /** Offers magnets as an optional add-on (customer chooses yes/no). */
  magnets: boolean;
  /** How many magnets this product needs when the add-on is chosen. */
  magnetCount: number;
  sku: string;
  stock: StockStatus;
  visible: boolean;
  detail: ProductDetail;
  en: ProductText;
}

export interface ShippingTier {
  /** Upper bound in kg (exclusive); null for the last tier. */
  upToKg: number | null;
  fee: number;
}

export interface ShopSettings {
  /** nameEn is shown to English-language visitors. */
  bank: { name: string; nameEn?: string; number: string; holder: string };
  /** PromptPay phone or national ID; empty hides the QR. */
  promptpay: string;
  magnetPrice: number;
  /** @deprecated magnets are now a fixed count per product (Product.magnetCount). */
  maxMagnets: number;
  shipping: ShippingTier[];
}

export type OrderStatus = 'รอชำระ' | 'ส่งสลิปแล้ว' | 'ยืนยันแล้ว' | 'จัดส่งแล้ว' | 'ยกเลิก';

export interface OrderItem {
  slug: string;
  name: string;
  opt: string;
  unitPrice: number;
  qty: number;
  kg: number;
}

export interface Order {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  /** Discount code used (upper case), or '' */
  discountCode: string;
  /** Baht taken off the subtotal */
  discount: number;
  shipping: number;
  total: number;
  kg: number;
  status: OrderStatus;
  slipUrl: string;
  slipAt: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  carrier: string;
  tracking: string;
  /** Linked customer (see /admin/customers); null for guest orders that couldn't be linked. */
  customerId: string | null;
}

export type DiscountKind = 'percent' | 'amount';

export interface DiscountCode {
  /** Upper case, e.g. MOMMAM */
  code: string;
  /** percent: value is % off the subtotal · amount: value is baht off */
  kind: DiscountKind;
  value: number;
  active: boolean;
  /** Smallest subtotal the code works on (0 = any). */
  minSubtotal: number;
  /** Total uses allowed across all customers; null = unlimited. */
  maxUses: number | null;
  usedCount: number;
  /** Last day it works, ISO; null = no end date. */
  expiresAt: string | null;
  note: string;
  /** Who the code belongs to (an affiliate / partner), shown in the report. */
  affiliate: string;
  /** Commission for the affiliate, % of net sales (items after discount, no shipping) on paid orders. */
  commissionPercent: number;
  createdAt: string;
}

/** An order that used a discount code, for the code report. */
export interface CodeOrder {
  id: string;
  createdAt: string;
  name: string;
  status: OrderStatus;
  discountCode: string;
  subtotal: number;
  discount: number;
  total: number;
}

export type RequestKind = 'custom' | 'business';
export type RequestStatus = 'ใหม่' | 'ติดต่อแล้ว' | 'ปิดแล้ว';

export interface ShopRequest {
  id: string;
  kind: RequestKind;
  createdAt: string;
  status: RequestStatus;
  name: string;
  contact: string;
  /** Free-form fields from the form, shown as label/value pairs. */
  data: Record<string, string>;
}
