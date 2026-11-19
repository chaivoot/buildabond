import { listDiscounts } from '../../../server/discounts';
import { listOrders } from '../../../server/orders';
import { OrdersAdmin } from '../../../views/admin/OrdersAdmin';

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const [orders, codes] = await Promise.all([listOrders(), listDiscounts()]);
  return <OrdersAdmin orders={orders} initialOrder={order} codes={codes.map((c) => ({ code: c.code, affiliate: c.affiliate }))} />;
}
