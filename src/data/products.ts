import type { StaticImageData } from 'next/image';
import { img } from './images';

export type CategoryId = 'sb' | 'ip' | 'tug';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'sb', label: 'Strength & Balance' },
  { id: 'ip', label: 'Interactive Play' },
  { id: 'tug', label: 'Tug Toys' },
];

export interface ColorOption {
  /** Short chip label, e.g. "ฟ้า" */
  label: string;
  /** Full name shown next to the legend, e.g. "ฟ้า Sky Blue" */
  name: string;
  /** CSS background for the swatch dot */
  swatch: string;
}

export const RUBBER_COLORS: ColorOption[] = [
  { label: 'ฟ้า', name: 'ฟ้า Sky Blue', swatch: '#5FAEDB' },
  { label: 'ส้ม', name: 'ส้ม', swatch: '#EE7D2B' },
  { label: 'ผสม', name: 'ผสมฟ้า-ส้ม', swatch: 'linear-gradient(90deg,#5FAEDB 50%,#EE7D2B 50%)' },
];

export const LURE_COLORS: ColorOption[] = [
  { label: 'เหลือง', name: 'เหยื่อเหลือง', swatch: '#F6CF55' },
  { label: 'ฟ้า', name: 'เหยื่อฟ้า', swatch: '#5FAEDB' },
  { label: 'ชมพู', name: 'เหยื่อชมพู', swatch: '#E86FBF' },
];

const CHASER_COLORS: ColorOption[] = [
  { label: 'ฟ้าอมเขียว', name: 'สายฟ้าอมเขียว', swatch: '#5ED6E6' },
  { label: 'ม่วง', name: 'สายม่วง', swatch: '#7C4DE0' },
];

export interface Product {
  slug: string;
  cat: CategoryId;
  name: string;
  /** Thai one-line description */
  th: string;
  /** Price label as shown in listings */
  priceLabel: string;
  /** Base unit price used by the cart (lowest variant). */
  price: number;
  /**
   * Estimated weight per piece in kg, used for shipping.
   * TODO: confirm real weights — only Rabbit Dummy (0.5 kg) is known.
   */
  kg: number;
  img?: StaticImageData;
  /** Lifestyle photos fill the tile; cut-out product shots are contained. */
  cover?: boolean;
  badge?: string;
  comingSoon?: boolean;
  colors?: ColorOption[];
  colorsLabel?: string;
  swatchesLabel?: string;
  /** Takes under-board magnets (฿100 each). */
  magnets?: boolean;
  /** Made-to-measure items link to the custom-size calculator. */
  custom?: boolean;
  sku?: string;
}

