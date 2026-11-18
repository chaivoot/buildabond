'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { baht } from '../../data/format';
import { codeProblem, discountLabel } from '../../lib/discount';
import { commissionFor, commissionSummary } from '../../lib/commission';
import type { CodeOrder, DiscountCode } from '../../lib/types';
import { DiscountReport } from './DiscountReport';
import { removeDiscountCode, saveDiscountCode } from '../../server/actions/admin';

const EMPTY: DiscountCode = {
  code: '', kind: 'percent', value: 5, active: true, minSubtotal: 0, maxUses: null, usedCount: 0, expiresAt: null, note: '', affiliate: '', commissionPercent: 0, commissionTiers: [], commissionTierMode: 'whole', createdAt: '',
};

/** "2026-12-31" in Bangkok ↔ the end of that day as an ISO time. */
const dayToIso = (day: string) => (day ? new Date(`${day}T23:59:59+07:00`).toISOString() : null);
const isoToDay = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 10) : '');
const showDay = (iso: string) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' });

function status(c: DiscountCode): { label: string; tone: string } {
  if (!c.active) return { label: 'ปิดอยู่', tone: 'tag--sand' };
  const p = codeProblem(c, Number.MAX_SAFE_INTEGER);
  if (p === 'codeExpired') return { label: 'หมดอายุ', tone: 'tag--sand' };
  if (p === 'codeUsedUp') return { label: 'ใช้ครบแล้ว', tone: 'tag--sand' };
  return { label: 'ใช้งานได้', tone: 'tag--green' };
}

