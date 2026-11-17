import { intlLocale, type Locale } from '../i18n/config';

const TZ = 'Asia/Bangkok';

/** "16 พ.ย. 2569 · 22:51" / "16 Nov 2026 · 22:51", or without the year. Always Bangkok time. */
export function thaiDateTime(iso: string | null, withYear = false, lang: Locale = 'th'): string {
  if (!iso) return '';
  const d = new Date(iso);
  const loc = intlLocale(lang);
  const date = d.toLocaleDateString(loc, { timeZone: TZ, day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
  const time = d.toLocaleTimeString(loc, { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
  return withYear ? `${date} · ${time}` : `${date} ${time}`;
}
