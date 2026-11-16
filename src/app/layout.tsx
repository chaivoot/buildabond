import type { Metadata, Viewport } from 'next';
import { Anuphan, IBM_Plex_Sans_Thai } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from '../components/Providers';
import { img } from '../data/images';
import { SITE } from '../data/site';
import '../styles/global.css';

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-anuphan',
  display: 'swap',
});

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'th_TH',
    images: [{ url: img.heroSet.src, width: img.heroSet.width, height: img.heroSet.height }],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={`${anuphan.variable} ${plexThai.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
