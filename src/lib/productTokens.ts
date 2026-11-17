/**
 * Product copy (specs, FAQ) may contain tokens that are filled from live data, so the text
 * always matches what's set in the admin:
 *   {kg}           the product's weight
 *   {magnets}      how many magnets the product uses
 *   {magnetPrice}  the magnet price, e.g. ฿100
 */
export const PRODUCT_TOKENS_HELP = '{kg} = น้ำหนักสินค้า · {magnets} = จำนวนแม่เหล็ก · {magnetPrice} = ราคาแม่เหล็กต่อชิ้น';

export function fillProductTokens(text: string, v: { kg: number; magnets: number; magnetPrice: number }): string {
  return text
    .replaceAll('{kg}', String(v.kg))
    .replaceAll('{magnets}', String(v.magnets))
    .replaceAll('{magnetPrice}', `฿${v.magnetPrice.toLocaleString('en-US')}`);
}
