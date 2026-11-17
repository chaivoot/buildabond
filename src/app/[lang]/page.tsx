import type { Metadata } from 'next';
import type { Locale } from '../../i18n/config';
import { pageMeta } from '../../lib/seo';
import { HomePage } from '../../views/HomePage';

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMeta((await params).lang, '/');
}

export default function Page() {
  return <HomePage />;
}
