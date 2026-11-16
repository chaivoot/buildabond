import type { Metadata } from 'next';
import QRCode from 'qrcode';
import { promptPayPayload } from '../../lib/promptpay';
import { getOrderWithKey } from '../../server/orders';
import { getSettings } from '../../server/settings';
import { OrderPlacedPage } from '../../views/OrderPlacedPage';

export const metadata: Metadata = {
  title: 'ได้รับคำสั่งซื้อแล้ว',
  robots: { index: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string; k?: string }> }) {
  const { id = '', k = '' } = await searchParams;
  const [order, settings] = await Promise.all([id && k ? getOrderWithKey(id, k) : null, getSettings()]);
  const payload = order && settings.promptpay ? promptPayPayload(settings.promptpay, order.total) : null;
  const qrSvg = payload ? await QRCode.toString(payload, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }) : null;
  return <OrderPlacedPage order={order} accessKey={k} bank={settings.bank} qrSvg={qrSvg} />;
}
