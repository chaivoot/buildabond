'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DocIcon, DownloadIcon, QrIcon, UploadIcon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';
import { baht } from '../data/format';
import type { Order, ShopSettings } from '../lib/types';
import { uploadSlip } from '../server/actions/shop';
import './OrderPlacedPage.css';

interface Props {
  order: Order | null;
  accessKey: string;
  bank: ShopSettings['bank'];
  qrSvg: string | null;
}

export function OrderPlacedPage({ order, accessKey, bank, qrSvg }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [replacing, setReplacing] = useState(false);

  if (!order) {
    return (
      <>
        <SiteHeader variant="simple" sticky={false} />
        <main className="container container--narrow" style={{ paddingTop: 36, paddingBottom: 80 }}>
          <h1 className="display" style={{ fontSize: 'clamp(34px, 8vw, 52px)', letterSpacing: 0 }}>ไม่พบออร์เดอร์</h1>
          <p className="lead" style={{ marginTop: 10, fontSize: 16 }}>ลิงก์อาจไม่ครบ ลองเช็กสถานะด้วยเลขออร์เดอร์และเบอร์โทร</p>
          <Link href="/track" className="btn btn--primary" style={{ marginTop: 24 }}>ติดตามออร์เดอร์</Link>
        </main>
      </>
    );
  }

  const qrSrc = qrSvg ? `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}` : null;
  const hasSlip = !!order.slipUrl && !replacing;

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(bank.number.replace(/\D/g, ''));
    } catch {
      /* clipboard may be blocked; still show feedback */
    }
    setCopied(true);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError('');
    const f = new FormData();
    f.set('file', file);
    const res = await uploadSlip(order.id, accessKey, f).catch(() => ({ ok: false as const, error: 'อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง' }));
    setUploading(false);
    if (!res.ok) return setError(res.error);
    setReplacing(false);
    router.refresh();
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
          {qrSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL */}
              <img src={qrSrc} alt={`QR พร้อมเพย์ ยอด ${baht(order.total)}`} className="qr-box qr-box--real" width={220} height={220} />
              <a href={qrSrc} download={`promptpay-${order.id}.svg`} className="btn btn--outline btn--sm" style={{ margin: '14px auto 0', display: 'flex', width: 'fit-content' }}>
                <DownloadIcon />บันทึกรูป QR
              </a>
            </>
          ) : (
            <div className="qr-box">
              <QrIcon style={{ color: 'var(--ink-2)' }} />
              <span className="small">QR พร้อมเพย์จะแสดงที่นี่<br />เมื่อร้านตั้งค่าพร้อมเพย์แล้ว</span>
            </div>
          )}

          <div className="divider-top" style={{ marginTop: 22, paddingTop: 18 }}>
            <p className="muted" style={{ fontSize: 14 }}>หรือโอนเข้าบัญชี</p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p className="strong">{bank.name}</p>
                <p className="num-display" style={{ marginTop: 4, fontSize: 26, letterSpacing: '0.04em' }}>{bank.number}</p>
                <p className="muted" style={{ marginTop: 2, fontSize: 14 }}>{bank.holder}</p>
              </div>
              <button type="button" className="btn btn--primary btn--sm" onClick={copy}>{copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}</button>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>อัปโหลดสลิป</h2>
          {hasSlip ? (
            <div className="slip-done">
              <div className="slip-done__icon"><DocIcon style={{ color: 'var(--link)' }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="strong">ส่งสลิปแล้ว</p>
                <p style={{ marginTop: 4, fontSize: 14, color: 'var(--green)' }}>
                  {order.status === 'ส่งสลิปแล้ว' ? 'รอทีมตรวจสอบ' : order.status === 'รอชำระ' ? 'รอทีมตรวจสอบ' : `สถานะ: ${order.status}`}
                </p>
              </div>
              {(order.status === 'ส่งสลิปแล้ว' || order.status === 'รอชำระ') && (
                <button type="button" className="text-btn" style={{ padding: '0 12px' }} onClick={() => setReplacing(true)}>เปลี่ยน</button>
              )}
            </div>
          ) : (
            <label className="slip-drop" aria-busy={uploading}>
              <UploadIcon style={{ color: 'var(--link)' }} />
              <span className="strong">{uploading ? 'กำลังอัปโหลด…' : 'เลือกรูปสลิป'}</span>
              <span className="small">JPG หรือ PNG จากแอปธนาคาร ไม่เกิน 4 MB</span>
              <input type="file" accept="image/*" className="visually-hidden" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          )}
          {error && <p role="alert" className="small" style={{ marginTop: 10, color: '#8e1f0b' }}>{error}</p>}
        </section>

        <div className="stack" style={{ marginTop: 28 }}>
          <Link href={`/track?order=${encodeURIComponent(order.id)}`} className="btn btn--primary btn--lg btn--block">ติดตามสถานะออร์เดอร์</Link>
          <Link href="/" className="btn btn--ghost btn--block">กลับหน้าแรก</Link>
        </div>
        <p className="small" style={{ marginTop: 18, lineHeight: 1.7 }}>
          เก็บลิงก์หน้านี้หรือเลขออร์เดอร์ไว้ ใช้คู่กับเบอร์โทร {order.phone} เพื่อเช็กสถานะได้ทุกเมื่อ
        </p>
      </main>
    </>
  );
}
