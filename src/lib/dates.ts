const TZ = 'Asia/Bangkok';

/** "16 พ.ย. 2569 · 22:51" (Thai Buddhist year) or "16 พ.ย. 22:51" without the year. */
export function thaiDateTime(iso: string | null, withYear = false): string {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString('th-TH', { timeZone: TZ, day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
  const time = d.toLocaleTimeString('th-TH', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
  return withYear ? `${date} · ${time}` : `${date} ${time}`;
}
