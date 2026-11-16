import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DocIcon, DownloadIcon, QrIcon, UploadIcon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { BANK } from '../data/orders';
import './OrderPlacedPage.css';

export function OrderPlacedPage() {
  const { lastOrder, total } = useCart();
  // Fall back to demo values when the page is opened directly.
  const order = lastOrder ?? { id: 'BB-261116-0042', total, phone: '081-234-5678' };
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState('');

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(BANK.number.replace(/-/g, ''));
    } catch {
      /* clipboard may be blocked; still show feedback */
    }
    setCopied(true);
  };

  return (
    <>
      <SiteHeader variant="simple" sticky={false} />
      <main className="container container--narrow" style={{ paddingTop: 36, paddingBottom: 80 }}>
        <div className="success-badge"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg></div>
        <h1 className="display" style={{ marginTop: 18, fontSize: 'clamp(34px, 8vw, 52px)', lineHeight: 1.12, letterSpacing: 0 }}>ได้รับคำสั่งซื้อแล้ว</h1>
        <p className="lead" style={{ marginTop: 10, fontSize: 16, lineHeight: 1.7 }}>โอนเงินแล้วอัปโหลดสลิปด้านล่าง ทีมจะตรวจสอบและยืนยันให้</p>

        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <div className="info-box">
            <p className="small">เลขออร์เดอร์</p>
            <p className="info-box__value" style={{ letterSpacing: '0.02em' }}>{order.id}</p>
          </div>
          <div className="info-box">
            <p className="small">ยอดที่ต้องโอน</p>
            <p className="info-box__value">{baht(order.total)}</p>
          </div>
        </div>

        <section className="panel" style={{ marginTop: 28 }}>
          <h2 className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>สแกนจ่ายด้วยพร้อมเพย์</h2>
          {/* TODO: generate the PromptPay QR for the order total */}
          <div className="qr-box">
            <QrIcon style={{ color: 'var(--ink-2)' }} />
            <span className="small">QR พร้อมเพย์<br />ระบบสร้างตามยอด {baht(order.total)}</span>
          </div>
          <button type="button" className="btn btn--outline btn--sm" style={{ margin: '14px auto 0', display: 'flex' }}>
            <DownloadIcon />บันทึกรูป QR
          </button>

          <div className="divider-top" style={{ marginTop: 22, paddingTop: 18 }}>
            <p className="muted" style={{ fontSize: 14 }}>หรือโอนเข้าบัญชี</p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p className="strong">{BANK.name}</p>
                <p className="num-display" style={{ marginTop: 4, fontSize: 26, letterSpacing: '0.04em' }}>{BANK.number}</p>
                <p className="muted" style={{ marginTop: 2, fontSize: 14 }}>{BANK.holder}</p>
              </div>
              <button type="button" className="btn btn--primary btn--sm" onClick={copy}>{copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}</button>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>อัปโหลดสลิป</h2>
          {file ? (
            <div className="slip-done">
              <div className="slip-done__icon"><DocIcon style={{ color: 'var(--link)' }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="strong" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</p>
                <p style={{ marginTop: 4, fontSize: 14, color: 'var(--green)' }}>ส่งสลิปแล้ว รอทีมตรวจสอบ</p>
              </div>
              <button type="button" className="text-btn" style={{ padding: '0 12px' }} onClick={() => setFile('')}>เปลี่ยน</button>
            </div>
          ) : (
            <label className="slip-drop">
              <UploadIcon style={{ color: 'var(--link)' }} />
              <span className="strong">เลือกรูปสลิป</span>
              <span className="small">JPG หรือ PNG จากแอปธนาคาร</span>
              {/* TODO: upload the slip to the backend */}
              <input type="file" accept="image/*" className="visually-hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f.name); }} />
            </label>
          )}
        </section>

        <div className="stack" style={{ marginTop: 28 }}>
          <Link to={`/track?order=${encodeURIComponent(order.id)}`} className="btn btn--primary btn--lg btn--block">ติดตามสถานะออร์เดอร์</Link>
          <Link to="/" className="btn btn--ghost btn--block">กลับหน้าแรก</Link>
        </div>
        <p className="small" style={{ marginTop: 18, lineHeight: 1.7 }}>
          เก็บเลขออร์เดอร์ไว้ ใช้คู่กับเบอร์โทร {order.phone || 'ที่ใช้สั่งซื้อ'} เพื่อเช็กสถานะได้ทุกเมื่อ
        </p>
      </main>
    </>
  );
}
