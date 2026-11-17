import type { Metadata } from 'next';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { localizeProduct } from '../../../lib/productText';
import { pageMeta } from '../../../lib/seo';
import { isSellable, listProducts } from '../../../server/products';
import { CartPage } from '../../../views/CartPage';

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, '/cart', { title: getDict(lang).meta.cart, robots: { index: false } });
}

const CROSS_SELL = ['slant-box', 'narrow-target'];

export default async function Page({ params }: Props) {
  const { lang } = await params;
  const products = (await listProducts()).filter((p) => CROSS_SELL.includes(p.slug) && isSellable(p)).map((p) => localizeProduct(p, lang));
  return <CartPage crossSell={products} />;
}
