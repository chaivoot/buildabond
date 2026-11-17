import type { MetadataRoute } from 'next';
import { SITE } from '../data/site';
import { LOCALES } from '../i18n/config';

const PRIVATE = ['/cart', '/checkout', '/order-placed', '/track'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', ...PRIVATE, ...LOCALES.flatMap((l) => PRIVATE.map((p) => `/${l}${p}`))] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
