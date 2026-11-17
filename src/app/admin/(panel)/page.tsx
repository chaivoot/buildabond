import { listOrders } from '../../../server/orders';
import { OrdersAdmin } from '../../../views/admin/OrdersAdmin';

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <OrdersAdmin orders={await listOrders()} initialOrder={order} />;
}
