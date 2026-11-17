import { notFound } from 'next/navigation';
import { getCustomerHistory } from '../../../../../server/customers';
import { listOrdersByCustomer } from '../../../../../server/orders';
import { CustomerDetail } from '../../../../../views/admin/CustomerDetail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [history, orders] = await Promise.all([getCustomerHistory(id), listOrdersByCustomer(id)]);
  if (!history) notFound();
  return <CustomerDetail customer={history.customer} events={history.events} orders={orders} />;
}
