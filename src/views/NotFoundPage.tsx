import Link from 'next/link';
import { SiteHeader } from '../components/SiteHeader';

export function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <h1 className="display">ไม่พบหน้านี้</h1>
        <p className="lead" style={{ marginTop: 12 }}>ลิงก์อาจเปลี่ยนไปแล้ว ลองเลือกดูสินค้าทั้งหมด</p>
        <Link href="/shop" className="btn btn--primary" style={{ marginTop: 24 }}>สินค้าทั้งหมด</Link>
      </main>
    </>
  );
}
