'use client';

import { useState, useTransition } from 'react';
import { promptPayPayload } from '../../lib/promptpay';
import { tierRange } from '../../lib/shipping';
import type { ShopSettings } from '../../lib/types';
import { updateSettings } from '../../server/actions/admin';

export function SettingsAdmin({ settings }: { settings: ShopSettings }) {
  const [s, setS] = useState(settings);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const patch = (p: Partial<ShopSettings>) => { setS((x) => ({ ...x, ...p })); setSaved(false); };
  const setTier = (i: number, k: 'upToKg' | 'fee', v: number) =>
    patch({ shipping: s.shipping.map((t, j) => (j === i ? { ...t, [k]: v } : t)) });
  const promptpayValid = !s.promptpay || promptPayPayload(s.promptpay) !== null;

  const save = () => {
    setError('');
    if (!promptpayValid) return setError('พร้อมเพย์ต้องเป็นเบอร์มือถือ 10 หลัก หรือเลขบัตรประชาชน / เลขผู้เสียภาษี 13 หลัก');
    start(async () => {
      const res = await updateSettings(s).catch((e: Error) => ({ error: e.message }));
      if (res.error) setError(res.error);
      else setSaved(true);
    });
  };

  return (
    <>
      <div className="admin-head"><h1>ตั้งค่าร้าน</h1></div>
      <div className="stack" style={{ marginTop: 18, gap: 18, maxWidth: 860 }}>
        <section className="admin-card">
          <h2>การรับเงิน</h2>
          <div className="admin-grid">
            <label className="field">ธนาคาร<input className="input" value={s.bank.name} onChange={(e) => patch({ bank: { ...s.bank, name: e.target.value } })} /></label>
            <label className="field">ชื่อธนาคาร (ภาษาอังกฤษ)<input className="input" value={s.bank.nameEn ?? ''} onChange={(e) => patch({ bank: { ...s.bank, nameEn: e.target.value } })} placeholder="Krungthai Bank (KTB)" /></label>
            <label className="field">เลขบัญชี<input className="input" value={s.bank.number} onChange={(e) => patch({ bank: { ...s.bank, number: e.target.value } })} /></label>
            <label className="field">ชื่อบัญชี<input className="input" value={s.bank.holder} onChange={(e) => patch({ bank: { ...s.bank, holder: e.target.value } })} /></label>
            <label className="field">
              พร้อมเพย์
              <span className="field__hint">เบอร์มือถือหรือเลข 13 หลัก ระบบจะสร้าง QR ตามยอดของแต่ละออร์เดอร์ ว่างไว้ = ไม่แสดง QR</span>
              <input className="input" inputMode="numeric" value={s.promptpay} onChange={(e) => patch({ promptpay: e.target.value })} aria-invalid={!promptpayValid} />
            </label>
          </div>
        </section>

        <section className="admin-card">
          <h2>ค่าส่งตามน้ำหนักรวม</h2>
          <table className="admin__table" style={{ minWidth: 0 }}>
            <thead>
              <tr><th scope="col">ช่วงน้ำหนัก</th><th scope="col">ไม่เกิน (กก.)</th><th scope="col">ค่าส่ง (บาท)</th></tr>
            </thead>
            <tbody>
              {s.shipping.map((t, i) => (
                <tr key={i}>
                  <td>{tierRange(s.shipping, i)}</td>
                  <td>
                    {t.upToKg === null ? <span className="muted">ขึ้นไป</span> : (
                      <input className="input input--sm" style={{ maxWidth: 120 }} type="number" min={0.1} step={0.1} value={t.upToKg} aria-label={`น้ำหนักสูงสุดช่วงที่ ${i + 1}`} onChange={(e) => setTier(i, 'upToKg', Number(e.target.value))} />
                    )}
                  </td>
                  <td>
                    <input className="input input--sm" style={{ maxWidth: 120 }} type="number" min={0} value={t.fee} aria-label={`ค่าส่งช่วงที่ ${i + 1}`} onChange={(e) => setTier(i, 'fee', Number(e.target.value))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-card">
          <h2>แม่เหล็ก</h2>
          <div className="admin-grid">
            <label className="field">ราคาต่อชิ้น (บาท)<input className="input" type="number" min={0} value={s.magnetPrice} onChange={(e) => patch({ magnetPrice: Number(e.target.value) })} /></label>
            <label className="field">เลือกได้สูงสุด (ชิ้น)<input className="input" type="number" min={0} max={20} value={s.maxMagnets} onChange={(e) => patch({ maxMagnets: Number(e.target.value) })} /></label>
          </div>
        </section>
      </div>

      <div className="admin-actions" style={{ maxWidth: 860 }}>
        <button type="button" className="btn btn--primary btn--square" onClick={save} disabled={pending}>{pending ? 'กำลังบันทึก…' : 'บันทึก'}</button>
        {saved && !pending && <span className="admin-note admin-note--ok" style={{ padding: '8px 12px' }}>บันทึกแล้ว หน้าร้านอัปเดตแล้ว</span>}
        {error && <span role="alert" className="admin-note admin-note--warn" style={{ padding: '8px 12px' }}>{error}</span>}
      </div>
    </>
  );
}
