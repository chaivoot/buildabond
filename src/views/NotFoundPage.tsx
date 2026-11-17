'use client';

import Link from 'next/link';
import { SiteHeader } from '../components/SiteHeader';
import { useI18n } from '../i18n/LocaleProvider';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <h1 className="display">{t.notFound.title}</h1>
        <p className="lead" style={{ marginTop: 12 }}>{t.notFound.body}</p>
        <Link href="/shop" className="btn btn--primary" style={{ marginTop: 24 }}>{t.notFound.cta}</Link>
      </main>
    </>
  );
}
