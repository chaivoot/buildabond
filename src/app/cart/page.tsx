import type { Metadata } from 'next';
import { isSellable, listProducts } from '../../server/products';
import { CartPage } from '../../views/CartPage';

export const metadata: Metadata = {
  title: 'ตะกร้า',
  robots: { index: false },
};

const CROSS_SELL = ['slant-box', 'narrow-target'];

export default async function Page() {
  const products = (await listProducts()).filter((p) => CROSS_SELL.includes(p.slug) && isSellable(p));
  return <CartPage crossSell={products} />;
}
