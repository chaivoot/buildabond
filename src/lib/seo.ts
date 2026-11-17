import type { Metadata } from 'next';
import { LOCALES, type Locale } from '../i18n/config';

/**
 * Canonical + hreflang links. Visitors use unprefixed URLs (the language comes from IP/cookie),
 * but every page is also reachable at /en/... and /th/..., which is what search engines index.
 */
export function pageMeta(lang: Locale, path: string, meta: Omit<Metadata, 'alternates'> = {}): Metadata {
  const p = path === '/' ? '' : path;
  return {
    ...meta,
    alternates: {
      canonical: `/${lang}${p}`,
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${p}`])), 'x-default': `/en${p}` },
    },
  };
}
