import type { Metadata } from 'next';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { pageMeta } from '../../../lib/seo';
import { CustomPage } from '../../../views/CustomPage';

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang).meta;
  return pageMeta(lang, '/custom', { title: t.custom, description: t.customDescription });
}

export default function Page() {
  return <CustomPage />;
}
