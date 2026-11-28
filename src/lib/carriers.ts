/**
 * Carrier tracking pages. `prefill` = the page opens with the number already filled in (checked Nov 2026);
 * for the others the customer pastes the number, which the button copies first.
 * Carrier names come from the admin ship form (OrdersAdmin CARRIERS); matching is loose so older names still work.
 */
interface Carrier { match: RegExp; name: string; url: (n: string) => string; prefill: boolean }

const CARRIERS: Carrier[] = [
  { match: /ไปรษณีย์|thai\s*post|ems/i, name: 'ไปรษณีย์ไทย', url: (n) => `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(n)}`, prefill: true },
  { match: /kerry|kex/i, name: 'KEX (Kerry)', url: (n) => `https://th.kex-express.com/th/track/?track=${encodeURIComponent(n)}`, prefill: true },
  { match: /flash/i, name: 'Flash Express', url: (n) => `https://www.flashexpress.co.th/fle/tracking?se=${encodeURIComponent(n)}`, prefill: true },
  { match: /j\s*&\s*t|jt\s*express/i, name: 'J&T Express', url: () => 'https://www.jtexpress.co.th/service/track', prefill: false },
  { match: /นิ่ม|nim/i, name: 'นิ่มเอ็กซ์เพรส', url: () => 'https://www.nimexpress.com/web/p/tracking', prefill: false },
];

export function trackingLink(carrier: string, tracking: string): { url: string; prefill: boolean } | null {
  const n = tracking.trim();
  if (!n) return null;
  const c = CARRIERS.find((x) => x.match.test(carrier));
  return c ? { url: c.url(n), prefill: c.prefill } : null;
}
