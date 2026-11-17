'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DocIcon, DownloadIcon, QrIcon, UploadIcon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';
import { baht } from '../data/format';
import { useI18n } from '../i18n/LocaleProvider';
import { formatPhone } from '../lib/phone';
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
  const { lang, t } = useI18n();
  const o = t.order;
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [replacing, setReplacing] = useState(false);

  if (!order) {
    return (
      <>
        <SiteHeader />
        <main className="container container--narrow" style={{ paddingTop: 36, paddingBottom: 80 }}>
          <h1 className="display" style={{ fontSize: 'clamp(34px, 8vw, 52px)', letterSpacing: 0 }}>{o.notFoundTitle}</h1>
          <p className="lead" style={{ marginTop: 10, fontSize: 16 }}>{o.notFoundBody}</p>
          <Link href="/track" className="btn btn--primary" style={{ marginTop: 24 }}>{t.common.navTrack}</Link>
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
    const res = await uploadSlip(order.id, accessKey, f).catch(() => ({ ok: false as const, error: 'uploadFailed' as const }));
    setUploading(false);
    if (!res.ok) return setError(t.errors[res.error]);
    setReplacing(false);
    router.refresh();
  };

  return (
    <>
      <SiteHeader />
      <main className="container container--narrow" style={{ paddingTop: 36, paddingBottom: 80 }}>
        <div className="success-badge"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg></div>
        <h1 className="display" style={{ marginTop: 18, fontSize: 'clamp(34px, 8vw, 52px)', lineHeight: 1.12, letterSpacing: 0 }}>{o.title}</h1>
        <p className="lead" style={{ marginTop: 10, fontSize: 16, lineHeight: 1.7 }}>{o.lead}</p>

        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <div className="info-box">
            <p className="small">{o.orderNo}</p>
            <p className="info-box__value" style={{ letterSpacing: '0.02em' }}>{order.id}</p>
          </div>
          <div className="info-box">
            <p className="small">{o.amountDue}</p>
            <p className="info-box__value">{baht(order.total)}</p>
          </div>
        </div>

        <section className="panel" style={{ marginTop: 28 }}>
          <h2 className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>{o.promptpayTitle}</h2>
          {qrSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL */}
              <img src={qrSrc} alt={o.qrAlt(baht(order.total))} className="qr-box qr-box--real" width={220} height={220} />
              <a href={qrSrc} download={`promptpay-${order.id}.svg`} className="btn btn--outline btn--sm" style={{ margin: '14px auto 0', display: 'flex', width: 'fit-content' }}>
                <DownloadIcon />{o.saveQr}
              </a>
            </>
          ) : (
            <div className="qr-box">
              <QrIcon style={{ color: 'var(--ink-2)' }} />
              <span className="small">{o.qrPending[0]}<br />{o.qrPending[1]}</span>
            </div>
          )}

          <div className="divider-top" style={{ marginTop: 22, paddingTop: 18 }}>
            <p className="muted" style={{ fontSize: 14 }}>{o.orTransfer}</p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p className="strong">{lang === 'en' && bank.nameEn ? bank.nameEn : bank.name}</p>
                <p className="num-display" style={{ marginTop: 4, fontSize: 26, letterSpacing: '0.04em' }}>{bank.number}</p>
                <p className="muted" style={{ marginTop: 2, fontSize: 14 }}>{bank.holder}</p>
              </div>
              <button type="button" className="btn btn--primary btn--sm" onClick={copy}>{copied ? o.copied : o.copy}</button>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 className="num-display" style={{ fontWeight: 400, fontSize: 22 }}>{o.uploadTitle}</h2>
          {hasSlip ? (
            <div className="slip-done">
              <div className="slip-done__icon"><DocIcon style={{ color: 'var(--link)' }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="strong">{o.slipSent}</p>
                <p style={{ marginTop: 4, fontSize: 14, color: 'var(--green)' }}>
                  {order.status === 'ส่งสลิปแล้ว' || order.status === 'รอชำระ' ? o.awaitingReview : o.statusLine(t.status[order.status])}
                </p>
              </div>
              {(order.status === 'ส่งสลิปแล้ว' || order.status === 'รอชำระ') && (
                <button type="button" className="text-btn" style={{ padding: '0 12px' }} onClick={() => setReplacing(true)}>{o.change}</button>
              )}
            </div>
          ) : (
            <label className="slip-drop" aria-busy={uploading}>
              <UploadIcon style={{ color: 'var(--link)' }} />
              <span className="strong">{uploading ? o.uploading : o.chooseSlip}</span>
              <span className="small">{o.slipHint}</span>
              <input type="file" accept="image/*" className="visually-hidden" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          )}
          {error && <p role="alert" className="small" style={{ marginTop: 10, color: '#8e1f0b' }}>{error}</p>}
        </section>

        <div className="stack" style={{ marginTop: 28 }}>
          <Link href={`/track?order=${encodeURIComponent(order.id)}`} className="btn btn--primary btn--lg btn--block">{o.trackCta}</Link>
          <Link href="/" className="btn btn--ghost btn--block">{o.homeCta}</Link>
        </div>
        <p className="small" style={{ marginTop: 18, lineHeight: 1.7 }}>
          {o.keepNote(formatPhone(order.phone), order.email)}
        </p>
      </main>
    </>
  );
}
