'use client';

import Image from 'next/image';
import { SIZES } from '../data/sizes';
import { useState } from 'react';
import { CheckIcon, GymIcon, ShopIcon, TrainerIcon, VetIcon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';
import { img } from '../data/images';
import { css } from '../data/style';
import { submitRequest } from '../server/actions/shop';
import './BusinessPage.css';

const AUDIENCES = [
  { icon: <ShopIcon />, label: 'ร้านค้าสัตว์เลี้ยง' },
  { icon: <TrainerIcon />, label: 'เทรนเนอร์' },
  { icon: <VetIcon />, label: 'โรงพยาบาลสัตว์' },
  { icon: <GymIcon />, label: 'ศูนย์ฟิตเนสหมา' },
];

const STEPS = [
  { title: 'รับออร์เดอร์จากลูกค้า', body: 'ขายในราคาและช่องทางของคุณ แล้วส่งชื่อที่อยู่ลูกค้ามาให้เรา' },
  { title: 'เราแพ็กและจัดส่ง', body: 'ของพร้อมส่งออกภายใน 3-4 วัน พรีออเดอร์ 21-28 วันหลังชำระ ส่งผ่านไปรษณีย์ไทยหรือนิ่มเอ็กซ์เพรส' },
  { title: 'ได้เลขพัสดุใน 1 วัน', body: 'ส่งต่อให้ลูกค้าได้ทันที และสรุปยอดทั้งเดือนให้ในวันที่ 1 หรือวันจันทร์แรกของเดือนถัดไป' },
];

export function BusinessPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // Combine the contact fields and the checkbox group into readable values.
    const contact = [f.get('เบอร์โทร'), f.get('LINE ID') && `LINE ${f.get('LINE ID')}`].filter(Boolean).join(' · ');
    f.set('_contact', contact || String(f.get('อีเมล') ?? ''));
    f.set('สนใจ', f.getAll('interest').join(', '));
    f.delete('interest');
    setSending(true);
    const res = await submitRequest('business', f).catch(() => ({ ok: false as const, error: 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง' }));
    setSending(false);
    if (res.ok) setSent(true);
    else setError(res.error);
  };

  return (
    <>
      <SiteHeader
        right={
          <a href="#contact" className="btn btn--primary btn--sm" style={{ height: 40, padding: '0 16px', marginLeft: 4 }}>ติดต่อทีมขาย</a>
        }
      />
      <main>
        <section className="container" style={{ paddingTop: 44 }}>
          <p className="eyebrow">For Business</p>
          <h1 className="display" style={{ maxWidth: 880, letterSpacing: 0 }}>ให้ลูกค้าของคุณ ได้ขยับและเล่นกับหมามากขึ้น</h1>
          <p className="lead" style={{ marginTop: 16, maxWidth: 600 }}>
            ราคาส่งสำหรับร้านค้า เทรนเนอร์ โรงพยาบาลสัตว์ และศูนย์ฟิตเนสหมา จะซื้อไปใช้ วางขายหน้าร้าน หรือให้เราส่งตรงถึงลูกค้าแบบ Dropship ก็ได้
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="#contact" className="btn btn--primary">ขอใบเสนอราคา</a>
            <a href="#dropship" className="btn btn--outline" style={{ padding: '0 24px' }}>ดูระบบ Dropship</a>
          </div>
          <Image priority sizes={SIZES.full} src={img.dogsOnBoxes} alt="หมาสองตัวยืนบนอุปกรณ์ Buildabond ในสนามหญ้า" className="photo" style={{ marginTop: 32, aspectRatio: '16 / 10', maxHeight: 600 }} />
        </section>

        <section className="container section">
          <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>เหมาะกับใคร</h2>
          <div className="auto-grid" style={css({ '--min': '160px', '--gap': '10px', marginTop: 20 })}>
            {AUDIENCES.map((a) => (
              <div key={a.label} className="panel" style={{ borderRadius: 18, padding: 20 }}>
                {a.icon}
                <p className="num-display" style={{ marginTop: 12, fontWeight: 500, fontSize: 17 }}>{a.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container section">
          <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>2 แบบให้เลือก</h2>
          <div className="auto-grid" style={css({ '--min': '300px', '--gap': '14px', marginTop: 20 })}>
            <div className="plan-card" style={{ border: '1px solid var(--line)' }}>
              <p className="plan-card__kicker">Wholesale</p>
              <h3>ซื้อส่ง ใช้เองหรือวางขาย</h3>
              <ul className="check-list">
                {['ขั้นต่ำ 5 ชิ้น คละรุ่นได้', 'ส่งฟรี เราเลือกขนส่งให้', 'ยอดเกิน ฿10,000 ลดเพิ่มอีก 5%'].map((t) => (
                  <li key={t}><CheckIcon style={{ color: 'var(--link)' }} />{t}</li>
                ))}
              </ul>
            </div>
            <div id="dropship" className="plan-card on-dark">
              <p className="plan-card__kicker" style={{ color: 'var(--on-dark-eyebrow)' }}>Dropship</p>
              <h3>คุณขาย เราส่งให้</h3>
              <ul className="check-list">
                {['ไม่มีขั้นต่ำ ไม่ต้องสต็อกของ', 'ค่าส่งเหมาต่อที่อยู่ ยอดต่ำกว่า ฿1,000 ส่ง ฿50 ตั้งแต่ ฿1,000 ส่ง ฿200', 'สรุปยอดและออกใบเสร็จทุกต้นเดือน'].map((t) => (
                  <li key={t}><CheckIcon style={{ color: '#8FC8EA' }} />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="container section">
          <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>Dropship ทำงานยังไง</h2>
          <ol className="auto-grid biz-steps" style={css({ '--min': '220px', '--gap': '24px', marginTop: 24 })}>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <p className="biz-steps__n">{i + 1}</p>
                <p className="strong" style={{ marginTop: 10 }}>{s.title}</p>
                <p className="body" style={{ marginTop: 4, fontSize: 14, lineHeight: 1.65 }}>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className="container section" style={{ paddingBottom: 96 }}>
          <div className="panel" style={{ padding: '28px 20px' }}>
            <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>ขอใบเสนอราคา</h2>
            <p className="body" style={{ marginTop: 8 }}>ทีมจะส่งตารางราคาส่งและรายละเอียดให้ทาง LINE หรืออีเมล</p>
            {sent ? (
              <p className="tag tag--green tag--md" style={{ marginTop: 22 }}>ได้รับข้อมูลแล้ว ทีมขายจะติดต่อกลับเร็ว ๆ นี้</p>
            ) : (
              <form
                className="auto-grid"
                style={css({ '--min': '260px', '--gap': '14px', marginTop: 22 })}
                onSubmit={send}
              >
                <label className="field">ชื่อธุรกิจ<input className="input" name="_name" type="text" autoComplete="organization" required /></label>
                <label className="field">ประเภทธุรกิจ
                  <select className="input" name="ประเภทธุรกิจ">
                    <option>ร้านค้าสัตว์เลี้ยง</option><option>เทรนเนอร์</option><option>โรงพยาบาลสัตว์</option><option>ศูนย์ฟิตเนสหมา</option><option>อื่น ๆ</option>
                  </select>
                </label>
                <label className="field">ชื่อผู้ติดต่อ<input className="input" name="ผู้ติดต่อ" type="text" autoComplete="name" required /></label>
                <label className="field">เบอร์โทร<input className="input" name="เบอร์โทร" type="tel" autoComplete="tel" required /></label>
                <label className="field">LINE ID<input className="input" name="LINE ID" type="text" /></label>
                <label className="field">อีเมล<input className="input" name="อีเมล" type="email" autoComplete="email" /></label>
                <fieldset className="plain span-all">
                  <legend style={{ fontSize: 14, fontWeight: 500 }}>สนใจแบบไหน</legend>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <label className="check-pill"><input type="checkbox" name="interest" value="ซื้อส่ง" defaultChecked />ซื้อส่ง</label>
                    <label className="check-pill"><input type="checkbox" name="interest" value="Dropship" />Dropship</label>
                    <label className="check-pill"><input type="checkbox" name="interest" value="สั่งทำขนาดพิเศษ" />สั่งทำขนาดพิเศษ</label>
                  </div>
                </fieldset>
                <label className="field span-all">รายละเอียดเพิ่มเติม<textarea className="input" name="รายละเอียด" rows={4} placeholder="เช่น รุ่นที่สนใจ จำนวนโดยประมาณ" /></label>
                {error && <p role="alert" className="small span-all" style={{ color: '#8e1f0b' }}>{error}</p>}
                <button type="submit" className="btn btn--primary btn--lg span-all" disabled={sending}>{sending ? 'กำลังส่ง…' : 'ส่งข้อมูล'}</button>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
