'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { SearchIcon } from '../../components/Icons';
import { ORDER_STATUSES, StatusPill, type OrderStatus } from '../../components/StatusPill';
import { baht } from '../../data/format';
import { thaiDateTime } from '../../lib/dates';
import { formatPhone, normalizePhone, phoneSearchDigits } from '../../lib/phone';
import type { Order } from '../../lib/types';
import { markShipped, orderLinkForAdmin, updateOrderStatus } from '../../server/actions/admin';

const SOURCE_LABEL: Record<string, string> = { line: 'LINE', facebook: 'Facebook', instagram: 'Instagram', phone: 'โทรศัพท์', walkin: 'หน้าร้าน / อีเวนต์', other: 'ช่องทางอื่น' };

const CARRIERS = ['ไปรษณีย์ไทย', 'นิ่มเอ็กซ์เพรส', 'Flash Express', 'Kerry Express', 'J&T Express'];

export function OrdersAdmin({ orders, initialOrder }: { orders: Order[]; initialOrder?: string }) {
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selId, setSelId] = useState(initialOrder && orders.some((o) => o.id === initialOrder) ? initialOrder : orders[0]?.id ?? '');
  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [linkCopied, setLinkCopied] = useState('');
  const [trackNo, setTrackNo] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qd = phoneSearchDigits(q);
    return orders.filter(
      (o) => (tab === 'all' || o.status === tab) && (!q || o.id.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || (qd !== '' && normalizePhone(o.phone).includes(qd)) || o.email.toLowerCase().includes(q)),
    );
  }, [orders, tab, query]);

  const sel = orders.find((o) => o.id === selId) ?? visible[0];
  const tabs: { id: OrderStatus | 'all'; label: string }[] = [{ id: 'all', label: 'ทั้งหมด' }, ...ORDER_STATUSES.map((s) => ({ id: s, label: s }))];

  const run = (fn: () => Promise<void>) => {
    setError('');
    start(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
      }
    });
  };

  return (
    <>
      <div className="admin-head">
        <h1>ออร์เดอร์</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/admin/orders/new" className="btn btn--primary btn--square">+ สร้างออร์เดอร์</Link>
        <label className="admin__search">
          <SearchIcon style={{ color: 'var(--ink-2)' }} />
          <input type="search" aria-label="ค้นหาออร์เดอร์" placeholder="เลขออร์เดอร์ ชื่อ เบอร์โทร หรืออีเมล" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        </div>
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
                <tr key={o.id} data-selected={o.id === sel?.id}>
                  <td>
                    <button type="button" className="admin__order-link" onClick={() => { setSelId(o.id); setTrackNo(''); setError(''); }}>{o.id}</button>
                  </td>
                  <td>{o.name}<br /><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{formatPhone(o.phone)}</span></td>
                  <td className="muted">{thaiDateTime(o.createdAt)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{baht(o.total)}</td>
                  <td><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p style={{ padding: 32, textAlign: 'center', color: 'var(--ink-2)' }}>ไม่มีออร์เดอร์ในสถานะนี้</p>}
        </div>

        {sel && (
          <aside aria-live="polite" aria-busy={pending} className="admin__detail">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <p className="num-display" style={{ fontWeight: 500, fontSize: 22 }}>{sel.id}</p>
                <p className="small" style={{ marginTop: 2 }}>
                  {thaiDateTime(sel.createdAt, true)}
                  {sel.source && sel.source !== 'web' && <> · <span className="tag tag--sky">สั่งทาง {SOURCE_LABEL[sel.source] ?? sel.source}</span></>}
                </p>
              </div>
              <StatusPill status={sel.status} />
            </div>

            <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6 }}>
              <p className="strong">{sel.name} · <a href={`tel:${normalizePhone(sel.phone)}`}>{formatPhone(sel.phone)}</a></p>
              {sel.email && <p><a href={`mailto:${sel.email}?subject=${encodeURIComponent(`ออร์เดอร์ ${sel.id}`)}`}>{sel.email}</a></p>}
              <p className="muted" style={{ marginTop: 2 }}>{sel.address}</p>
              {sel.note && <p style={{ marginTop: 6 }}>หมายเหตุ: {sel.note}</p>}
              {sel.customerId && (
                <p style={{ marginTop: 6 }}><Link href={`/admin/customers/${sel.customerId}`}>ดูประวัติลูกค้า →</Link></p>
              )}
              <p style={{ marginTop: 6 }}>
                <button
                  type="button"
                  className="text-btn text-btn--link"
                  style={{ fontSize: 14 }}
                  onClick={async () => {
                    const link = await orderLinkForAdmin(sel.id);
                    if (!link) return;
                    try { await navigator.clipboard.writeText(link); setLinkCopied(sel.id); setTimeout(() => setLinkCopied(''), 2000); } catch { window.prompt('ลิงก์หน้าออร์เดอร์ของลูกค้า', link); }
                  }}
                >
                  {linkCopied === sel.id ? 'คัดลอกลิงก์แล้ว ✓' : 'คัดลอกลิงก์ชำระเงิน / แนบสลิป ส่งให้ลูกค้า'}
                </button>
              </p>
            </div>

            <ul className="admin__lines">
              {sel.items.map((it, i) => (
                <li key={i}>
                  <span>{it.name}{it.opt && it.opt !== '—' ? ` · ${it.opt}` : ''}{it.qty > 1 ? ` × ${it.qty}` : ''}</span>
                  <span>{baht(it.unitPrice * it.qty)}</span>
                </li>
              ))}
              {sel.discount > 0 && (
                <li style={{ color: '#1d6b2a' }}><span>ส่วนลด (โค้ด {sel.discountCode})</span><span>−{baht(sel.discount)}</span></li>
              )}
              <li className="muted"><span>ค่าส่ง ({sel.kg} กก.)</span><span>{baht(sel.shipping)}</span></li>
              <li style={{ fontWeight: 600, fontSize: 16, paddingTop: 6 }}><span>รวม</span><span>{baht(sel.total)}</span></li>
            </ul>

            {sel.status === 'รอชำระ' && (
              <div className="admin-note admin-note--warn" style={{ marginTop: 18 }}>ลูกค้ายังไม่ได้ส่งสลิป</div>
            )}

            {sel.slipUrl ? (
              <>
                <p className="strong" style={{ margin: '18px 0 8px', fontSize: 14 }}>สลิปจากลูกค้า</p>
                <div className="admin__slip">
                  <a href={sel.slipUrl} target="_blank" rel="noreferrer" className="admin-slip-img" aria-label="เปิดรูปสลิปเต็ม">
                    <Image src={sel.slipUrl} alt="สลิปโอนเงิน" fill sizes="92px" />
                  </a>
                  <div className="small" style={{ lineHeight: 1.7 }}>
                    <p>อัปโหลด {thaiDateTime(sel.slipAt)}</p>
                    <p>ยอดในออร์เดอร์ <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{baht(sel.total)}</span></p>
                    <a href={sel.slipUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: 13 }}>เปิดรูปเต็ม</a>
                  </div>
                </div>
              </>
            ) : (
              sel.status === 'ส่งสลิปแล้ว' && <p className="small" style={{ marginTop: 18 }}>ออร์เดอร์ตัวอย่าง ไม่มีรูปสลิป</p>
            )}

            {sel.status === 'ส่งสลิปแล้ว' && (
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn--primary btn--square" style={{ flex: 1, fontSize: 15 }} disabled={pending} onClick={() => run(() => updateOrderStatus(sel.id, 'ยืนยันแล้ว'))}>ยืนยันการชำระ</button>
                <button type="button" className="btn btn--square btn--danger" style={{ padding: '0 16px', fontSize: 14 }} disabled={pending} onClick={() => run(() => updateOrderStatus(sel.id, 'รอชำระ'))}>สลิปไม่ถูกต้อง</button>
              </div>
            )}

            {sel.status === 'รอชำระ' && (
              <button type="button" className="btn btn--outline btn--square btn--block" style={{ marginTop: 12, height: 48, fontSize: 15, fontWeight: 400 }} disabled={pending} onClick={() => run(() => updateOrderStatus(sel.id, 'ยืนยันแล้ว'))}>
                ยืนยันว่าได้รับเงินแล้ว
              </button>
            )}

            {sel.status === 'ยืนยันแล้ว' && (
              <form onSubmit={(e) => { e.preventDefault(); run(async () => { await markShipped(sel.id, carrier, trackNo); setTrackNo(''); }); }}>
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
                  <button type="submit" className="btn btn--primary btn--square" style={{ fontSize: 15 }} disabled={pending}>บันทึกและแจ้งลูกค้า</button>
                </div>
              </form>
            )}

            {sel.status === 'จัดส่งแล้ว' && (
              <div className="admin-note admin-note--ok" style={{ marginTop: 18 }}>
                ส่งแล้ว {thaiDateTime(sel.shippedAt)} · {sel.carrier} · <span style={{ fontWeight: 600, letterSpacing: '0.03em' }}>{sel.tracking}</span>
              </div>
            )}

            {error && <p role="alert" className="small" style={{ marginTop: 12, color: '#8e1f0b' }}>{error}</p>}

            {sel.status !== 'จัดส่งแล้ว' && sel.status !== 'ยกเลิก' && (
              <button
                type="button"
                className="text-btn"
                style={{ marginTop: 16, color: '#8e1f0b', fontSize: 13 }}
                disabled={pending}
                onClick={() => confirm(`ยกเลิกออร์เดอร์ ${sel.id}?`) && run(() => updateOrderStatus(sel.id, 'ยกเลิก'))}
              >
                ยกเลิกออร์เดอร์
              </button>
            )}
            {sel.status === 'ยกเลิก' && (
              <button type="button" className="text-btn" style={{ marginTop: 16, fontSize: 13 }} disabled={pending} onClick={() => run(() => updateOrderStatus(sel.id, 'รอชำระ'))}>
                เปิดออร์เดอร์นี้อีกครั้ง
              </button>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
