import { listCustomers } from '../../../../server/customers';
import { CustomersAdmin } from '../../../../views/admin/CustomersAdmin';

export default async function Page() {
  return <CustomersAdmin customers={await listCustomers()} />;
}
