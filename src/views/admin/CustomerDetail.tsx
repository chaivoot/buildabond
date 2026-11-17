import Link from 'next/link';
import { StatusPill } from '../../components/StatusPill';
import { baht } from '../../data/format';
import { thaiDateTime } from '../../lib/dates';
import { formatPhone } from '../../lib/phone';
import type { Order } from '../../lib/types';
import type { CustomerEvent, CustomerEventKind, CustomerSummary } from '../../server/customers';

const KIND_LABEL: Record<CustomerEventKind, string> = {
  created: 'เริ่มเป็นลูกค้า',
  name: 'เปลี่ยนชื่อ',
  address: 'เปลี่ยนที่อยู่',
  phone: 'เปลี่ยนเบอร์โทร',
  email: 'เปลี่ยนอีเมล',
};
const KIND_TONE: Record<CustomerEventKind, string> = {
  created: 'tag--green',
  name: 'tag--sand',
  address: 'tag--sky',
  phone: 'tag--orange',
  email: 'tag--orange',
};

interface Props {
  customer: CustomerSummary;
  events: CustomerEvent[];
  orders: Order[];
}

export function CustomerDetail({ customer: c, events, orders }: Props) {
  const address = [c.street, c.subdistrict, c.district, c.province, c.postcode].filter(Boolean).join(' ');
  return (
    <>
      <p className="small"><Link href="/admin/customers">← ลูกค้าทั้งหมด</Link></p>
      <div className="admin-head" style={{ marginTop: 8 }}>
        <h1>{c.name || '(ไม่มีชื่อ)'}</h1>
      </div>

      <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <section className="admin-card" style={{ flex: '1 1 320px', minWidth: 0 }}>
          <h2>ข้อมูลปัจจุบัน</h2>
          <dl className="admin-dl">
            <dt>อีเมล</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd>
            <dt>เบอร์โทร</dt><dd><a href={`tel:${c.phone}`}>{formatPhone(c.phone)}</a></dd>
            <dt>ที่อยู่</dt><dd>{address || '—'}</dd>
            <dt>ลูกค้าตั้งแต่</dt><dd>{thaiDateTime(c.createdAt, true)}</dd>
          </dl>
          <div className="admin-stats">
            <div><p>{c.orderCount}</p><span>ออร์เดอร์</span></div>
            <div><p>{baht(c.totalSpent)}</p><span>ยอดซื้อรวม (ไม่นับยกเลิก)</span></div>
          </div>
        </section>

        <section className="admin-card" style={{ flex: '2 1 480px', minWidth: 0 }}>
          <h2>ประวัติการสั่งซื้อ</h2>
          {orders.length === 0 ? (
            <p className="muted">ยังไม่มีออร์เดอร์ที่เชื่อมกับลูกค้าคนนี้</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin__table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th scope="col">ออร์เดอร์</th>
                    <th scope="col">วันที่</th>
                    <th scope="col">สินค้า</th>
                    <th scope="col" style={{ textAlign: 'right' }}>ยอด</th>
                    <th scope="col">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ whiteSpace: 'nowrap' }}><Link href={`/admin?order=${encodeURIComponent(o.id)}`} className="strong">{o.id}</Link></td>
                      <td className="muted">{thaiDateTime(o.createdAt)}</td>
                      <td style={{ fontSize: 13 }}>{o.items.map((i) => `${i.name}${i.qty > 1 ? ` × ${i.qty}` : ''}`).join(', ')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{baht(o.total)}</td>
                      <td><StatusPill status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="admin-card" style={{ marginTop: 18 }}>
        <h2>ประวัติการเปลี่ยนแปลงข้อมูล</h2>
        {events.length === 0 ? (
          <p className="muted">ยังไม่มีประวัติ</p>
        ) : (
          <ol className="admin-timeline">
            {events.map((e) => (
              <li key={e.id}>
                <div className="admin-timeline__head">
                  <span className={`tag ${KIND_TONE[e.kind]}`}>{KIND_LABEL[e.kind]}</span>
                  <span className="small">{thaiDateTime(e.at, true)}</span>
                  {e.orderId && <Link href={`/admin?order=${encodeURIComponent(e.orderId)}`} className="small">จากออร์เดอร์ {e.orderId}</Link>}
                </div>
                {e.kind === 'created' ? (
                  <p style={{ marginTop: 4 }}>{e.newValue}</p>
                ) : (
                  <p className="admin-timeline__change">
                    <del>{e.oldValue || '—'}</del>
                    <span aria-hidden="true"> → </span>
                    <span className="visually-hidden"> เปลี่ยนเป็น </span>
                    <ins>{e.newValue || '—'}</ins>
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
