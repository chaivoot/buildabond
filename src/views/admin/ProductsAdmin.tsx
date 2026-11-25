import Image from 'next/image';
import Link from 'next/link';
import { baht } from '../../data/format';
import { categoryLabel } from '../../data/products';
import type { Product } from '../../lib/types';

export function ProductsAdmin({ products, stock = {} }: { products: Product[]; stock?: Record<string, Record<string, number>> }) {
  return (
    <>
      <div className="admin-head">
        <h1>สินค้า</h1>
        <Link href="/admin/products/new" className="btn btn--primary btn--square btn--sm">+ เพิ่มสินค้า</Link>
      </div>
      <div className="admin__table-wrap" style={{ marginTop: 18 }}>
        <table className="admin__table">
          <thead>
            <tr>
              <th scope="col">สินค้า</th>
              <th scope="col">หมวด</th>
              <th scope="col" style={{ textAlign: 'right' }}>ราคา</th>
              <th scope="col" style={{ textAlign: 'right' }}>น้ำหนัก</th>
              <th scope="col" style={{ textAlign: 'right' }}>สต็อก</th>
              <th scope="col">สถานะ</th>
              <th scope="col"><span className="visually-hidden">แก้ไข</span></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                    <div className="admin-thumb">{p.img && <Image src={p.img} alt="" fill sizes="56px" />}</div>
                    <div>
                      <Link href={`/admin/products/${p.slug}`} className="strong" style={{ color: 'var(--ink)' }}>{p.name}</Link>
                      <br />
                      <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{p.th}</span>
                    </div>
                  </div>
                </td>
                <td className="muted">{categoryLabel(p.cat)}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="strong">{p.comingSoon ? '—' : baht(p.price)}</span>
                  {p.priceLabel && <><br /><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{p.priceLabel}</span></>}
                </td>
                <td style={{ textAlign: 'right' }} className="muted">{p.kg ? `${p.kg} กก.` : '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  {(() => {
                    const v = Object.values(stock[p.slug] ?? {});
                    if (!v.length) return <span className="muted">—</span>;
                    const out = v.filter((n) => n <= 0).length;
                    return <>{v.reduce((a, n) => a + n, 0)} ชิ้น{out > 0 && <><br /><span className="tag tag--orange">{out} ตัวเลือกหมด</span></>}</>;
                  })()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {!p.visible && <span className="tag tag--sand">ซ่อนอยู่</span>}
                    {p.comingSoon ? <span className="tag tag--sky">เร็ว ๆ นี้</span> : p.custom ? <span className="tag tag--sky">สั่งทำ</span> : p.stock === 'ready' ? <span className="tag tag--green">พร้อมส่ง</span> : <span className="tag tag--orange">พรีออเดอร์</span>}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link href={`/admin/products/${p.slug}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: 14 }}>แก้ไข</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
