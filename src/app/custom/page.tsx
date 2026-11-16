import type { Metadata } from 'next';
import { CustomPage } from '../../views/CustomPage';

export const metadata: Metadata = {
  title: 'สั่งทำขนาดพิเศษ',
  description: 'สั่งทำ Jump Box และ Platform ตามขนาด กรอกกว้าง ยาว สูง แล้วเห็นราคาทันที',
};

export default function Page() {
  return <CustomPage />;
}
