import type { Metadata } from 'next';
import { PRIVACY } from '../../../content/privacy';
import type { Locale } from '../../../i18n/config';
import { pageMeta } from '../../../lib/seo';
import { PrivacyPage } from '../../../views/PrivacyPage';

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, '/privacy', { title: PRIVACY[lang].title });
}

export default function Page() {
  return <PrivacyPage />;
}
