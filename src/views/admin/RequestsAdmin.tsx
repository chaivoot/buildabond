'use client';

import { useState, useTransition } from 'react';
import { thaiDateTime } from '../../lib/dates';
import type { RequestKind, RequestStatus, ShopRequest } from '../../lib/types';
import { updateRequestStatus } from '../../server/actions/admin';

const KINDS: { id: RequestKind | 'all'; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'custom', label: 'สั่งทำขนาดพิเศษ' },
  { id: 'business', label: 'ลูกค้าธุรกิจ' },
];
const STATUSES: RequestStatus[] = ['ใหม่', 'ติดต่อแล้ว', 'ปิดแล้ว'];
const TONE: Record<RequestStatus, string> = { 'ใหม่': 'tag--orange', 'ติดต่อแล้ว': 'tag--sky', 'ปิดแล้ว': 'tag--sand' };

export function RequestsAdmin({ requests }: { requests: ShopRequest[] }) {
  const [kind, setKind] = useState<RequestKind | 'all'>('all');
  const [pending, start] = useTransition();
  const visible = requests.filter((r) => kind === 'all' || r.kind === kind);

  return (
    <>
      <div className="admin-head"><h1>คำขอสั่งทำ / ลูกค้าธุรกิจ</h1></div>
      <div role="tablist" aria-label="ประเภทคำขอ" className="admin__tabs">
        {KINDS.map((k) => (
          <button key={k.id} type="button" role="tab" aria-selected={k.id === kind} onClick={() => setKind(k.id)}>
            {k.label} <span>{k.id === 'all' ? requests.length : requests.filter((r) => r.kind === k.id).length}</span>
          </button>
        ))}
      </div>

      <div className="auto-fill" style={{ '--min': '320px', '--gap': '14px', marginTop: 18 } as React.CSSProperties} aria-busy={pending}>
        {visible.map((r) => (
          <article key={r.id} className="admin-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div>
                <p className="small">{r.kind === 'custom' ? 'สั่งทำขนาดพิเศษ' : 'ลูกค้าธุรกิจ'} · {thaiDateTime(r.createdAt)}</p>
                <h2 style={{ margin: '4px 0 0' }}>{r.name}</h2>
                <p style={{ marginTop: 2, fontSize: 14 }}>{r.contact}</p>
              </div>
              <span className={`tag ${TONE[r.status]}`}>{r.status}</span>
            </div>
            <dl style={{ margin: '14px 0 0', fontSize: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px' }}>
              {Object.entries(r.data).map(([k, v]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt className="muted">{k}</dt>
                  <dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{v}</dd>
                </div>
              ))}
            </dl>
            <label className="field" style={{ marginTop: 14, fontSize: 13 }}>
              สถานะ
              <select className="input input--sm" value={r.status} onChange={(e) => start(() => updateRequestStatus(r.id, e.target.value as RequestStatus))}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </article>
        ))}
      </div>
      {visible.length === 0 && <p className="muted" style={{ padding: 32, textAlign: 'center' }}>ยังไม่มีคำขอ</p>}
    </>
  );
}
