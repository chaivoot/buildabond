import type { Metadata } from 'next';
import { OrderPlacedPage } from '../../views/OrderPlacedPage';

export const metadata: Metadata = {
  title: 'ได้รับคำสั่งซื้อแล้ว',
  robots: { index: false },
};

export default function Page() {
  return <OrderPlacedPage />;
}
