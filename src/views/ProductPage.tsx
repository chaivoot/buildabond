'use client';

import Image from 'next/image';
import { SIZES } from '../data/sizes';
import { useState } from 'react';
import Link from 'next/link';
import { ColorPicker } from '../components/ColorPicker';
import { CheckIcon, ClockIcon, TruckIcon } from '../components/Icons';
import { MiniProductCard } from '../components/ProductTile';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { img } from '../data/images';
import { categoryLabel, type Product } from '../data/products';
import { useShopSettings } from '../context/SettingsContext';
import { firstAvailable, isColorSoldOut, priceLine } from '../lib/pricing';
import { tiersSummary } from '../lib/shipping';
import { css } from '../data/style';
import { useI18n } from '../i18n/LocaleProvider';
import { stockKind } from '../lib/cartItem';
import { fillProductTokens } from '../lib/productTokens';
import { youTubeEmbed, youTubeId, youTubeThumb } from '../lib/video';
import './ProductPage.css';

/** The route (`app/products/[slug]/page.tsx`) only renders this for sellable products. */
export function ProductPage({ product: p, related }: { product: Product; related: Product[] }) {
  const d = p.detail;
  const { t, lang } = useI18n();
  const pt = t.product;
  const settings = useShopSettings();
  const { add, openDrawer } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Start on the first option that isn't sold out.
  const [color, setColor] = useState(() => firstAvailable(p.colors, (c) => isColorSoldOut(p, c)));
  const [size, setSize] = useState(() => firstAvailable(d.sizes ?? [], (s) => !!s.soldOut));
  // A colour with its own photo takes over the main frame until a thumbnail is picked.
  const [colorShown, setColorShown] = useState(false);
  const [withMagnets, setWithMagnets] = useState(false);
  const inStock = p.stock === 'ready';
  const hasColors = p.colors.length > 0;

  const photos = d.gallery?.length ? d.gallery : p.img ? [{ src: p.img, alt: p.name }] : [];
  // Videos follow the photos in the same gallery; the player loads only when one is played.
  const videoIds = (d.videos ?? []).map(youTubeId).filter((id): id is string => !!id);
  const gallery = [
    ...photos.map((g) => ({ ...g, video: undefined as string | undefined })),
    ...videoIds.map((id, i) => ({ src: youTubeThumb(id), alt: pt.videoLabel(i + 1), video: id })),
  ];
  const current = gallery[imgIdx];
  const pick = (i: number) => { setImgIdx(i); setColorShown(false); setPlaying(!!gallery[i]?.video); };
  const offersMagnets = p.magnets && p.magnetCount > 0;
  const magnets = offersMagnets && withMagnets ? p.magnetCount : 0;
  const sizes = d.sizes ?? [];
  const sizeName = (i: number) => (lang === 'en' && sizes[i]?.labelEn) || sizes[i]?.label || '';
  const colorKey = (i: number) => (p.colors[i] ? p.colors[i].labelTh ?? p.colors[i].label : '');
  const colorImg = hasColors ? d.colorImages?.[colorKey(color)] : undefined;
  const showColor = colorShown && !!colorImg;
  const chooseColor = (i: number) => { setColor(i); setColorShown(!!d.colorImages?.[colorKey(i)]); setPlaying(false); };
  const line = { slug: p.slug, qty: 1, color, magnets, ...(sizes.length ? { size } : {}) };
  const priced = priceLine(line, p, settings);
  const total = priced?.unitPrice ?? p.price;
  const colorName = hasColors ? p.colors[color].name : '';
  const leadText = inStock ? pt.leadReady : pt.leadPreorder;
  const fill = (text: string) => fillProductTokens(text, { kg: p.kg, magnets: p.magnetCount, magnetPrice: settings.magnetPrice });
  const tiers = tiersSummary(settings.shipping, t.shippingTiers);
  const faq = [...(d.faq ?? []), ...pt.sharedFaq(tiers)];

  const addToCart = () => {
    if (!priced) return;
    const c = hasColors ? p.colors[color] : undefined;
    add({
      ...line,
      magnets,
      colorTh: c ? c.labelTh ?? c.label : undefined,
      ...(sizes.length ? { sizeTh: sizes[size].label, sizeEn: sizes[size].labelEn || undefined } : {}),
      name: p.name,
      kind: stockKind(p),
      unitPrice: priced.unitPrice,
      kg: priced.kg,
      img: colorImg || p.img,
    });
    openDrawer();
  };

  return (
    <>
      <SiteHeader />
      <div className="buy-bar">
        <div className="container buy-bar__inner">
          <div className="buy-bar__text">
            <span className="buy-bar__name">{p.name}{sizes.length ? ` · ${sizeName(size)}` : ''}{colorName ? ` · ${colorName}` : ''}</span>
            <span className="small">{baht(total)}{magnets ? ` · ${pt.magnetsShort(magnets)}` : ''}</span>
          </div>
          <button type="button" className="btn btn--primary btn--sm" style={{ fontSize: 15, padding: '0 20px' }} disabled={!priced} onClick={addToCart}>{priced ? pt.addToCart : pt.soldOut}</button>
        </div>
      </div>

      <main>
        <nav aria-label="breadcrumb" className="container" style={{ paddingTop: 14, fontSize: 13, color: 'var(--ink-3)' }}>
          <Link href="/shop" style={{ color: 'var(--ink-2)' }}>{pt.breadcrumbAll}</Link> /{' '}
          <Link href={`/shop?cat=${p.cat}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{categoryLabel(p.cat)}</Link>
        </nav>

        <section className="container split" style={{ paddingTop: 12, gap: '28px 48px' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div className="pdp-main-img" data-video={!showColor && !!current?.video}>
              {showColor ? (
                <Image priority fill sizes={SIZES.half} src={colorImg ?? ''} alt={`${p.name} · ${colorName}`} />
              ) : current?.video && playing ? (
                <iframe
                  src={youTubeEmbed(current.video)}
                  title={current.alt}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : current?.video ? (
                <button type="button" className="pdp-play" aria-label={pt.playVideo} onClick={() => setPlaying(true)}>
                  <Image fill sizes={SIZES.half} src={current.src} alt="" />
                  <PlayIcon />
                </button>
              ) : (
                current && <Image priority fill sizes={SIZES.half} src={current.src} alt={current.alt} />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="pdp-thumbs">
                {gallery.map((g, i) => (
                  <button key={i} type="button" aria-label={g.video ? g.alt : pt.viewImage(i + 1)} aria-pressed={!showColor && i === imgIdx} onClick={() => pick(i)}>
                    <Image src={g.src} alt="" fill sizes="140px" />
                    {g.video && <PlayIcon small />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="stack" style={css({ flex: '1 1 360px', '--gap': '22px' })}>
            <div>
              {inStock ? (
                <span className="tag tag--green tag--md"><CheckIcon size={14} strokeWidth={2.2} />{pt.inStock}</span>
              ) : (
                <span className="tag tag--orange tag--md"><ClockIcon />{pt.preorder}</span>
              )}
              <h1 className="pdp-title">{p.name}</h1>
              <p className="muted" style={{ marginTop: 6, fontSize: 16 }}>{d.subtitle || p.th}</p>
              <p className="num-display" style={{ marginTop: 14, fontSize: 28 }}>{baht(total)}</p>
              <p className="small" style={{ marginTop: 6, fontSize: 14 }}>{leadText}</p>
            </div>

            {sizes.length > 0 && (
              <fieldset className="plain">
                <legend>{pt.sizeLegend}<span style={{ fontWeight: 400, color: 'var(--ink-2)' }}> · {sizeName(size)}</span></legend>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sizes.map((s, i) => (
                    <button key={i} type="button" className="option pdp-size" aria-pressed={i === size} disabled={!!s.soldOut} onClick={() => setSize(i)}>
                      <span>{sizeName(i)}</span>
                      <span className="small">{s.soldOut ? pt.soldOut : baht(s.price)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {hasColors && <ColorPicker legend={p.colorsLabel || pt.colorFallback} colors={p.colors} value={color} onChange={chooseColor} isSoldOut={(c) => isColorSoldOut(p, c)} soldOutLabel={pt.soldOut} />}

            {offersMagnets && (
              <label className="magnet-option" data-on={withMagnets}>
                <input type="checkbox" checked={withMagnets} onChange={(e) => setWithMagnets(e.target.checked)} />
                <span className="magnet-option__text">
                  <span className="strong">{pt.magnetsTitle(p.magnetCount)}</span>
                  <span className="small">{p.slug.includes('board') ? pt.magnetsHintBoard : pt.magnetsHintBase}</span>
                </span>
                <span className="magnet-option__price">+{baht(p.magnetCount * settings.magnetPrice)}</span>
              </label>
            )}

            <div className="stack">
              <button type="button" className="btn btn--primary btn--lg btn--block" disabled={!priced} onClick={addToCart}>{priced ? `${pt.addToCart} · ${baht(total)}` : pt.soldOut}</button>
              <p className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <TruckIcon style={{ flex: 'none', marginTop: 1 }} />
                {pt.shippingNote(tiers)}
              </p>
            </div>
          </div>
        </section>

        {d.story && (
          <section className="container section--lg" style={{ textAlign: 'center' }}>
            <h2 className="display" style={{ margin: '0 auto', maxWidth: 760, fontSize: 'clamp(34px, 7vw, 64px)', lineHeight: 1.12, letterSpacing: 0 }}>{d.story.title}</h2>
            <p className="lead" style={{ margin: '18px auto 0', maxWidth: 560 }}>{d.story.body}</p>
            <div className="pdp-story-img">
              <Image fill sizes={SIZES.full} src={d.story.img} alt={d.story.alt} />
            </div>
          </section>
        )}

        {!hasColors || p.cat !== 'sb' ? null : (
          <section className="container section--lg split split--center" style={{ gap: '28px 48px' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 10 }}>{pt.materialEyebrow}</p>
              <h2 className="title">{pt.materialTitle}</h2>
              <p className="lead" style={{ marginTop: 16, fontSize: 16 }}>{pt.materialBody}</p>
            </div>
            <Image sizes={SIZES.half} src={img.epdmCloseup} alt={pt.materialAlt} className="photo" style={{ aspectRatio: '4 / 3' }} />
          </section>
        )}

        {p.magnets && (
          <section className="container section--lg split split--center" style={{ gap: '28px 48px', flexWrap: 'wrap-reverse' }}>
            <Image sizes={SIZES.half} src={img.magnets} alt={pt.setAlt} className="photo" style={{ aspectRatio: '1' }} />
            <div>
              <p className="eyebrow" style={{ marginBottom: 10 }}>{pt.setEyebrow}</p>
              <h2 className="title">{pt.setTitle}</h2>
              <ol className="pdp-steps">
                {pt.setSteps.map((step, i) => <li key={step}><span>{i + 1}</span>{step}</li>)}
              </ol>
            </div>
          </section>
        )}

        {d.moves && d.moves.length > 0 && (
          <section className="container section--lg">
            <h2 className="title">{pt.movesTitle}</h2>
            <div className="auto-grid" style={css({ '--min': '240px', '--gap': '12px', marginTop: 24 })}>
              {d.moves.map((m) => (
                <div key={m.title} className="outline-card outline-card--sm">
                  <span className={`tag ${m.tone}`} style={{ padding: '3px 10px' }}>{m.tag}</span>
                  <h3 className="num-display" style={{ marginTop: 6, fontWeight: 500, fontSize: 19 }}>{m.title}</h3>
                  <p className="body" style={{ fontSize: 14, lineHeight: 1.65 }}>{m.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {d.specs && d.specs.length > 0 && (
          <section className="container section--lg">
            <h2 className="title">{pt.specsTitle}</h2>
            <dl className="pdp-specs">
              {d.specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{fill(v)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {related.length > 0 && (
          <section className="section--lg" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 className="title" style={{ padding: '0 16px' }}>{pt.relatedTitle}</h2>
            <div className="pdp-related">
              {related.map((r) => <MiniProductCard key={r.slug} p={r} />)}
            </div>
          </section>
        )}

        <section id="faq" className="container section--lg" style={{ paddingBottom: 96 }}>
          <h2 className="title">{pt.faqTitle}</h2>
          <div className="faq" style={{ marginTop: 20 }}>
            {faq.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{fill(f.q)}</summary>
                <p>{fill(f.a)}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function PlayIcon({ small }: { small?: boolean }) {
  const size = small ? 28 : 64;
  return (
    <svg className="pdp-play__icon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.6)" />
      <path d="M26 20 L46 32 L26 44 Z" fill="#fff" />
    </svg>
  );
}
