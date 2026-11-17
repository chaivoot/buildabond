/**
 * Thai phone numbers, shared by the browser and the server.
 * Accepts what people and autofill type: "081-234-5678", "+66 81 234 5678", "0066812345678", "66812345678".
 */

/** Digits only, with the Thai country code (+66 / 0066 / 66) turned into a leading 0. */
export function normalizePhone(s: string): string {
  let d = s.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2); // international dialling prefix
  if (d.startsWith('66') && (d.length === 11 || d.length === 10)) d = `0${d.slice(2)}`; // mobile (11) or landline (10)
  return d;
}

/** Mobile numbers are 10 digits (0X-XXXX-XXXX), landlines 9 (02-XXX-XXXX). */
export const isThaiPhone = (s: string) => /^0\d{8,9}$/.test(normalizePhone(s));

/** "0812345678" → "081-234-5678", "021234567" → "02-123-4567"; anything else unchanged. */
export function formatPhone(s: string): string {
  const d = normalizePhone(s);
  if (/^0\d{9}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (/^0\d{8}$/.test(d)) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return s.trim();
}

/** For search boxes: like normalizePhone, but also converts a partial number typed with +66 ("+66 81 234" → "081234"). */
export function phoneSearchDigits(s: string): string {
  let d = s.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (/^\s*\+?\s*(00)?66/.test(s) && d.startsWith('66')) d = `0${d.slice(2)}`;
  return d;
}
