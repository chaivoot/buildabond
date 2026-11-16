import { listOrders } from '../../../server/orders';
import { OrdersAdmin } from '../../../views/admin/OrdersAdmin';

export default async function Page() {
  return <OrdersAdmin orders={await listOrders()} />;
}