export function DiscountsAdmin({ codes, orders }: { codes: DiscountCode[]; orders: CodeOrder[] }) {
  const router = useRouter();
  const [view, setView] = useState<'codes' | 'report'>('codes');
  const [editing, setEditing] = useState<{ code: DiscountCode; previous: string | null } | null>(null);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const [sample, setSample] = useState(25000);

  const open = (c: DiscountCode | null) => { setError(''); setEditing(c ? { code: { ...c }, previous: c.code } : { code: { ...EMPTY }, previous: null }); };
  const patch = (p: Partial<DiscountCode>) => setEditing((e) => (e ? { ...e, code: { ...e.code, ...p } } : e));

  const save = (c: DiscountCode, previous: string | null, after?: () => void) =>
    start(async () => {
      setError('');
      const res = await saveDiscountCode(c, previous).catch((e: Error) => ({ error: e.message }));
      if (res.error) return setError(res.error);
      after?.();
      router.refresh();
    });

  const e = editing?.code;

  return (
    <>
      <div className="admin-head">
        <h1>โค้ดส่วนลด</h1>
        {view === 'codes' && <button type="button" className="btn btn--primary btn--square" onClick={() => open(null)}>+ สร้างโค้ดใหม่</button>}
      </div>
      <div role="tablist" aria-label="โค้ดส่วนลด" className="admin__tabs">
        <button type="button" role="tab" aria-selected={view === 'codes'} onClick={() => setView('codes')}>โค้ดทั้งหมด <span>{codes.length}</span></button>
        <button type="button" role="tab" aria-selected={view === 'report'} onClick={() => setView('report')}>รายงานการใช้โค้ด / ค่าคอม</button>
      </div>

      {view === 'report' ? <div style={{ marginTop: 18 }}><DiscountReport codes={codes} orders={orders} /></div> : <>
      <p className="small" style={{ marginTop: 12 }}>ลูกค้าใส่โค้ดในหน้าชำระเงิน ส่วนลดคิดจากยอดสินค้า (ไม่รวมค่าส่ง) และนับการใช้เมื่อกดยืนยันคำสั่งซื้อ</p>

      {e && (
        <section className="admin-card" style={{ marginTop: 18 }}>
          <h2>{editing.previous ? `แก้ไขโค้ด ${editing.previous}` : 'สร้างโค้ดใหม่'}</h2>
          <div className="admin-grid">
            <label className="field">โค้ด
              <span className="field__hint">A-Z, 0-9, - หรือ _ · ลูกค้าพิมพ์ตัวเล็กก็ได้</span>
              <input className="input" value={e.code} onChange={(ev) => patch({ code: ev.target.value.toUpperCase() })} placeholder="เช่น MOMMAM" style={{ textTransform: 'uppercase' }} />
            </label>
            <label className="field">ประเภทส่วนลด
              <span className="field__hint">ลดเป็นเปอร์เซ็นต์ หรือเป็นจำนวนเงิน</span>
              <select className="input" value={e.kind} onChange={(ev) => patch({ kind: ev.target.value as DiscountCode['kind'] })}>
                <option value="percent">ลดเป็น %</option>
                <option value="amount">ลดเป็นบาท</option>
              </select>
            </label>
            <label className="field">{e.kind === 'percent' ? 'ลดกี่ %' : 'ลดกี่บาท'}
              <span className="field__hint">{e.kind === 'percent' ? '1-100 ปัดเศษสตางค์ลง' : 'ไม่เกินยอดสินค้า'}</span>
              <input className="input" type="number" min={1} max={e.kind === 'percent' ? 100 : undefined} value={e.value} onChange={(ev) => patch({ value: Number(ev.target.value) })} />
            </label>
            <label className="field">ยอดขั้นต่ำ (บาท)
              <span className="field__hint">0 = ไม่มีขั้นต่ำ</span>
              <input className="input" type="number" min={0} value={e.minSubtotal} onChange={(ev) => patch({ minSubtotal: Number(ev.target.value) })} />
            </label>
            <label className="field">จำกัดจำนวนครั้ง
              <span className="field__hint">ทุกคนรวมกัน · ว่างไว้ = ไม่จำกัด</span>
              <input className="input" type="number" min={1} value={e.maxUses ?? ''} onChange={(ev) => patch({ maxUses: ev.target.value === '' ? null : Number(ev.target.value) })} placeholder="ไม่จำกัด" />
            </label>
            <label className="field">ใช้ได้ถึงวันที่
              <span className="field__hint">ว่างไว้ = ไม่มีวันหมดอายุ</span>
              <input className="input" type="date" value={isoToDay(e.expiresAt)} onChange={(ev) => patch({ expiresAt: dayToIso(ev.target.value) })} />
            </label>
            <label className="field">Affiliate / เจ้าของโค้ด
              <span className="field__hint">ชื่อหรือช่องทางติดต่อ แสดงในรายงาน</span>
              <input className="input" value={e.affiliate} onChange={(ev) => patch({ affiliate: ev.target.value })} placeholder="เช่น คุณแม่มัม (IG @…)" />
            </label>
            <fieldset className="plain admin-commission" style={{ gridColumn: '1 / -1' }}>
              <legend>ค่าคอมของ affiliate <span className="field__hint" style={{ marginLeft: 6 }}>คิดจากยอดสินค้าหลังหักส่วนลด ไม่รวมค่าส่ง เฉพาะออร์เดอร์ที่ชำระแล้ว</span></legend>
              <div className="admin-commission__modes">
                <label className="admin-check"><input type="radio" name="commission-kind" checked={!e.commissionTiers.length} onChange={() => patch({ commissionTiers: [] })} />% คงที่</label>
                <label className="admin-check">
                  <input type="radio" name="commission-kind" checked={e.commissionTiers.length > 0}
                    onChange={() => patch({ commissionTiers: [{ from: 0, percent: e.commissionPercent || 5 }, { from: 10000, percent: 10 }] })} />
                  ขั้นบันไดตามยอดขาย
                </label>
              </div>

              {!e.commissionTiers.length ? (
                <label className="admin-commission__flat">
                  <input className="input input--sm" type="number" min={0} max={100} step={0.5} value={e.commissionPercent} onChange={(ev) => patch({ commissionPercent: Number(ev.target.value) })} aria-label="ค่าคอม %" />
                  % ของยอด · 0 = ไม่มีค่าคอม
                </label>
              ) : (
                <>
                  <ol className="admin-tiers">
                    {e.commissionTiers.map((t, i) => {
                      const next = e.commissionTiers[i + 1];
                      const setTier = (p: Partial<typeof t>) => patch({ commissionTiers: e.commissionTiers.map((x, j) => (j === i ? { ...x, ...p } : x)) });
                      return (
                        <li key={i}>
                          <span>ยอด</span>
                          {i === 0 ? <span className="admin-tiers__fixed">฿0</span> : (
                            <input className="input input--sm" type="number" min={1} step={1000} value={t.from} aria-label={`ขั้นที่ ${i + 1} เริ่มที่ยอด`} onChange={(ev) => setTier({ from: Number(ev.target.value) })} />
                          )}
                          <span>{next ? `ถึง ${baht(Math.max(0, next.from - 1))}` : 'ขึ้นไป'}</span>
                          <span>→</span>
                          <input className="input input--sm" type="number" min={0} max={100} step={0.5} value={t.percent} aria-label={`ขั้นที่ ${i + 1} ค่าคอม %`} onChange={(ev) => setTier({ percent: Number(ev.target.value) })} />
                          <span>%</span>
                          {i > 0 && <button type="button" className="admin-tiers__remove" aria-label={`ลบขั้นที่ ${i + 1}`} onClick={() => patch({ commissionTiers: e.commissionTiers.filter((_, j) => j !== i) })}>✕</button>}
                        </li>
                      );
                    })}
                  </ol>
                  <button type="button" className="btn btn--ghost btn--sm" disabled={e.commissionTiers.length >= 10}
                    onClick={() => { const last = e.commissionTiers[e.commissionTiers.length - 1]; patch({ commissionTiers: [...e.commissionTiers, { from: (last?.from ?? 0) + 10000, percent: (last?.percent ?? 0) + 5 }] }); }}>
                    + เพิ่มขั้น
                  </button>
                  <label className="field" style={{ marginTop: 10, maxWidth: 520 }}>วิธีคิด
                    <select className="input" value={e.commissionTierMode} onChange={(ev) => patch({ commissionTierMode: ev.target.value as DiscountCode['commissionTierMode'] })}>
                      <option value="whole">ทั้งก้อน: ยอดถึงขั้นไหน คิด % ขั้นนั้นกับยอดทั้งหมด</option>
                      <option value="marginal">สะสมทีละขั้น: แต่ละช่วงยอดคิด % ของช่วงนั้น</option>
                    </select>
                  </label>
                  <p className="small" style={{ marginTop: 6 }}>ยอดคิดรวมต่อช่วงเวลาที่ดูในรายงาน (เช่น รายเดือน)</p>
                </>
              )}
              <p className="admin-commission__try">
                ทดลองคิด: ยอด{' '}
                <input className="input input--sm" type="number" min={0} step={1000} value={sample} onChange={(ev) => setSample(Number(ev.target.value))} aria-label="ยอดทดลอง" />
                {' '}→ ค่าคอม <strong>{baht(Math.round(commissionFor(e, sample)))}</strong>
              </p>
            </fieldset>
            <label className="field" style={{ gridColumn: '1 / -1' }}>บันทึกถึงตัวเอง
              <span className="field__hint">ลูกค้าไม่เห็น เช่น โค้ดนี้แจกใคร</span>
              <input className="input" value={e.note} onChange={(ev) => patch({ note: ev.target.value })} />
            </label>
          </div>
          <label className="admin-check" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={e.active} onChange={(ev) => patch({ active: ev.target.checked })} />เปิดใช้งาน
          </label>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn btn--primary btn--square" disabled={pending} onClick={() => save(e, editing.previous, () => setEditing(null))}>
              {pending ? 'กำลังบันทึก…' : editing.previous ? 'บันทึก' : 'สร้างโค้ด'}
            </button>
            <button type="button" className="btn btn--ghost btn--square" onClick={() => setEditing(null)}>ยกเลิก</button>
            {error && <span role="alert" className="admin-note admin-note--warn" style={{ padding: '8px 12px' }}>{error}</span>}
            {editing.previous && (
              <button
                type="button"
                className="btn btn--square btn--danger"
                style={{ marginLeft: 'auto', fontSize: 14 }}
                disabled={pending}
                onClick={() => {
                  const prev = editing.previous!;
                  if (confirm(`ลบโค้ด ${prev} ถาวร? ถ้าแค่ไม่อยากให้ใช้แล้ว ให้เอาเครื่องหมาย "เปิดใช้งาน" ออกแทน`)) {
                    start(async () => { await removeDiscountCode(prev); setEditing(null); router.refresh(); });
                  }
                }}
              >
                ลบโค้ด
              </button>
            )}
          </div>
        </section>
      )}

      <div className="admin__table-wrap" style={{ marginTop: 18 }}>
        <table className="admin__table">
          <thead>
            <tr><th>โค้ด</th><th>ส่วนลด</th><th>ใช้ไปแล้ว</th><th>เงื่อนไข</th><th>Affiliate / ค่าคอม</th><th>สถานะ</th><th /></tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 28, textAlign: 'center' }} className="muted">ยังไม่มีโค้ดส่วนลด</td></tr>
            )}
            {codes.map((c) => {
              const s = status(c);
              return (
                <tr key={c.code}>
                  <td>
                    <span style={{ fontWeight: 600, letterSpacing: '0.04em' }}>{c.code}</span>
                    {c.note && <><br /><span className="small">{c.note}</span></>}
                  </td>
                  <td>{discountLabel(c)}</td>
                  <td>{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ''} ครั้ง</td>
                  <td className="small">
                    {[c.minSubtotal > 0 ? `ขั้นต่ำ ${baht(c.minSubtotal)}` : null, c.expiresAt ? `ถึง ${showDay(c.expiresAt)}` : null].filter(Boolean).join(' · ') || 'ไม่มี'}
                  </td>
                  <td className="small">
                    {c.affiliate || <span className="muted">–</span>}
                    {commissionSummary(c) && <><br />ค่าคอม {commissionSummary(c)}</>}
                  </td>
                  <td>
                    <label className="admin-check" style={{ gap: 6 }}>
                      <input type="checkbox" checked={c.active} disabled={pending} aria-label={`เปิดใช้งานโค้ด ${c.code}`} onChange={(ev) => save({ ...c, active: ev.target.checked }, c.code)} />
                      <span className={`tag ${s.tone}`}>{s.label}</span>
                    </label>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="text-btn text-btn--link" style={{ minHeight: 44 }} onClick={() => open(c)}>แก้ไข</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>}
    </>
  );
}
