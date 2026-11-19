import { listCustomers } from '../../../../../server/customers';
import { listProducts } from '../../../../../server/products';
import { getSettings } from '../../../../../server/settings';
import { NewOrderAdmin } from '../../../../../views/admin/NewOrderAdmin';

export default async function Page() {
  const [products, customers, settings] = await Promise.all([listProducts(), listCustomers(), getSettings()]);
  return (
    <NewOrderAdmin
      products={products.filter((p) => !p.custom)}
      customers={customers.map(({ id, name, phone, email, street, subdistrict, district, province, postcode }) => ({ id, name, phone, email, street, subdistrict, district, province, postcode }))}
      settings={settings}
    />
  );
}
