import type { Metadata } from 'next';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { pageMeta } from '../../../lib/seo';
import { trackOrder } from '../../../server/actions/shop';
import { TrackPage } from '../../../views/TrackPage';

type Props = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ order?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, '/track', { title: getDict(lang).meta.track, robots: { index: false } });
}

/** Demo order from the seed data, prefilled so the page shows an example. */
const DEMO = { id: 'BB-261116-0042', phone: '081-234-5678' };

export default async function Page({ searchParams }: Props) {
  const { order } = await searchParams;
  const initial = order ? { id: order, phone: '' } : DEMO;
  const result = initial.phone ? await trackOrder(initial.id, initial.phone) : undefined;
  return <TrackPage initialId={initial.id} initialPhone={initial.phone} initialResult={result ?? undefined} />;
}
