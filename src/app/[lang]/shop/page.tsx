import type { Metadata } from 'next';
import { CATEGORIES, type CategoryId } from '../../../data/products';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { localizeProduct } from '../../../lib/productText';
import { pageMeta } from '../../../lib/seo';
import { listProducts } from '../../../server/products';
import { ShopPage } from '../../../views/ShopPage';

type Props = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ cat?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang).meta;
  return pageMeta(lang, '/shop', { title: t.shop, description: t.shopDescription });
}

export default async function Page({ params, searchParams }: Props) {
  const [{ lang }, { cat }] = await Promise.all([params, searchParams]);
  const valid = CATEGORIES.some((c) => c.id === cat) ? (cat as CategoryId) : 'all';
  const products = (await listProducts()).map((p) => localizeProduct(p, lang));
  return <ShopPage cat={valid} products={products} />;
}
