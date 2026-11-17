'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { CheckIcon, GymIcon, ShopIcon, TrainerIcon, VetIcon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';
import { img } from '../data/images';
import { SIZES } from '../data/sizes';
import { css } from '../data/style';
import { useI18n } from '../i18n/LocaleProvider';
import { th } from '../i18n/th';
import { submitRequest } from '../server/actions/shop';
import './BusinessPage.css';

const AUDIENCE_ICONS = [<ShopIcon key="s" />, <TrainerIcon key="t" />, <VetIcon key="v" />, <GymIcon key="g" />];

export function BusinessPage() {
  const { lang, t } = useI18n();
  const b = t.business;
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // Combine the contact fields and the checkbox group into readable values (Thai labels, for the admin).
    const contact = [f.get('เบอร์โทร'), f.get('LINE ID') && `LINE ${f.get('LINE ID')}`].filter(Boolean).join(' · ');
    f.set('_contact', contact || String(f.get('อีเมล') ?? ''));
    f.set('สนใจ', f.getAll('interest').join(', '));
    f.delete('interest');
    if (lang !== 'th') f.set('ภาษา', 'English');
    setSending(true);
    const res = await submitRequest('business', f).catch(() => ({ ok: false as const, error: 'sendFailed' as const }));
    setSending(false);
    if (res.ok) setSent(true);
    else setError(t.errors[res.error]);
  };

  // Option values stay in Thai so the admin inbox reads the same whichever language the customer used.
  const types = [...th.business.audiences, th.business.fields.other].map((value, i) => ({ value, label: [...b.audiences, b.fields.other][i] }));
  const interests = (['wholesale', 'dropship', 'custom'] as const).map((k) => ({ value: th.business.fields[k], label: b.fields[k] }));

  return (
    <>
      <SiteHeader
        extra={<a href="#contact" className="btn btn--primary btn--sm site-header__cta">{b.contactSales}</a>}
      />
      <main>
        <section className="container" style={{ paddingTop: 44 }}>
          <p className="eyebrow">For Business</p>
          <h1 className="display" style={{ maxWidth: 880, letterSpacing: 0 }}>{b.title}</h1>
          <p className="lead" style={{ marginTop: 16, maxWidth: 600 }}>{b.lead}</p>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="#contact" className="btn btn--primary">{b.quoteCta}</a>
            <a href="#dropship" className="btn btn--outline" style={{ padding: '0 24px' }}>{b.dropshipCta}</a>
          </div>
          <Image priority sizes={SIZES.full} src={img.dogsOnBoxes} alt={b.heroAlt} className="photo" style={{ marginTop: 32, aspectRatio: '16 / 10', maxHeight: 600 }} />
        </section>

        <section className="container section">
          <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>{b.whoTitle}</h2>
          <div className="auto-grid" style={css({ '--min': '160px', '--gap': '10px', marginTop: 20 })}>
            {b.audiences.map((label, i) => (
              <div key={label} className="panel" style={{ borderRadius: 18, padding: 20 }}>
                {AUDIENCE_ICONS[i]}
                <p className="num-display" style={{ marginTop: 12, fontWeight: 500, fontSize: 17 }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container section">
          <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>{b.plansTitle}</h2>
          <div className="auto-grid" style={css({ '--min': '300px', '--gap': '14px', marginTop: 20 })}>
            <div className="plan-card" style={{ border: '1px solid var(--line)' }}>
              <p className="plan-card__kicker">Wholesale</p>
              <h3>{b.wholesaleTitle}</h3>
              <ul className="check-list">
                {b.wholesale.map((x) => (
                  <li key={x}><CheckIcon style={{ color: 'var(--link)' }} />{x}</li>
                ))}
              </ul>
            </div>
            <div id="dropship" className="plan-card on-dark">
              <p className="plan-card__kicker" style={{ color: 'var(--on-dark-eyebrow)' }}>Dropship</p>
              <h3>{b.dropshipTitle}</h3>
              <ul className="check-list">
                {b.dropship.map((x) => (
                  <li key={x}><CheckIcon style={{ color: '#8FC8EA' }} />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="container section">
          <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>{b.howTitle}</h2>
          <ol className="auto-grid biz-steps" style={css({ '--min': '220px', '--gap': '24px', marginTop: 24 })}>
            {b.how.map((s, i) => (
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
            <h2 className="title" style={{ fontSize: 'clamp(30px, 5vw, 44px)' }}>{b.formTitle}</h2>
            <p className="body" style={{ marginTop: 8 }}>{b.formLead}</p>
            {sent ? (
              <p className="tag tag--green tag--md" style={{ marginTop: 22 }}>{b.sent}</p>
            ) : (
              <form className="auto-grid" style={css({ '--min': '260px', '--gap': '14px', marginTop: 22 })} onSubmit={send}>
                <label className="field">{b.fields.business}<input className="input" name="_name" type="text" autoComplete="organization" required /></label>
                <label className="field">{b.fields.type}
                  <select className="input" name="ประเภทธุรกิจ">
                    {types.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <label className="field">{b.fields.contactName}<input className="input" name="ผู้ติดต่อ" type="text" autoComplete="name" required /></label>
                <label className="field">{b.fields.phone}<input className="input" name="เบอร์โทร" type="tel" autoComplete="tel" required /></label>
                <label className="field">{b.fields.line}<input className="input" name="LINE ID" type="text" /></label>
                <label className="field">{b.fields.email}<input className="input" name="อีเมล" type="email" autoComplete="email" /></label>
                <fieldset className="plain span-all">
                  <legend style={{ fontSize: 14, fontWeight: 500 }}>{b.fields.interest}</legend>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {interests.map((o, i) => (
                      <label key={o.value} className="check-pill"><input type="checkbox" name="interest" value={o.value} defaultChecked={i === 0} />{o.label}</label>
                    ))}
                  </div>
                </fieldset>
                <label className="field span-all">{b.fields.details}<textarea className="input" name="รายละเอียด" rows={4} placeholder={b.fields.detailsPlaceholder} /></label>
                <p className="small span-all">{t.common.formConsent} <Link href="/privacy" target="_blank">{t.common.privacyLink}</Link></p>
                    {error && <p role="alert" className="small span-all" style={{ color: '#8e1f0b' }}>{error}</p>}
                <button type="submit" className="btn btn--primary btn--lg span-all" disabled={sending}>{sending ? t.common.sending : b.submit}</button>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
