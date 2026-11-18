/**
 * Owner's price list (Price_List.xlsx, Nov 2026) and product photos.
 * Applied to new databases through the seed and to existing ones once by the `catalog-2` migration.
 * Prices "with magnet" = price + magnetCount × magnet price (฿100), so Place Board uses 3 magnets (+฿300)
 * and Target / Slant Box use 2 (+฿200). Oct Box and Narrow Target are listed with magnets only, so no add-on.
 */
import type { ProductDetail, ProductSize, ProductText } from '../lib/types';

export interface CatalogUpdate {
  price: number;
  priceLabel: string;
  priceLabelEn?: string;
  th?: string;
  desc?: string;
  sku?: string;
  magnetCount?: number;
  sizes?: ProductSize[];
  /** Photos; replace the gallery only while it still holds the design file's placeholders. */
  img?: string;
  cover?: boolean;
  gallery?: { src: string; alt: string; altEn: string }[];
  colorImages?: Record<string, string>;
}

const pic = (slug: string, n: number) => `/images/products/${slug}-${n}.jpg`;

export const CATALOG: Record<string, CatalogUpdate> = {
  'place-board': {
    price: 1890, priceLabel: '฿1,890', sku: '0101', magnetCount: 3,
    img: pic('place-board', 1), cover: true,
    gallery: [
      { src: pic('place-board', 1), alt: 'ค็อกเกอร์สแปเนียลยืนบน Place Board สีฟ้ากลางสนาม', altEn: 'Cocker spaniel standing on a blue Place Board in a park' },
      { src: pic('place-board', 2), alt: 'Place Board ผิวยางสีฟ้า', altEn: 'Place Board with a sky-blue rubber top' },
      { src: pic('place-board', 3), alt: 'ด้านล่างแผ่นกระดานและฐานไม้ที่ฝังแม่เหล็ก', altEn: 'Underside of the board and bases with built-in magnets' },
    ],
    colorImages: { 'ฟ้า': pic('place-board', 2) },
  },
  'target-box': {
    price: 1390, priceLabel: 'เริ่ม ฿1,390', priceLabelEn: 'From ฿1,390', sku: '0201',
    sizes: [
      { label: 'สูง 6 cm', labelEn: '6 cm high', price: 1390, kg: 2.6 },
      { label: 'สูง 10 cm', labelEn: '10 cm high', price: 1490, kg: 2.6 },
    ],
    img: pic('target-box', 2),
    gallery: [
      { src: pic('target-box', 1), alt: 'ค็อกเกอร์สแปเนียลนั่งบน Target Box', altEn: 'Cocker spaniel sitting on a Target Box' },
      { src: pic('target-box', 2), alt: 'Target Box สูง 6 cm ผิวยางสีส้ม', altEn: 'Target Box, 6 cm high, orange rubber top' },
      { src: pic('target-box', 3), alt: 'Target Box สูง 10 cm ผิวยางสีส้ม', altEn: 'Target Box, 10 cm high, orange rubber top' },
      { src: pic('target-box', 4), alt: 'Target Box วางบนสนามหญ้า', altEn: 'Target Box on the grass' },
    ],
    colorImages: { 'ส้ม': pic('target-box', 2) },
  },
  'slant-box': {
    price: 1390, priceLabel: 'เริ่ม ฿1,390', priceLabelEn: 'From ฿1,390', sku: '0301',
    th: 'ฐานเอียง สูง 9 / 17 cm', desc: 'Incline, 9 / 17 cm high',
    sizes: [
      { label: 'สูง 9 cm', labelEn: '9 cm high', price: 1390, kg: 2.4 },
      { label: 'สูง 17 cm', labelEn: '17 cm high', price: 1490, kg: 2.4 },
    ],
    img: pic('slant-box', 2),
    gallery: [
      { src: pic('slant-box', 1), alt: 'ค็อกเกอร์สแปเนียลยืนเท้าหน้าบน Slant Box', altEn: 'Cocker spaniel with front paws on a Slant Box' },
      { src: pic('slant-box', 2), alt: 'Slant Box สูง 9 cm ผิวยางสีส้ม', altEn: 'Slant Box, 9 cm high, orange rubber top' },
      { src: pic('slant-box', 3), alt: 'Slant Box สูง 17 cm ผิวยางสีฟ้า', altEn: 'Slant Box, 17 cm high, sky-blue rubber top' },
      { src: pic('slant-box', 4), alt: 'Slant Box ด้านข้าง', altEn: 'Slant Box from the side' },
      { src: pic('slant-box', 5), alt: 'หมายืนบน Slant Box สองตัวพร้อมกัน', altEn: 'Dog standing across two Slant Boxes' },
    ],
    colorImages: { 'ส้ม': pic('slant-box', 2), 'ฟ้า': pic('slant-box', 3) },
  },
  'oct-box': {
    price: 3290, priceLabel: 'เริ่ม ฿3,290', priceLabelEn: 'From ฿3,290', sku: '0401',
    th: 'ฐานแปดเหลี่ยม สูง 8 / 16 / 25 cm มีรูเสียบ Cavaletti', desc: 'Octagonal base, 8 / 16 / 25 cm high, with Cavaletti holes',
    sizes: [
      { label: 'สูง 8 cm', labelEn: '8 cm high', price: 3290, kg: 4.2 },
      { label: 'สูง 16 cm', labelEn: '16 cm high', price: 3590, kg: 4.2 },
      { label: 'สูง 25 cm', labelEn: '25 cm high', price: 3890, kg: 4.2 },
    ],
    img: pic('oct-box', 2),
    gallery: [
      { src: pic('oct-box', 1), alt: 'ค็อกเกอร์สแปเนียลยืนบน Oct Box', altEn: 'Cocker spaniel standing on an Oct Box' },
      { src: pic('oct-box', 2), alt: 'Oct Box ผิวยางสีผสม', altEn: 'Oct Box with a mixed-colour rubber top' },
      { src: pic('oct-box', 3), alt: 'หมาไทยยืนบน Oct Box', altEn: 'Thai dog standing on an Oct Box' },
    ],
    colorImages: { 'ผสม': pic('oct-box', 2) },
  },
  'narrow-target': {
    price: 390, priceLabel: 'เริ่ม ฿390', priceLabelEn: 'From ฿390', sku: '0501',
    sizes: [
      { label: 'ยาว 25 cm', labelEn: '25 cm', price: 390, kg: 0.6 },
      { label: 'ยาว 35 cm', labelEn: '35 cm', price: 490, kg: 0.6 },
      { label: 'ยาว 45 cm', labelEn: '45 cm', price: 590, kg: 0.6 },
    ],
    img: pic('narrow-target', 2),
    gallery: [
      { src: pic('narrow-target', 1), alt: 'ค็อกเกอร์สแปเนียลนั่งบน Narrow Target', altEn: 'Cocker spaniel sitting on a Narrow Target' },
      { src: pic('narrow-target', 2), alt: 'Narrow Target สามขนาด 25 / 35 / 45 cm', altEn: 'Narrow Targets in three sizes: 25, 35 and 45 cm' },
      { src: pic('narrow-target', 3), alt: 'ฝึกยืนบน Narrow Target ข้างเจ้าของ', altEn: 'Practising a stand on a Narrow Target next to the handler' },
    ],
    colorImages: { 'ฟ้า': pic('narrow-target', 2) },
  },
  wobbler: {
    price: 1090, priceLabel: 'แจ้งเตือนเมื่อพร้อมขาย', sku: '0601',
    sizes: [
      { label: 'สูง 4.5 cm', labelEn: '4.5 cm high', price: 1090, kg: 0 },
      { label: 'สูง 9.5 cm', labelEn: '9.5 cm high', price: 1190, kg: 0 },
    ],
  },
  'jump-box': {
    price: 2590, priceLabel: 'เริ่ม ฿2,590', priceLabelEn: 'From ฿2,590', sku: '0701',
    img: pic('custom', 1), cover: true,
    gallery: [{ src: pic('custom', 1), alt: 'ค็อกเกอร์สแปเนียลยืนบน Jump Box สั่งทำ', altEn: 'Cocker spaniel on a made-to-measure Jump Box' }],
  },
  platform: {
    price: 2990, priceLabel: 'เริ่ม ฿2,990', priceLabelEn: 'From ฿2,990', sku: '0702',
    img: pic('custom', 2), cover: true,
    gallery: [{ src: pic('custom', 2), alt: 'คอร์กี้ฝึกบน Platform สั่งทำ', altEn: 'Corgi training on made-to-measure platforms' }],
  },
};

/** Detail and English fields for one update, merged over what's there. */
export function catalogDetail(u: CatalogUpdate, detail: ProductDetail): ProductDetail {
  return {
    ...detail,
    ...(u.sizes ? { sizes: u.sizes } : {}),
    ...(u.gallery ? { gallery: u.gallery.map(({ src, alt }) => ({ src, alt })) } : {}),
    ...(u.colorImages ? { colorImages: u.colorImages } : {}),
  };
}

export function catalogEn(u: CatalogUpdate, en: ProductText): ProductText {
  return {
    ...en,
    ...(u.priceLabelEn ? { priceLabel: u.priceLabelEn } : {}),
    ...(u.desc ? { desc: u.desc } : {}),
    ...(u.gallery ? { galleryAlts: u.gallery.map((g) => g.altEn) } : {}),
  };
}
