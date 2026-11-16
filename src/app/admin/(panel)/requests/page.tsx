import { listRequests } from '../../../../server/requests';
import { RequestsAdmin } from '../../../../views/admin/RequestsAdmin';

export default async function Page() {
  return <RequestsAdmin requests={await listRequests()} />;
}
