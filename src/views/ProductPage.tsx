'use client';

import Image from 'next/image';
import { SIZES } from '../data/sizes';
import { useState } from 'react';
import Link from 'next/link';
import { ColorPicker } from '../components/ColorPicker';
import { CheckIcon, ClockIcon, TruckIcon } from '../components/Icons';
import { MiniProductCard } from '../components/ProductTile';
import { QtyStepper } from '../components/QtyStepper';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { img } from '../data/images';
import { categoryLabel, type Product } from '../data/products';
import { useShopSettings } from '../context/SettingsContext';
import { priceLine } from '../lib/pricing';
import { tiersSummary } from '../lib/shipping';
import { css } from '../data/style';
import './ProductPage.css';

const SHARED_FAQ = (shipping: string) => [
  {
    q: 'จัดส่งกี่วัน ค่าส่งเท่าไร',
    a: `สินค้าพร้อมส่งประกอบเสร็จแล้ว ใช้เวลาทำผิวยางสีที่เลือก 3-5 วัน สินค้าพรีออเดอร์ใช้เวลาผลิต 28-35 วัน จัดส่งผ่านไปรษณีย์ไทยหรือนิ่มเอ็กซ์เพรส และแจ้งเลขพัสดุภายใน 1 วันหลังส่ง ค่าส่งคิดตามน้ำหนักรวม ${shipping}`,
  },
  {
    q: 'ถ้าสินค้าเสียหายระหว่างขนส่ง',
    a: 'ถ่ายรูปความเสียหายแล้วแจ้งเราภายใน 24 ชั่วโมงหลังได้รับ เราจะลดราคาให้หากเสียหายเล็กน้อยและยังใช้งานได้ หรือเปลี่ยนชิ้นใหม่หากใช้งานไม่ได้',
  },
];

