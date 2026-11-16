import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { ORDER_STATUSES, StatusPill } from '../components/StatusPill';
import { baht } from '../data/format';
import { DEMO_ORDERS, type AdminOrder } from '../data/orders';
import { shippingFee } from '../data/shipping';
import './TrackPage.css';

// TODO: timestamps should come from the order's status history.
const STEPS = [
  { title: 'สั่งซื้อแล้ว', time: '16 พ.ย. 2569 · 22:51' },
  { title: 'ส่งสลิปแล้ว', time: '16 พ.ย. 2569 · 23:02', wait: 'รอโอนและอัปโหลดสลิป' },
  { title: 'ยืนยันการชำระแล้ว', time: '17 พ.ย. 2569 · 10:15', wait: 'ทีมกำลังตรวจสลิป', extra: 'กำลังทำผิวยางตามสีที่เลือก ประมาณ 3-5 วันก่อนจัดส่ง' },
  { title: 'จัดส่งแล้ว', time: '20 พ.ย. 2569 · 15:40', wait: 'เลขพัสดุจะแสดงที่นี่' },
];
const HEADLINES = ['รอการโอนเงิน', 'รอตรวจสอบสลิป', 'ชำระเงินเรียบร้อย กำลังเตรียมของ', 'ของอยู่ระหว่างทาง'];

const digits = (s: string) => s.replace(/\D/g, '');

function lookup(id: string, phone: string): AdminOrder | null {
  // TODO: call the order-status API.
  return DEMO_ORDERS.find((o) => o.id === id.trim().toUpperCase() && digits(o.phone) === digits(phone)) ?? null;
}

export function TrackPage() {
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get('order') ?? 'BB-261116-0042');
  const [phone, setPhone] = useState('081-234-5678');
  const [result, setResult] = useState<AdminOrder | null | undefined>(() => lookup(id, phone) ?? undefined);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setResult(lookup(id, phone));
  };

  return (
    <>
      <SiteHeader variant="simple" sticky={false} />
      <main className="container container--narrow" style={{ paddingTop: 36, paddingBottom: 80 }}>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 8vw, 56px)', lineHeight: 1.1, letterSpacing: 0 }}>ติดตามออร์เดอร์</h1>
        <p className="lead" style={{ marginTop: 10, fontSize: 16, lineHeight: 1.7 }}>กรอกเลขออร์เดอร์และเบอร์โทรที่ใช้สั่งซื้อ</p>

        <form onSubmit={submit} className="stack" style={{ marginTop: 22, gap: 14 }}>
          <label className="field">เลขออร์เดอร์<input className="input" style={{ height: 52, fontSize: 17, letterSpacing: '0.02em' }} type="text" required value={id} onChange={(e) => setId(e.target.value)} /></label>
          <label className="field">เบอร์โทร<input className="input" style={{ height: 52, fontSize: 17 }} type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <button type="submit" className="btn btn--primary btn--lg">ดูสถานะ</button>
        </form>

        <div aria-live="polite">
          {result === null && (
            <p className="panel" style={{ marginTop: 36, color: 'var(--ink-2)' }}>ไม่พบออร์เดอร์นี้ ตรวจสอบเลขออร์เดอร์และเบอร์โทรอีกครั้ง</p>
          )}
          {result && <OrderStatusCard order={result} />}
        </div>
      </main>
    </>
  );
}

function OrderStatusCard({ order }: { order: AdminOrder }) {
  const cur = ORDER_STATUSES.indexOf(order.status);
  const total = order.items.reduce((a, [, p]) => a + p, 0) + shippingFee(order.kg);

  return (
    <section className="panel" style={{ marginTop: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <p className="small">{order.id} · {baht(total)}</p>
          <p className="num-display" style={{ marginTop: 6, fontSize: 26 }}>{HEADLINES[cur]}</p>
        </div>
        <StatusPill status={order.status} shippedTone="tag--ink" />
      </div>

      <ol className="timeline">
        {STEPS.map((s, i) => {
          const done = i <= cur;
          const active = i === cur;
          const extra = active ? (i === 3 && order.track ? `${order.carrier} · ${order.track}` : s.extra) : undefined;
          return (
            <li key={s.title} data-done={done} data-active={active}>
              <div className="timeline__rail">
                <span className="timeline__dot">
                  {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>}
                </span>
                {i < STEPS.length - 1 && <span className="timeline__line" data-done={i < cur} />}
              </div>
              <div className="timeline__body">
                <p className="timeline__title">{s.title}</p>
                <p className="small" style={{ marginTop: 2 }}>{done ? s.time : i === cur + 1 ? s.wait : 'ยังไม่ถึงขั้นนี้'}</p>
                {extra && <p className="timeline__extra">{extra}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="divider-top body" style={{ paddingTop: 16, fontSize: 14 }}>
        <p>{order.items.map(([n]) => n).join(' · ')}</p>
        <p style={{ marginTop: 6 }}>มีคำถาม ทักทีมทาง <a href="https://line.me/">LINE</a></p>
      </div>
    </section>
  );
}
