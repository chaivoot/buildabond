import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCT_DETAILS } from '../../../data/productDetails';
import { findProduct, PRODUCTS } from '../../../data/products';
import { ProductPage } from '../../../views/ProductPage';

type Props = { params: Promise<{ slug: string }> };

const sellable = (slug: string) => {
  const p = findProduct(slug);
  return p && !p.comingSoon && !p.custom ? p : undefined;
};

export function generateStaticParams() {
  return PRODUCTS.filter((p) => sellable(p.slug)).map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = sellable(slug);
  if (!p) return {};
  const cover = PRODUCT_DETAILS[slug]?.gallery[0].src ?? p.img!;
  const description = `${p.th} · ${p.priceLabel}`;
  return {
    title: p.name,
    description,
    openGraph: { title: p.name, description, images: [{ url: cover.src, width: cover.width, height: cover.height }] },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!sellable(slug)) notFound();
  return <ProductPage slug={slug} />;
}
