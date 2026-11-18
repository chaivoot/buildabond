import { listDiscounts } from '../../../../server/discounts';
import { DiscountsAdmin } from '../../../../views/admin/DiscountsAdmin';

export default async function Page() {
  return <DiscountsAdmin codes={await listDiscounts()} />;
}
