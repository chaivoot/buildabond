import { listCodeOrders, listDiscounts } from '../../../../server/discounts';
import { DiscountsAdmin } from '../../../../views/admin/DiscountsAdmin';

export default async function Page() {
  const [codes, orders] = await Promise.all([listDiscounts(), listCodeOrders()]);
  return <DiscountsAdmin codes={codes} orders={orders} />;
}
