'use client';

import Link from 'next/link';
import { Fragment, useMemo, useState } from 'react';
import { baht } from '../../data/format';
import { thaiDateTime } from '../../lib/dates';
import { downloadCsv as download } from '../../lib/csv';
import { commissionFor, commissionSummary, normalizeTiers, tierFor } from '../../lib/commission';
import type { CodeOrder, DiscountCode, OrderStatus } from '../../lib/types';

/** Counted for sales and commission once the owner has confirmed the payment. */
const PAID: OrderStatus[] = ['ยืนยันแล้ว', 'จัดส่งแล้ว'];
const PENDING: OrderStatus[] = ['รอชำระ', 'ส่งสลิปแล้ว'];

type Period = 'this' | 'last' | 'all' | 'custom';

/** YYYY-MM-DD in Bangkok. */
const bkkDay = (iso: string | Date) => new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 10);

function monthRange(offset: number): [string, string] {
  const now = new Date(Date.now() + 7 * 3600_000);
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 0));
  return [first.toISOString().slice(0, 10), last.toISOString().slice(0, 10)];
}

const monthName = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString('th-TH', { month: 'long', year: 'numeric', timeZone: 'UTC' });

interface Row {
  code: string;
  affiliate: string;
  plan: string;
  /** The tier rate reached this period, for tiered plans */
  rate: number | null;
  paid: number;
  pending: number;
  cancelled: number;
  sales: number;
  discount: number;
  net: number;
  commission: number;
  orders: CodeOrder[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function DiscountReport({ codes, orders }: { codes: DiscountCode[]; orders: CodeOrder[] }) {
  const [period, setPeriod] = useState<Period>('this');
  const [custom, setCustom] = useState<[string, string]>(monthRange(0));
  const [open, setOpen] = useState<string | null>(null);

  const [from, to] = period === 'this' ? monthRange(0) : period === 'last' ? monthRange(-1) : period === 'custom' ? custom : ['', ''];
  const periodLabel = period === 'this' || period === 'last' ? monthName(from) : period === 'all' ? 'ทั้งหมด' : `${from || '…'} ถึง ${to || '…'}`;

  const rows = useMemo(() => {
    const inRange = orders.filter((o) => {
      const d = bkkDay(o.createdAt);
      return (!from || d >= from) && (!to || d <= to);
    });
    const byCode = new Map<string, Row>();
    const meta = new Map(codes.map((c) => [c.code, c]));
    for (const o of inRange) {
      const c = meta.get(o.discountCode);
      const r = byCode.get(o.discountCode) ?? {
        code: o.discountCode, affiliate: c?.affiliate ?? '', plan: c ? commissionSummary(c) : '', rate: null,
        paid: 0, pending: 0, cancelled: 0, sales: 0, discount: 0, net: 0, commission: 0, orders: [],
      };
      r.orders.push(o);
      if (PAID.includes(o.status)) {
        r.paid += 1;
        r.sales += o.subtotal;
        r.discount += o.discount;
        r.net += o.subtotal - o.discount;
      } else if (PENDING.includes(o.status)) r.pending += 1;
      else r.cancelled += 1;
      byCode.set(o.discountCode, r);
    }
    // Tiers apply to the period's total per code, so pick a month for monthly tiers.
    for (const r of byCode.values()) {
      const c = meta.get(r.code);
      if (!c) continue;
      r.commission = commissionFor(c, r.net);
      const tiers = normalizeTiers(c.commissionTiers);
      r.rate = tiers.length ? tierFor(tiers, r.net)?.percent ?? 0 : null;
    }
    return [...byCode.values()].sort((a, b) => b.net - a.net || b.pending - a.pending);
  }, [orders, codes, from, to]);

  const totals = rows.reduce(
    (t, r) => ({ paid: t.paid + r.paid, pending: t.pending + r.pending, net: t.net + r.net, discount: t.discount + r.discount, commission: t.commission + r.commission }),
    { paid: 0, pending: 0, net: 0, discount: 0, commission: 0 },
  );

  const exportSummary = () =>
    download(`discount-report-${from || 'all'}-${to || 'all'}.csv`, [
      ['ช่วงเวลา', periodLabel],
      [],
      ['โค้ด', 'Affiliate', 'ออร์เดอร์ที่ชำระแล้ว', 'รอชำระ/รอตรวจ', 'ยกเลิก', 'ยอดสินค้า', 'ส่วนลด', 'ยอดหลังหักส่วนลด', 'ค่าคอม (แบบ)', 'ขั้นที่ถึง %', 'ค่าคอม (บาท)'],
      ...rows.map((r) => [r.code, r.affiliate, r.paid, r.pending, r.cancelled, r.sales, r.discount, r.net, r.plan, r.rate ?? '', r.commission]),
      [],
      ['รวม', '', totals.paid, totals.pending, '', '', totals.discount, totals.net, '', '', round2(totals.commission)],
    ]);

  const exportOrders = () =>
    download(`discount-orders-${from || 'all'}-${to || 'all'}.csv`, [
      ['วันที่', 'เลขออร์เดอร์', 'โค้ด', 'Affiliate', 'ลูกค้า', 'สถานะ', 'ยอดสินค้า', 'ส่วนลด', 'ยอดหลังหักส่วนลด', 'ยอดโอน (รวมค่าส่ง)', 'นับค่าคอม'],
      ...rows.flatMap((r) =>
        r.orders.map((o) => [
          bkkDay(o.createdAt), o.id, o.discountCode, r.affiliate, o.name, o.status, o.subtotal, o.discount, o.subtotal - o.discount, o.total,
          PAID.includes(o.status) ? 'ใช่' : 'ไม่',
        ]),
      ),
    ]);

  return (
    <>
      <div className="admin-report__bar">
        <div role="group" aria-label="ช่วงเวลา" className="admin-report__periods">
          {([['this', 'เดือนนี้'], ['last', 'เดือนที่แล้ว'], ['all', 'ทั้งหมด'], ['custom', 'กำหนดเอง']] as [Period, string][]).map(([id, label]) => (
            <button key={id} type="button" className="chip" aria-pressed={period === id} onClick={() => setPeriod(id)}>{label}</button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="admin-report__dates">
            <label>ตั้งแต่ <input className="input input--sm" type="date" value={custom[0]} onChange={(e) => setCustom([e.target.value, custom[1]])} /></label>
            <label>ถึง <input className="input input--sm" type="date" value={custom[1]} onChange={(e) => setCustom([custom[0], e.target.value])} /></label>
          </div>
        )}
        <div className="admin-report__export">
          <button type="button" className="btn btn--ghost btn--sm" onClick={exportSummary} disabled={!rows.length}>ดาวน์โหลดสรุป (CSV)</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={exportOrders} disabled={!rows.length}>ดาวน์โหลดรายออร์เดอร์ (CSV)</button>
        </div>
      </div>

      <div className="admin-report__cards">
        <div className="admin-card"><span className="small">ออร์เดอร์ที่ชำระแล้ว</span><p>{totals.paid}</p></div>
        <div className="admin-card"><span className="small">ยอดหลังหักส่วนลด</span><p>{baht(totals.net)}</p></div>
        <div className="admin-card"><span className="small">ส่วนลดที่ให้ไป</span><p>{baht(totals.discount)}</p></div>
        <div className="admin-card"><span className="small">ค่าคอมที่ต้องจ่าย</span><p>{baht(Math.round(totals.commission))}</p></div>
      </div>
      <p className="small" style={{ marginTop: 8 }}>
        {periodLabel} · นับเฉพาะออร์เดอร์ที่ยืนยันการชำระแล้ว (ยืนยันแล้ว / จัดส่งแล้ว) ค่าคอมคิดจากยอดสินค้าหลังหักส่วนลด ไม่รวมค่าส่ง ขั้นบันไดคิดจากยอดรวมของช่วงเวลาที่เลือก (เลือกรายเดือนสำหรับขั้นบันไดรายเดือน)
        {totals.pending > 0 && ` · มีอีก ${totals.pending} ออร์เดอร์ที่ยังรอชำระหรือรอตรวจสลิป`}
      </p>

      <div className="admin__table-wrap" style={{ marginTop: 14 }}>
        <table className="admin__table">
          <thead>
            <tr>
              <th>โค้ด / Affiliate</th>
              <th style={{ textAlign: 'right' }}>ชำระแล้ว</th>
              <th style={{ textAlign: 'right' }}>รอชำระ</th>
              <th style={{ textAlign: 'right' }}>ยอดหลังหักส่วนลด</th>
              <th style={{ textAlign: 'right' }}>ส่วนลด</th>
              <th style={{ textAlign: 'right' }}>ค่าคอม</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center' }} className="muted">ยังไม่มีออร์เดอร์ที่ใช้โค้ดในช่วงนี้</td></tr>
            )}
            {rows.map((r) => (
              <Fragment key={r.code}>
                <tr data-selected={open === r.code}>
                  <td>
                    <button type="button" className="admin__order-link" aria-expanded={open === r.code} onClick={() => setOpen(open === r.code ? null : r.code)}>
                      {r.code}
                    </button>
                    {r.affiliate && <><br /><span className="small">{r.affiliate}</span></>}
                  </td>
                  <td style={{ textAlign: 'right' }}>{r.paid}</td>
                  <td style={{ textAlign: 'right' }} className="muted">{r.pending || '–'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{baht(r.net)}</td>
                  <td style={{ textAlign: 'right' }}>{baht(r.discount)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {r.plan ? <>{baht(Math.round(r.commission))}<br /><span className="small">{r.rate !== null ? `ถึงขั้น ${r.rate}% · ` : ''}{r.plan}</span></> : <span className="muted">–</span>}
                  </td>
                </tr>
                {open === r.code && (
                  <tr>
                    <td colSpan={6} style={{ background: '#fbf6ec', padding: '8px 16px 14px' }}>
                      <ul className="admin-report__orders">
                        {r.orders.map((o) => (
                          <li key={o.id}>
                            <Link href={`/admin?order=${encodeURIComponent(o.id)}`}>{o.id}</Link>
                            <span>{thaiDateTime(o.createdAt)}</span>
                            <span>{o.name}</span>
                            <span className={`tag ${PAID.includes(o.status) ? 'tag--green' : PENDING.includes(o.status) ? 'tag--orange' : 'tag--sand'}`}>{o.status}</span>
                            <span style={{ marginLeft: 'auto' }}>{baht(o.subtotal - o.discount)} <span className="small">(ลด {baht(o.discount)})</span></span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
