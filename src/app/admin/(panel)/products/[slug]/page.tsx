import { notFound } from 'next/navigation';
import type { Product } from '../../../../../lib/types';
import { getProduct, listProducts } from '../../../../../server/products';
import { ProductEditor } from '../../../../../views/admin/ProductEditor';

const blank = (sort: number): Product => ({
  slug: '', sort, cat: 'sb', name: '', th: '', priceLabel: '', price: 0, kg: 0, img: '', cover: false, badge: '', comingSoon: false,
  custom: false, colors: [], colorsLabel: '', swatchesLabel: '', magnets: false, sku: '', stock: 'ready', visible: false, detail: {}, en: {},
});

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await listProducts({ includeHidden: true });
  if (slug === 'new') {
    const maxSort = Math.max(0, ...all.map((p) => p.sort));
    return <ProductEditor product={blank(maxSort + 10)} isNew allProducts={all} />;
  }
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductEditor product={product} isNew={false} allProducts={all} />;
}
