import type { Metadata } from 'next';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { pageMeta } from '../../../lib/seo';
import type { TrackedOrder } from '../../../server/actions/shop';
import { getOrderWithKey } from '../../../server/orders';
import { TrackPage } from '../../../views/TrackPage';

type Props = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ order?: string; k?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return pageMeta(lang, '/track', { title: getDict(lang).meta.track, robots: { index: false } });
}

/**
 * /track?order=BB-…&k=… (the link in order emails) shows that order's status straight away; the private key
 * stands in for the phone/email, so no personal details go in the link.
 */
export default async function Page({ searchParams }: Props) {
  const { order, k } = await searchParams;
  let initialResult: TrackedOrder | undefined;
  if (order && k) {
    const o = await getOrderWithKey(order.trim().toUpperCase().slice(0, 40), k.slice(0, 64)).catch(() => null);
    if (o) {
      const { id, createdAt, items, total, status, slipAt, confirmedAt, shippedAt, carrier, tracking } = o;
      initialResult = { id, createdAt, items, total, status, slipAt, confirmedAt, shippedAt, carrier, tracking };
    }
  }
  return <TrackPage initialId={order ?? ''} initialPhone="" initialResult={initialResult} />;
}
