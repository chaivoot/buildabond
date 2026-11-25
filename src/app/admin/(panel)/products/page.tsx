import { listProducts } from '../../../../server/products';
import { listStock } from '../../../../server/stock';
import { ProductsAdmin } from '../../../../views/admin/ProductsAdmin';

export default async function Page() {
  const [products, stock] = await Promise.all([listProducts({ includeHidden: true }), listStock()]);
  return <ProductsAdmin products={products} stock={stock} />;
}
