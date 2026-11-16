import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, isSellable, listProducts } from '../../../server/products';
import { ProductPage } from '../../../views/ProductPage';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await listProducts()).filter(isSellable).map((p) => ({ slug: p.slug }));
}

/** New products added in the admin render on first visit. */
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!isSellable(p)) return {};
  const cover = p.detail.gallery?.[0]?.src || p.img;
  const description = `${p.th} · ${p.priceLabel}`;
  return {
    title: p.name,
    description,
    openGraph: { title: p.name, description, images: cover && !cover.startsWith('data:') ? [{ url: cover }] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!isSellable(p)) notFound();
  const all = await listProducts();
  const related = (p.detail.related ?? []).map((s) => all.find((x) => x.slug === s)).filter(isSellable);
  return <ProductPage product={p} related={related} />;
}
