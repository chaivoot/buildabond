import type { Metadata } from 'next';
import { CATEGORIES, type CategoryId } from '../../data/products';
import { ShopPage } from '../../views/ShopPage';

export const metadata: Metadata = {
  title: 'สินค้าทั้งหมด',
  description: 'อุปกรณ์ฟิตเนส ของเล่นไล่ล่า และของเล่นดึง ทุกชิ้นทดสอบกับหมาจริงก่อนวางขาย',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const valid = CATEGORIES.some((c) => c.id === cat) ? (cat as CategoryId) : 'all';
  return <ShopPage cat={valid} />;
}
