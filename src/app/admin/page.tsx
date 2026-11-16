import type { Metadata } from 'next';
import { AdminPage } from '../../views/AdminPage';

export const metadata: Metadata = {
  title: 'หลังบ้าน',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminPage />;
}
