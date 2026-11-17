import type { Metadata } from 'next';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { pageMeta } from '../../../lib/seo';
import { BusinessPage } from '../../../views/BusinessPage';

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang).meta;
  return pageMeta(lang, '/business', { title: t.business, description: t.businessDescription });
}

export default function Page() {
  return <BusinessPage />;
}