export const PRODUCTS: Product[] = [
  { slug: 'place-board', cat: 'sb', name: 'Place Board', th: 'แผ่นกระดาน 80×33×1.5 cm', priceLabel: '฿2,190', price: 2190, kg: 3.5, img: img.placeBoard, cover: true, colors: RUBBER_COLORS, colorsLabel: 'สีผิวยาง', swatchesLabel: 'สีผิวยาง ฟ้า ส้ม ผสม', magnets: true, sku: '0101' },
  { slug: 'target-box', cat: 'sb', name: 'Target Box', th: 'กล่องยืน สูง 6 / 10 cm', priceLabel: 'เริ่ม ฿1,590', price: 1590, kg: 2.6, img: img.targetBox, colors: RUBBER_COLORS, colorsLabel: 'สีผิวยาง', swatchesLabel: 'สีผิวยาง ฟ้า ส้ม ผสม' },
  { slug: 'slant-box', cat: 'sb', name: 'Slant Box', th: 'ฐานเอียง 15° / 20°', priceLabel: 'เริ่ม ฿1,590', price: 1590, kg: 2.4, img: img.slantBox, colors: RUBBER_COLORS, colorsLabel: 'สีผิวยาง', swatchesLabel: 'สีผิวยาง ฟ้า ส้ม ผสม' },
  { slug: 'oct-box', cat: 'sb', name: 'Oct Box', th: 'ฐานแปดเหลี่ยม สูง 16 cm มีรูเสียบ Cavaletti', priceLabel: '฿3,590', price: 3590, kg: 4.2, img: img.octBox, colors: RUBBER_COLORS, colorsLabel: 'สีผิวยาง', swatchesLabel: 'สีผิวยาง ฟ้า ส้ม ผสม' },
  { slug: 'narrow-target', cat: 'sb', name: 'Narrow Target', th: 'ฐานยืน 25 / 35 / 45 cm', priceLabel: 'เริ่ม ฿390', price: 390, kg: 0.6, img: img.narrowTarget, colors: RUBBER_COLORS, colorsLabel: 'สีผิวยาง', swatchesLabel: 'สีผิวยาง ฟ้า ส้ม ผสม' },
  { slug: 'jump-box', cat: 'sb', name: 'Jump Box', th: 'กล่องกระโดด สั่งทำตามขนาด', priceLabel: 'เริ่ม ฿2,590', price: 2590, kg: 6, img: img.jumpBox, cover: true, badge: 'สั่งทำ', custom: true },
  { slug: 'platform', cat: 'sb', name: 'Platform', th: 'ฐานรอง สั่งทำตามขนาด', priceLabel: 'เริ่ม ฿2,990', price: 2990, kg: 6, img: img.magnets, cover: true, badge: 'สั่งทำ', custom: true },
  { slug: 'wobbler', cat: 'sb', name: 'Wobbler', th: 'แท่นโยก 4.5 / 9.5 cm', priceLabel: 'แจ้งเตือนเมื่อพร้อมขาย', price: 0, kg: 0, comingSoon: true, badge: 'Coming soon' },
  { slug: 'flirt-pole', cat: 'ip', name: 'Flirt Pole', th: 'ไซส์ S / M เหยื่อ 3 สี', priceLabel: 'เริ่ม ฿790', price: 790, kg: 0.6, img: img.flirtPole, cover: true, colors: LURE_COLORS, colorsLabel: 'สีเหยื่อ', swatchesLabel: 'สีเหยื่อ เหลือง ฟ้า ชมพู' },
  { slug: 'bungee-pocket', cat: 'tug', name: 'Bungee Pocket', th: 'ขนแกะ + ลูกบอลบันจี้ พกพาสะดวก', priceLabel: '฿1,550', price: 1550, kg: 0.4, img: img.bungeePocket },
  { slug: 'sheepskin-bungee', cat: 'tug', name: 'Sheepskin Bungee / Ball', th: 'ยาว 58 / 62 cm สำหรับหมาที่ชอบดึงแรง', priceLabel: '฿1,450 / ฿1,550', price: 1450, kg: 0.4, img: img.sheepskinBungee },
  { slug: 'sheepskin-chaser', cat: 'tug', name: 'Sheepskin Chaser', th: 'ยาว 112 cm เหมาะกับทุกสายพันธุ์', priceLabel: '฿1,450', price: 1450, kg: 0.4, img: img.sheepskinChaser, colors: CHASER_COLORS, colorsLabel: 'สีสาย', swatchesLabel: 'สีสาย ฟ้าอมเขียว ม่วง' },
  { slug: 'rabbitskin-chaser', cat: 'tug', name: 'Rabbitskin Chaser', th: 'ยาว 118 cm มีตัวบีบส่งเสียงด้านใน', priceLabel: '฿1,550', price: 1550, kg: 0.4, img: img.rabbitskinChaser },
  { slug: 'rabbit-dummy', cat: 'tug', name: 'Rabbit Dummy', th: 'หนัก 500 กรัม ขนกระต่ายแท้', priceLabel: '฿1,550', price: 1550, kg: 0.5, img: img.rabbitDummy },
];

export const findProduct = (slug: string | undefined) => PRODUCTS.find((p) => p.slug === slug);

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.label;

export function productHref(p: Product): string {
  if (p.custom) return '/custom';
  if (p.comingSoon) return '/shop';
  return `/products/${p.slug}`;
}

export const MAGNET_PRICE = 100;
export const MAX_MAGNETS = 6;
