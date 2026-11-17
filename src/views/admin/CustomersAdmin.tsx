'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SearchIcon } from '../../components/Icons';
import { baht } from '../../data/format';
import { thaiDateTime } from '../../lib/dates';
import type { CustomerSummary } from '../../server/customers';

const digits = (s: string) => s.replace(/\D/g, '');

export function CustomersAdmin({ customers }: { customers: CustomerSummary[] }) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qd = digits(q);
    return customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.includes(q) || (qd !== '' && c.phone.includes(qd)));
  }, [customers, query]);

  return (
    <>
      <div className="admin-head">
        <h1>ลูกค้า</h1>
        <label className="admin__search">
          <SearchIcon style={{ color: 'var(--ink-2)' }} />
          <input type="search" aria-label="ค้นหาลูกค้า" placeholder="ชื่อ อีเมล หรือเบอร์โทร" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <p className="small" style={{ marginTop: 6 }}>ลูกค้าจะถูกบันทึกอัตโนมัติเมื่อสั่งซื้อ โดยจำจากอีเมลและเบอร์โทร ทั้งหมด {customers.length} คน</p>

      <div className="admin__table-wrap" style={{ marginTop: 18 }}>
        <table className="admin__table">
          <thead>
            <tr>
              <th scope="col">ลูกค้า</th>
              <th scope="col">ติดต่อ</th>
              <th scope="col" style={{ textAlign: 'right' }}>ออร์เดอร์</th>
              <th scope="col" style={{ textAlign: 'right' }}>ยอดซื้อรวม</th>
              <th scope="col">สั่งล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/customers/${c.id}`} className="admin__order-link" style={{ display: 'inline-flex', alignItems: 'center' }}>{c.name || '(ไม่มีชื่อ)'}</Link>
                  <br />
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{c.province}</span>
                </td>
                <td>{c.email}<br /><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{c.phone}</span></td>
                <td style={{ textAlign: 'right' }}>{c.orderCount}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{baht(c.totalSpent)}</td>
                <td className="muted">{c.lastOrderAt ? thaiDateTime(c.lastOrderAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p style={{ padding: 32, textAlign: 'center', color: 'var(--ink-2)' }}>ไม่พบลูกค้า</p>}
      </div>
    </>
  );
}
