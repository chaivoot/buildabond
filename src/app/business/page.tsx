import type { Metadata } from 'next';
import { BusinessPage } from '../../views/BusinessPage';

export const metadata: Metadata = {
  title: 'สำหรับธุรกิจ',
  description: 'ราคาส่งและ Dropship สำหรับร้านค้าสัตว์เลี้ยง เทรนเนอร์ โรงพยาบาลสัตว์ และศูนย์ฟิตเนสหมา',
};

export default function Page() {
  return <BusinessPage />;
}