/** The route (`app/products/[slug]/page.tsx`) only renders this for sellable products. */
export function ProductPage({ product: p, related }: { product: Product; related: Product[] }) {
  const d = p.detail;
  const settings = useShopSettings();
  const { add, openDrawer } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [color, setColor] = useState(0);
  const [magnets, setMagnets] = useState(0);
  const inStock = p.stock === 'ready';
  const hasColors = p.colors.length > 0;

  const gallery = d.gallery?.length ? d.gallery : p.img ? [{ src: p.img, alt: p.name }] : [];
  const line = { slug: p.slug, qty: 1, color, magnets };
  const priced = priceLine(line, p, settings);
  const total = priced?.unitPrice ?? p.price;
  const colorName = hasColors ? p.colors[color].name : '';
  const leadText = inStock ? 'สินค้าประกอบแล้ว ทำผิวยางสีที่เลือก 3-5 วันก่อนจัดส่ง' : 'ผลิตตามสั่ง ใช้เวลาประมาณ 28-35 วัน';
  const faq = [...(d.faq ?? []), ...SHARED_FAQ(tiersSummary(settings.shipping))];

  const addToCart = () => {
    if (!priced) return;
    add({ ...line, name: priced.name, opt: priced.opt, status: priced.status, unitPrice: priced.unitPrice, kg: priced.kg, img: p.img });
    openDrawer();
  };

  return (
    <>
      <SiteHeader sticky={false} />
      <div className="buy-bar">
        <div className="container buy-bar__inner">
          <div className="buy-bar__text">
            <span className="buy-bar__name">{p.name}{colorName ? ` · ${colorName}` : ''}</span>
            <span className="small">{baht(total)}{magnets ? ` · แม่เหล็ก ${magnets} ชิ้น` : ''}</span>
          </div>
          <button type="button" className="btn btn--primary btn--sm" style={{ fontSize: 15, padding: '0 20px' }} onClick={addToCart}>ใส่ตะกร้า</button>
        </div>
      </div>

      <main>
        <nav aria-label="breadcrumb" className="container" style={{ paddingTop: 14, fontSize: 13, color: 'var(--ink-3)' }}>
          <Link href="/shop" style={{ color: 'var(--ink-2)' }}>สินค้าทั้งหมด</Link> /{' '}
          <Link href={`/shop?cat=${p.cat}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{categoryLabel(p.cat)}</Link>
        </nav>

        <section className="container split" style={{ paddingTop: 12, gap: '28px 48px' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div className="pdp-main-img">
              {gallery[imgIdx] && <Image priority fill sizes={SIZES.half} src={gallery[imgIdx].src} alt={gallery[imgIdx].alt} />}
            </div>
            {gallery.length > 1 && (
              <div className="pdp-thumbs">
                {gallery.map((g, i) => (
                  <button key={i} type="button" aria-label={`ดูรูปที่ ${i + 1}`} aria-pressed={i === imgIdx} onClick={() => setImgIdx(i)}>
                    <Image src={g.src} alt="" fill sizes="140px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="stack" style={css({ flex: '1 1 360px', '--gap': '22px' })}>
            <div>
              {inStock ? (
                <span className="tag tag--green tag--md"><CheckIcon size={14} strokeWidth={2.2} />พร้อมส่ง</span>
              ) : (
                <span className="tag tag--orange tag--md"><ClockIcon />พรีออเดอร์</span>
              )}
              <h1 className="pdp-title">{p.name}</h1>
              <p className="muted" style={{ marginTop: 6, fontSize: 16 }}>{d.subtitle || p.th}</p>
              <p className="num-display" style={{ marginTop: 14, fontSize: 28 }}>{baht(total)}</p>
              <p className="small" style={{ marginTop: 6, fontSize: 14 }}>{leadText}</p>
            </div>

            {hasColors && <ColorPicker legend={p.colorsLabel || 'สี'} colors={p.colors} value={color} onChange={setColor} />}

            {p.magnets && (
              <div className="row-between">
                <div>
                  <p className="strong" style={{ fontSize: 15 }}>แม่เหล็กใต้แผ่น</p>
                  <p className="small" style={{ marginTop: 2 }}>ชิ้นละ {baht(settings.magnetPrice)} ยึดกับ Target Box และ Slant Box</p>
                </div>
                <QtyStepper value={magnets} onChange={setMagnets} min={0} max={settings.maxMagnets} decLabel="ลดแม่เหล็ก" incLabel="เพิ่มแม่เหล็ก" />
              </div>
            )}

            <div className="stack">
              <button type="button" className="btn btn--primary btn--lg btn--block" onClick={addToCart}>ใส่ตะกร้า · {baht(total)}</button>
              <p className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <TruckIcon style={{ flex: 'none', marginTop: 1 }} />
                ค่าส่งคิดตามน้ำหนักรวมของออร์เดอร์ {tiersSummary(settings.shipping)}
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
              <p className="eyebrow" style={{ marginBottom: 10 }}>วัสดุ</p>
              <h2 className="title">ยางเกรดสนามเด็กเล่น บนไม้ยางพาราส่งออก</h2>
              <p className="lead" style={{ marginTop: 16, fontSize: 16 }}>ผิว EPDM มีลายช่วยยึดเกาะ รับแรงกระแทกได้ถึง 200 กก. โครงสร้างออกแบบโดยสถาปนิก</p>
            </div>
            <Image sizes={SIZES.half} src={img.epdmCloseup} alt="ผิวยาง EPDM ระยะใกล้" className="photo" style={{ aspectRatio: '4 / 3' }} />
          </section>
        )}

        {p.magnets && (
          <section className="container section--lg split split--center" style={{ gap: '28px 48px', flexWrap: 'wrap-reverse' }}>
            <Image sizes={SIZES.half} src={img.magnets} alt="แม่เหล็กฝังใต้แผ่นกระดานและบนกล่อง" className="photo" style={{ aspectRatio: '1' }} />
            <div>
              <p className="eyebrow" style={{ marginBottom: 10 }}>ต่อเป็นชุด</p>
              <h2 className="title">เพิ่มแม่เหล็ก แล้วต่อเป็นสะพานหรือทางลาด</h2>
              <ol className="pdp-steps">
                <li><span>1</span>วาง Target Box หรือ Slant Box เป็นฐาน</li>
                <li><span>2</span>วาง Place Board ที่ติดแม่เหล็กพาดลงไป</li>
                <li><span>3</span>แม่เหล็กยึดแน่น พร้อมเล่นได้ทันที</li>
              </ol>
            </div>
          </section>
        )}

        {d.moves && d.moves.length > 0 && (
          <section className="container section--lg">
            <h2 className="title">ท่าฝึกที่ใช้กับชิ้นนี้</h2>
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
            <h2 className="title">สเปก</h2>
            <dl className="pdp-specs">
              {d.specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {related.length > 0 && (
          <section className="section--lg" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 className="title" style={{ padding: '0 16px' }}>ใช้ร่วมกันได้</h2>
            <div className="pdp-related">
              {related.map((r) => <MiniProductCard key={r.slug} p={r} />)}
            </div>
          </section>
        )}

        <section id="faq" className="container section--lg" style={{ paddingBottom: 96 }}>
          <h2 className="title">คำถามที่พบบ่อย</h2>
          <div className="faq" style={{ marginTop: 20 }}>
            {faq.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
