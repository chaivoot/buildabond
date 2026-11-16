import type { Metadata } from 'next';
import { TrackPage } from '../../views/TrackPage';

export const metadata: Metadata = {
  title: 'ติดตามออร์เดอร์',
  robots: { index: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <TrackPage initialOrder={order} />;
}
