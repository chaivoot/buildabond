import type { Metadata } from 'next';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { pageMeta } from '../../../lib/seo';
import { CheckoutPage } from '../../../views/CheckoutPage';

type Props = { params: Promise<{ lang: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang).meta;
  return pageMeta(lang, '/checkout', { title: t.checkout, robots: { index: false } });
}

export default function Page() {
  return <CheckoutPage />;
}
