import type { Metadata } from 'next';
import { CartPage } from '../../views/CartPage';

export const metadata: Metadata = {
  title: 'ตะกร้า',
  robots: { index: false },
};

export default function Page() {
  return <CartPage />;
}
