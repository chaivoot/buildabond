/**
 * PromptPay QR payload (EMVCo "Thai QR Payment").
 * Accepts a mobile number (0812345678) or a 13-digit national/tax ID.
 */
const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`;

function crc16(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function promptPayPayload(target: string, amount?: number): string | null {
  const id = target.replace(/\D/g, '');
  let account: string;
  if (id.length === 10 && id.startsWith('0')) account = field('01', `0066${id.slice(1)}`);
  else if (id.length === 13) account = field('02', id);
  else return null;

  const body =
    field('00', '01') +
    field('01', amount ? '12' : '11') +
    field('29', field('00', 'A000000677010111') + account) +
    field('58', 'TH') +
    field('53', '764') +
    (amount ? field('54', amount.toFixed(2)) : '');
  const withCrcTag = `${body}6304`;
  return withCrcTag + crc16(withCrcTag);
}
