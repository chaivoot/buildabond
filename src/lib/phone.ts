/**
 * Thai phone numbers, shared by the browser and the server.
 * Accepts what people and autofill type: "081-234-5678", "+66 81 234 5678", "0066812345678", "66812345678",
 * and the common mix-up of country code plus the leading 0: "+66 081 234 5678".
 */

/** Digits only, with the Thai country code (+66 / 0066 / 66) turned into a leading 0. */
export function normalizePhone(s: string): string {
  let d = s.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2); // international dialling prefix
  if (d.startsWith('660') && (d.length === 12 || d.length === 11)) return d.slice(2); // "+66 081…": drop the code, keep the 0
  if (d.startsWith('66') && (d.length === 11 || d.length === 10)) d = `0${d.slice(2)}`; // mobile (11) or landline (10)
  return d;
}

/**
 * True when two phone numbers are the same line, however they were typed.
 * Compares the subscriber part (the digits after the leading 0 / country code), so it still
 * matches numbers saved in an unusual format before normalisation existed.
 */
export function samePhone(a: string, b: string): boolean {
  const x = normalizePhone(a).replace(/^0/, '');
  const y = normalizePhone(b).replace(/^0/, '');
  if (x.length < 8 || y.length < 8) return false;
  return x === y || (x.length >= 9 && y.length >= 9 && x.slice(-9) === y.slice(-9));
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
  if (/^\s*\+?\s*(00)?66/.test(s) && d.startsWith('66')) d = d.startsWith('660') ? d.slice(2) : `0${d.slice(2)}`;
  return d;
}
