import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Providers } from '../../components/Providers';
import { img } from '../../data/images';
import { SITE } from '../../data/site';
import { isLocale, LOCALES } from '../../i18n/config';
import { getDict } from '../../i18n';
import { getSettings } from '../../server/settings';
import { fontVariables } from '../fonts';
import '../../styles/global.css';

type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name} · ${SITE.tagline}`, template: `%s · ${SITE.name}` },
    description: getDict(lang).meta.siteDescription,
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: lang === 'th' ? 'th_TH' : 'en_US',
      images: [{ url: img.heroSet.src, width: img.heroSet.width, height: img.heroSet.height }],
    },
  };
}

export const viewport: Viewport = { themeColor: '#ffffff' };

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const settings = await getSettings();
  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <Providers lang={lang} settings={settings}>{children}</Providers>
      </body>
    </html>
  );
}
