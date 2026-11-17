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

export interface ProductDetail {
  /** "แผ่นกระดาน 80 × 33 × 1.5 cm · รหัส 0101" */
  subtitle?: string;
  gallery?: { src: string; alt: string }[];
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
  /** Takes under-board magnets. */
  magnets: boolean;
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
