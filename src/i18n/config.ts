export const LOCALES = ['en', 'th'] as const;
export type Locale = (typeof LOCALES)[number];

/** Visitors outside Thailand (and anyone we can't place) get English. */
export const DEFAULT_LOCALE: Locale = 'en';
/** Remembers the visitor's language (set from IP on first visit, or by the TH/EN toggle). */
export const LANG_COOKIE = 'lang';

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v);

/** Locale used for number/date formatting. */
export const intlLocale = (lang: Locale) => (lang === 'th' ? 'th-TH' : 'en-GB');
