import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '../../../../i18n/config';
import { localizeProduct } from '../../../../lib/productText';
import { pageMeta } from '../../../../lib/seo';
import { getProduct, isSellable, listProducts } from '../../../../server/products';
import { ProductPage } from '../../../../views/ProductPage';

type Props = { params: Promise<{ lang: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = (await listProducts()).filter(isSellable).map((p) => p.slug);
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

/** New products added in the admin render on first visit. */
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const raw = await getProduct(slug);
  if (!isSellable(raw)) return {};
  const p = localizeProduct(raw, lang);
  const cover = p.detail.gallery?.[0]?.src || p.img;
  const description = `${p.th} · ${p.priceLabel}`;
  return pageMeta(lang, `/products/${slug}`, {
    title: p.name,
    description,
    openGraph: { title: p.name, description, images: cover && !cover.startsWith('data:') ? [{ url: cover }] : undefined },
  });
}

export default async function Page({ params }: Props) {
  const { lang, slug } = await params;
  const raw = await getProduct(slug);
  if (!isSellable(raw)) notFound();
  const all = await listProducts();
  const related = (raw.detail.related ?? []).map((s) => all.find((x) => x.slug === s)).filter(isSellable);
  return <ProductPage product={localizeProduct(raw, lang)} related={related.map((r) => localizeProduct(r, lang))} />;
}
