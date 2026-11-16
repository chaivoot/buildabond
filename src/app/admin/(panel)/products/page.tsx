import { listProducts } from '../../../../server/products';
import { ProductsAdmin } from '../../../../views/admin/ProductsAdmin';

export default async function Page() {
  return <ProductsAdmin products={await listProducts({ includeHidden: true })} />;
}
