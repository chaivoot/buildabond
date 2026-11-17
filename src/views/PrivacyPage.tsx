'use client';

import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { PRIVACY } from '../content/privacy';
import { SOCIAL } from '../data/social';
import { useI18n } from '../i18n/LocaleProvider';

export function PrivacyPage() {
  const { lang } = useI18n();
  const doc = PRIVACY[lang];
  return (
    <>
      <SiteHeader />
      <main className="container container--narrow" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <h1 className="display" style={{ fontSize: 'clamp(34px, 7vw, 52px)', letterSpacing: 0 }}>{doc.title}</h1>
        <p className="small" style={{ marginTop: 10 }}>{doc.updated}</p>
        <p className="lead" style={{ marginTop: 18, fontSize: 16 }}>{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} style={{ marginTop: 32 }}>
            <h2 className="num-display" style={{ fontWeight: 500, fontSize: 20 }}>{s.h}</h2>
            {s.list && (
              <ul className="body" style={{ margin: '10px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {s.list.map((x) => <li key={x}>{x}</li>)}
              </ul>
            )}
            {s.p?.map((x) => <p key={x} className="body" style={{ marginTop: 10 }}>{x}</p>)}
          </section>
        ))}
        <section style={{ marginTop: 32 }}>
          <p className="body">
            {doc.contactLead}{' '}
            <a href={SOCIAL.line} target="_blank" rel="noopener noreferrer">LINE</a>,{' '}
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>,{' '}
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
