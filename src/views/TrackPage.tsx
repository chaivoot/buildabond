'use client';

import { useState, type FormEvent } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { StatusPill } from '../components/StatusPill';
import { baht } from '../data/format';
import { thaiDateTime } from '../lib/dates';
import { trackOrder, type TrackedOrder } from '../server/actions/shop';
import { useI18n } from '../i18n/LocaleProvider';
import './TrackPage.css';

const FLOW = ['รอชำระ', 'ส่งสลิปแล้ว', 'ยืนยันแล้ว', 'จัดส่งแล้ว'] as const;
const STEP_TIMES = [
  (o: TrackedOrder) => o.createdAt,
  (o: TrackedOrder) => o.slipAt,
  (o: TrackedOrder) => o.confirmedAt,
  (o: TrackedOrder) => o.shippedAt,
];

interface Props {
  initialId: string;
  initialPhone: string;
  initialResult?: TrackedOrder;
}

export function TrackPage({ initialId, initialPhone, initialResult }: Props) {
  const { t } = useI18n();
  const tr = t.track;
  const [id, setId] = useState(initialId);
  const [phone, setPhone] = useState(initialPhone);
  const [result, setResult] = useState<TrackedOrder | null | undefined>(initialResult);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(await trackOrder(id, phone).catch(() => null));
    setLoading(false);
  };

  return (
    <>
      <SiteHeader />
      <main className="container container--narrow" style={{ paddingTop: 36, paddingBottom: 80 }}>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 8vw, 56px)', lineHeight: 1.1, letterSpacing: 0 }}>{tr.title}</h1>
        <p className="lead" style={{ marginTop: 10, fontSize: 16, lineHeight: 1.7 }}>{tr.lead}</p>

        <form onSubmit={submit} className="stack" style={{ marginTop: 22, gap: 14 }}>
          <label className="field">{tr.orderNo}<input className="input" style={{ height: 52, fontSize: 17, letterSpacing: '0.02em' }} type="text" required value={id} onChange={(e) => setId(e.target.value)} /></label>
          <label className="field">{tr.phone}<input className="input" style={{ height: 52, fontSize: 17 }} type="text" autoComplete="email" required value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>{loading ? tr.searching : tr.submit}</button>
        </form>

        <div aria-live="polite">
          {result === null && (
            <p className="panel" style={{ marginTop: 36, color: 'var(--ink-2)' }}>{tr.notFound}</p>
          )}
          {result && <OrderStatusCard order={result} />}
        </div>
      </main>
    </>
  );
}

function OrderStatusCard({ order }: { order: TrackedOrder }) {
  const { lang, t } = useI18n();
  const tr = t.track;
  if (order.status === 'ยกเลิก') {
    return (
      <section className="panel" style={{ marginTop: 36 }}>
        <p className="small">{order.id} · {baht(order.total)}</p>
        <p className="num-display" style={{ marginTop: 6, fontSize: 26 }}>{tr.cancelled}</p>
        <p className="body" style={{ marginTop: 10 }}>{t.common.askLine} <a href="https://line.me/">LINE</a></p>
      </section>
    );
  }
  const cur = FLOW.indexOf(order.status as (typeof FLOW)[number]);

  return (
    <section className="panel" style={{ marginTop: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <p className="small">{order.id} · {baht(order.total)}</p>
          <p className="num-display" style={{ marginTop: 6, fontSize: 26 }}>{tr.headlines[cur]}</p>
        </div>
        <StatusPill status={order.status} label={t.status[order.status]} shippedTone="tag--ink" />
      </div>

      <ol className="timeline">
        {tr.steps.map((title, i) => {
          const done = i <= cur;
          const active = i === cur;
          const extra = active ? (i === 3 && order.tracking ? `${order.carrier} · ${order.tracking}` : i === 2 ? tr.preparing : undefined) : undefined;
          return (
            <li key={title} data-done={done} data-active={active}>
              <div className="timeline__rail">
                <span className="timeline__dot">
                  {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>}
                </span>
                {i < tr.steps.length - 1 && <span className="timeline__line" data-done={i < cur} />}
              </div>
              <div className="timeline__body">
                <p className="timeline__title">{title}</p>
                <p className="small" style={{ marginTop: 2 }}>{done ? thaiDateTime(STEP_TIMES[i](order), true, lang) || tr.done : i === cur + 1 ? tr.waits[i] : tr.notYet}</p>
                {extra && <p className="timeline__extra">{extra}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="divider-top body" style={{ paddingTop: 16, fontSize: 14 }}>
        <p>{order.items.map((i) => `${i.name}${lang === 'th' && i.opt && i.opt !== '—' ? ` ${i.opt}` : ''}${i.qty > 1 ? ` × ${i.qty}` : ''}`).join(' · ')}</p>
        <p style={{ marginTop: 6 }}>{t.common.askLine} <a href="https://line.me/">LINE</a></p>
      </div>
    </section>
  );
}
