import type { MetadataRoute } from 'next';
import { SITE } from '../data/site';
import { isSellable, listProducts } from '../server/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/shop', '/custom', '/business'].map((p) => ({ url: `${SITE.url}${p}` }));
  const products = (await listProducts()).filter(isSellable).map((p) => ({ url: `${SITE.url}/products/${p.slug}` }));
  return [...pages, ...products];
}
