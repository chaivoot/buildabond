import type { MetadataRoute } from 'next';
import { PRODUCTS } from '../data/products';
import { SITE } from '../data/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/shop', '/custom', '/business'].map((p) => ({ url: `${SITE.url}${p}` }));
  const products = PRODUCTS.filter((p) => !p.comingSoon && !p.custom).map((p) => ({ url: `${SITE.url}/products/${p.slug}` }));
  return [...pages, ...products];
}
