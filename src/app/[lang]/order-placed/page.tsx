import type { Metadata } from 'next';
import QRCode from 'qrcode';
import type { Locale } from '../../../i18n/config';
import { getDict } from '../../../i18n';
import { promptPayPayload } from '../../../lib/promptpay';
import { getOrderWithKey } from '../../../server/orders';
import { getSettings } from '../../../server/settings';
import { OrderPlacedPage } from '../../../views/OrderPlacedPage';

type Props = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ id?: string; k?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict((await params).lang).meta.order, robots: { index: false } };
}

export default async function Page({ searchParams }: Props) {
  const { id = '', k = '' } = await searchParams;
  const [order, settings] = await Promise.all([id && k ? getOrderWithKey(id, k) : null, getSettings()]);
  const payload = order && settings.promptpay ? promptPayPayload(settings.promptpay, order.total) : null;
  const qrSvg = payload ? await QRCode.toString(payload, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }) : null;
  return <OrderPlacedPage order={order} accessKey={k} bank={settings.bank} qrSvg={qrSvg} />;
}
