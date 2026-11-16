import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon } from '../components/Icons';
import { ORDER_STATUSES, StatusPill, type OrderStatus } from '../components/StatusPill';
import { baht } from '../data/format';
import { img } from '../data/images';
import { DEMO_ORDERS, type AdminOrder } from '../data/orders';
import { shippingFee } from '../data/shipping';
import './AdminPage.css';

const CARRIERS = ['ไปรษณีย์ไทย', 'นิ่มเอ็กซ์เพรส'];

const orderTotal = (o: AdminOrder) => o.items.reduce((a, [, p]) => a + p, 0) + shippingFee(o.kg);

export function AdminPage() {
  // TODO: load from and persist to the orders API.
  const [orders, setOrders] = useState<AdminOrder[]>(DEMO_ORDERS);
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selId, setSelId] = useState(DEMO_ORDERS[0].id);
  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [trackNo, setTrackNo] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    const matches = (o: AdminOrder) =>
      !q || o.id.toLowerCase().includes(q) || o.name.includes(q) || (qDigits !== '' && o.phone.replace(/\D/g, '').includes(qDigits));
    return orders.filter((o) => (tab === 'all' || o.status === tab) && matches(o));
  }, [orders, tab, query]);

  const sel = orders.find((o) => o.id === selId) ?? orders[0];
  const update = (patch: Partial<AdminOrder>) => setOrders((all) => all.map((o) => (o.id === sel.id ? { ...o, ...patch } : o)));

  const tabs: { id: OrderStatus | 'all'; label: string }[] = [{ id: 'all', label: 'ทั้งหมด' }, ...ORDER_STATUSES.map((s) => ({ id: s, label: s }))];

  return (
    <div className="admin">
      <header className="on-dark">
        <div className="admin__bar">
          <img src={img.logo} alt="" width={36} height={36} style={{ borderRadius: '50%' }} />
          <span className="num-display" style={{ fontWeight: 500, fontSize: 18 }}>Buildabond</span>
          <span style={{ fontSize: 13, color: 'var(--on-dark-3)' }}>หลังบ้าน</span>
          <nav aria-label="เมนูหลังบ้าน" className="admin__nav">
            <Link to="/admin" aria-current="page">ออร์เดอร์</Link>
            {/* TODO: sections not designed yet */}
            <Link to="/admin">สินค้า</Link>
            <Link to="/admin">คำขอสั่งทำ</Link>
            <Link to="/admin">ลูกค้าธุรกิจ</Link>
          </nav>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--on-dark-3)' }}>แอดมิน</span>
        </div>
      </header>

      <main className="admin__main">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1 className="num-display" style={{ fontWeight: 300, fontSize: 36 }}>ออร์เดอร์</h1>
          <label className="admin__search">
            <SearchIcon style={{ color: 'var(--ink-2)' }} />
            <input type="search" aria-label="ค้นหาออร์เดอร์" placeholder="เลขออร์เดอร์ ชื่อ หรือเบอร์โทร" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        <div role="tablist" aria-label="สถานะออร์เดอร์" className="admin__tabs">
          {tabs.map((t) => {
            const count = t.id === 'all' ? orders.length : orders.filter((o) => o.status === t.id).length;
            return (
              <button key={t.id} type="button" role="tab" aria-selected={t.id === tab} onClick={() => setTab(t.id)}>
                {t.label} <span>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th scope="col">ออร์เดอร์</th>
                  <th scope="col">ลูกค้า</th>
                  <th scope="col">วันที่</th>
                  <th scope="col" style={{ textAlign: 'right' }}>ยอด</th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} data-selected={o.id === sel.id}>
                    <td>
                      <button type="button" className="admin__order-link" onClick={() => { setSelId(o.id); setTrackNo(''); }}>{o.id}</button>
                    </td>
                    <td>{o.name}<br /><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{o.phone}</span></td>
                    <td className="muted">{o.date}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{baht(orderTotal(o))}</td>
                    <td><StatusPill status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && <p style={{ padding: 32, textAlign: 'center', color: 'var(--ink-2)' }}>ไม่มีออร์เดอร์ในสถานะนี้</p>}
          </div>

          <aside aria-live="polite" className="admin__detail">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <p className="num-display" style={{ fontWeight: 500, fontSize: 22 }}>{sel.id}</p>
                <p className="small" style={{ marginTop: 2 }}>{sel.date}</p>
              </div>
              <StatusPill status={sel.status} />
            </div>

            <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6 }}>
              <p className="strong">{sel.name} · {sel.phone}</p>
              <p className="muted" style={{ marginTop: 2 }}>{sel.addr}</p>
            </div>

            <ul className="admin__lines">
              {sel.items.map(([n, p]) => (
                <li key={n}><span>{n}</span><span>{baht(p)}</span></li>
              ))}
              <li className="muted"><span>ค่าส่ง ({sel.kg} กก.)</span><span>{baht(shippingFee(sel.kg))}</span></li>
              <li style={{ fontWeight: 600, fontSize: 16, paddingTop: 6 }}><span>รวม</span><span>{baht(orderTotal(sel))}</span></li>
            </ul>

            {sel.status === 'รอชำระ' && (
              <>
                <div className="admin__note" style={{ background: 'var(--orange-tint)', color: '#6e300a' }}>ลูกค้ายังไม่ได้ส่งสลิป</div>
                <button type="button" className="btn btn--outline btn--square btn--block" style={{ marginTop: 12, height: 48, fontSize: 15, fontWeight: 400 }}>ส่งข้อความเตือนทาง SMS</button>
              </>
            )}

            {sel.status === 'ส่งสลิปแล้ว' && (
              <>
                <p className="strong" style={{ margin: '18px 0 8px', fontSize: 14 }}>สลิปจากลูกค้า</p>
                <div className="admin__slip">
                  <div className="admin__slip-thumb">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--link)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                    <span style={{ fontSize: 11, color: 'var(--ink-2)' }}>รูปสลิป</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{baht(orderTotal(sel))}</span>
                  </div>
                  <div className="small" style={{ lineHeight: 1.7 }}>
                    <p>อัปโหลด {sel.slipTime}</p>
                    <p>ยอดในออร์เดอร์ <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{baht(orderTotal(sel))}</span></p>
                    <button type="button" className="text-btn text-btn--link" style={{ marginTop: 6, padding: 0, fontSize: 13 }}>เปิดรูปเต็ม</button>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn--primary btn--square" style={{ flex: 1, fontSize: 15 }} onClick={() => update({ status: 'ยืนยันแล้ว' })}>ยืนยันการชำระ</button>
                  <button type="button" className="btn btn--square" style={{ padding: '0 16px', border: '1px solid var(--line-strong)', background: 'var(--white)', color: '#8e1f0b', fontSize: 14, fontWeight: 400 }} onClick={() => update({ status: 'รอชำระ' })}>สลิปไม่ถูกต้อง</button>
                </div>
              </>
            )}

            {sel.status === 'ยืนยันแล้ว' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!trackNo.trim()) return;
                  update({ status: 'จัดส่งแล้ว', track: trackNo.trim(), carrier });
                  setTrackNo('');
                }}
              >
                <p className="strong" style={{ margin: '18px 0 8px', fontSize: 14 }}>ใส่เลขพัสดุ</p>
                <div className="stack">
                  <label className="field" style={{ fontSize: 13 }}>ขนส่ง
                    <select className="input input--sm" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                      {CARRIERS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="field" style={{ fontSize: 13 }}>เลขพัสดุ
                    <input className="input input--sm" style={{ fontSize: 15, letterSpacing: '0.03em' }} type="text" required placeholder="เช่น EF123456789TH" value={trackNo} onChange={(e) => setTrackNo(e.target.value)} />
                  </label>
                  <button type="submit" className="btn btn--primary btn--square" style={{ fontSize: 15 }}>บันทึกและแจ้งลูกค้า</button>
                </div>
              </form>
            )}

            {sel.status === 'จัดส่งแล้ว' && (
              <div className="admin__note" style={{ background: 'var(--green-tint)', color: '#1d4f22' }}>
                ส่งแล้ว · {sel.carrier} · <span style={{ fontWeight: 600, letterSpacing: '0.03em' }}>{sel.track}</span>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
