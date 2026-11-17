import type { MetadataRoute } from 'next';
import { SITE } from '../data/site';
import { LOCALES } from '../i18n/config';
import { isSellable, listProducts } from '../server/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ['', '/shop', '/custom', '/business', '/privacy', ...(await listProducts()).filter(isSellable).map((p) => `/products/${p.slug}`)];
  return paths.map((p) => ({
    url: `${SITE.url}/en${p}`,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE.url}/${l}${p}`])) },
  }));
}
