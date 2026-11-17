import type { Locale } from '../i18n/config';
import type { ColorOption, Product } from './types';

/** English for the fixed colour vocabulary used by the colour presets. */
const COLOR_EN: Record<string, string> = {
  'ฟ้า': 'Blue', 'ส้ม': 'Orange', 'ผสม': 'Mixed', 'เหลือง': 'Yellow', 'ชมพู': 'Pink', 'ฟ้าอมเขียว': 'Teal', 'ม่วง': 'Purple',
  'ฟ้า Sky Blue': 'Sky Blue', 'ผสมฟ้า-ส้ม': 'Blue/orange mix', 'เหยื่อเหลือง': 'Yellow lure', 'เหยื่อฟ้า': 'Blue lure',
  'เหยื่อชมพู': 'Pink lure', 'สายฟ้าอมเขียว': 'Teal strap', 'สายม่วง': 'Purple strap',
  'สีผิวยาง': 'Rubber colour', 'สีเหยื่อ': 'Lure colour', 'สีสาย': 'Strap colour', 'สี': 'Colour',
  'สีผิวยาง ฟ้า ส้ม ผสม': 'Rubber colours: blue, orange, mixed', 'สีเหยื่อ เหลือง ฟ้า ชมพู': 'Lure colours: yellow, blue, pink',
  'สีสาย ฟ้าอมเขียว ม่วง': 'Strap colours: teal, purple',
};
const BADGE_EN: Record<string, string> = { 'สั่งทำ': 'Custom', 'ใหม่': 'New', 'ขายดี': 'Best seller' };

const colorEn = (s: string) => COLOR_EN[s] ?? s;

export const localizeColor = (c: ColorOption, lang: Locale): ColorOption =>
  lang === 'th' ? c : { ...c, label: colorEn(c.label), name: colorEn(c.name), labelTh: c.label };

/** A colour chip label (stored in Thai) in the given language. */
export const colorLabel = (labelTh: string, lang: Locale) => (lang === 'th' ? labelTh : colorEn(labelTh));

/**
 * The product as shown in a language. Thai is stored in the main fields;
 * English comes from `product.en`, falling back to Thai (or a built-in translation) where empty.
 */
export function localizeProduct(p: Product, lang: Locale): Product {
  if (lang === 'th') return p;
  const en = p.en ?? {};
  const d = p.detail;
  return {
    ...p,
    th: en.desc || p.th,
    priceLabel: en.priceLabel || p.priceLabel.replace(/^เริ่ม\s*/, 'From '),
    badge: en.badge || BADGE_EN[p.badge] || p.badge,
    colors: p.colors.map((c) => localizeColor(c, lang)),
    colorsLabel: colorEn(p.colorsLabel),
    swatchesLabel: colorEn(p.swatchesLabel),
    detail: {
      ...d,
      subtitle: en.subtitle || d.subtitle,
      specs: en.specs?.length ? en.specs : d.specs,
      story: d.story && en.story ? { ...d.story, ...en.story } : d.story,
      moves: en.moves?.length ? en.moves : d.moves,
      faq: en.faq?.length ? en.faq : d.faq,
      gallery: d.gallery?.map((g, i) => ({ ...g, alt: en.galleryAlts?.[i] || p.name })),
    },
  };
}
