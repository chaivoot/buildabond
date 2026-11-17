import type { Metadata } from 'next';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { pageMeta } from '../../../lib/seo';
import { TrackPage } from '../../../views/TrackPage';

type Props = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ order?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, '/track', { title: getDict(lang).meta.track, robots: { index: false } });
}

export default async function Page({ searchParams }: Props) {
  const { order } = await searchParams;
  return <TrackPage initialId={order ?? ''} initialPhone="" />;
}
