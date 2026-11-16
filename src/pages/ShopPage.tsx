import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductTile } from '../components/ProductTile';
import { SiteHeader } from '../components/SiteHeader';
import { img } from '../data/images';
import { CATEGORIES, PRODUCTS, type CategoryId } from '../data/products';
import './ShopPage.css';

type Sort = 'featured' | 'asc' | 'desc';

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('cat');
  const cat: CategoryId | 'all' = CATEGORIES.some((c) => c.id === raw) ? (raw as CategoryId) : 'all';
  const [sort, setSort] = useState<Sort>('featured');

  const list = useMemo(() => {
    const filtered = PRODUCTS.filter((p) => cat === 'all' || p.cat === cat);
    if (sort === 'featured') return filtered;
    // Coming-soon items have no price; keep them last.
    return [...filtered].sort((a, b) => {
      if (a.comingSoon !== b.comingSoon) return a.comingSoon ? 1 : -1;
      return sort === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }, [cat, sort]);

  const chips: { id: CategoryId | 'all'; label: string }[] = [{ id: 'all', label: 'ทั้งหมด' }, ...CATEGORIES];

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ paddingTop: 36, paddingBottom: 80 }}>
        <h1 className="display">สินค้าทั้งหมด</h1>
        <p className="lead" style={{ marginTop: 12, maxWidth: 560, fontSize: 16, lineHeight: 1.7 }}>
          อุปกรณ์ฟิตเนส ของเล่นไล่ล่า และของเล่นดึง ทุกชิ้นทดสอบกับหมาจริงก่อนวางขาย
        </p>

        <div role="group" aria-label="กรองตามกลุ่มสินค้า" className="shop-filters">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={c.id === cat}
              onClick={() => setParams(c.id === 'all' ? {} : { cat: c.id }, { replace: true })}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="row-between muted" style={{ marginTop: 14, fontSize: 14 }}>
          <span>{list.length} รายการ</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            เรียงตาม
            <select className="input" style={{ height: 44, width: 'auto', fontSize: 14 }} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">แนะนำ</option>
              <option value="asc">ราคาต่ำไปสูง</option>
              <option value="desc">ราคาสูงไปต่ำ</option>
            </select>
          </label>
        </div>

        <div className="shop-grid">
          {list.map((p) => (
            <ProductTile key={p.slug} p={p} />
          ))}
        </div>

        <Link to="/custom" className="on-dark shop-custom">
          <img src={img.jumpBox} alt="กล่องกระโดดสั่งทำ ปิดผิวยางสีดำ" />
          <div className="shop-custom__body">
            <p className="num-display" style={{ fontWeight: 300, fontSize: 30, lineHeight: 1.2 }}>ต้องการขนาดพิเศษ?</p>
            <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: 'var(--on-dark-2)' }}>
              กรอกกว้าง ยาว สูง แล้วเห็นราคาทันที Jump Box เริ่ม ฿2,590 Platform เริ่ม ฿2,990
            </p>
            <span className="btn btn--light btn--sm" style={{ marginTop: 16, height: 48, padding: '0 24px', fontSize: 16 }}>คำนวณราคาสั่งทำ</span>
          </div>
        </Link>
      </main>
    </>
  );
}
