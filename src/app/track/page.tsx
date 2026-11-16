import type { Metadata } from 'next';
import { trackOrder } from '../../server/actions/shop';
import { TrackPage } from '../../views/TrackPage';

export const metadata: Metadata = {
  title: 'ติดตามออร์เดอร์',
  robots: { index: false },
};

/** Demo order from the seed data, prefilled so the page shows an example. */
const DEMO = { id: 'BB-261116-0042', phone: '081-234-5678' };

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const initial = order ? { id: order, phone: '' } : DEMO;
  const result = initial.phone ? await trackOrder(initial.id, initial.phone) : undefined;
  return <TrackPage initialId={initial.id} initialPhone={initial.phone} initialResult={result ?? undefined} />;
}
