import type { Metadata } from 'next';
import { CheckoutPage } from '../../views/CheckoutPage';

export const metadata: Metadata = {
  title: 'ชำระเงิน',
  robots: { index: false },
};

export default function Page() {
  return <CheckoutPage />;
}
