import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ColorPicker } from '../components/ColorPicker';
import { CheckIcon, ClockIcon, TruckIcon } from '../components/Icons';
import { MiniProductCard } from '../components/ProductTile';
import { QtyStepper } from '../components/QtyStepper';
import { SiteHeader } from '../components/SiteHeader';
import { useCart } from '../context/CartContext';
import { baht } from '../data/format';
import { img } from '../data/images';
import { PRODUCT_DETAILS, SHARED_FAQ } from '../data/productDetails';
import { categoryLabel, findProduct, MAGNET_PRICE, MAX_MAGNETS } from '../data/products';
import { css } from '../data/style';
import { NotFoundPage } from './NotFoundPage';
import './ProductPage.css';

export function ProductPage() {
  const { slug } = useParams();
  const product = findProduct(slug);
  if (!product || product.comingSoon || product.custom) return <NotFoundPage />;
  return <ProductView key={product.slug} slug={product.slug} />;
}

function ProductView({ slug }: { slug: string }) {
  const p = findProduct(slug)!;
  const d = PRODUCT_DETAILS[slug];
  const { add, openDrawer } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [color, setColor] = useState(0);
  const [magnets, setMagnets] = useState(0);
  // TODO: wire to real stock data; the design supports "พร้อมส่ง" and "พรีออเดอร์".
  const inStock = true;

  const gallery = d?.gallery ?? [{ src: p.img, alt: p.name }];
  const total = p.price + (p.magnets ? MAGNET_PRICE * magnets : 0);
  const colorName = p.colors?.[color].name;
  const leadText = inStock ? 'สินค้าประกอบแล้ว ทำผิวยางสีที่เลือก 3-5 วันก่อนจัดส่ง' : 'ผลิตตามสั่ง ใช้เวลาประมาณ 28-35 วัน';
  const faq = [...(d?.faq ?? []), ...SHARED_FAQ];

  const addToCart = () => {
    const opts = [p.colors ? p.colors[color].label : null, magnets ? `แม่เหล็ก ${magnets} ชิ้น` : null].filter(Boolean);
    add({
      name: p.name,
      opt: opts.join(' · ') || '—',
      status: inStock ? (p.colors === undefined ? 'พร้อมส่ง' : 'พร้อมส่ง · ทำผิวยาง 3-5 วัน') : 'พรีออเดอร์ · 28-35 วัน',
      unitPrice: total,
      kg: p.kg,
      img: p.img,
    });
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
          <Link to="/shop" style={{ color: 'var(--ink-2)' }}>สินค้าทั้งหมด</Link> /{' '}
          <Link to={`/shop?cat=${p.cat}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{categoryLabel(p.cat)}</Link>
        </nav>

        <section className="container split" style={{ paddingTop: 12, gap: '28px 48px' }}>
          <div style={{ flex: '1 1 420px' }}>
            <img src={gallery[imgIdx].src} alt={gallery[imgIdx].alt} className="photo pdp-main-img" />
            {gallery.length > 1 && (
              <div className="pdp-thumbs">
                {gallery.map((g, i) => (
                  <button key={i} type="button" aria-label={`ดูรูปที่ ${i + 1}`} aria-pressed={i === imgIdx} onClick={() => setImgIdx(i)}>
                    <img src={g.src} alt="" />
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
              <p className="muted" style={{ marginTop: 6, fontSize: 16 }}>{d?.subtitle ?? p.th}</p>
              <p className="num-display" style={{ marginTop: 14, fontSize: 28 }}>{baht(total)}</p>
              <p className="small" style={{ marginTop: 6, fontSize: 14 }}>{leadText}</p>
            </div>

            {p.colors && <ColorPicker legend={p.colorsLabel ?? 'สี'} colors={p.colors} value={color} onChange={setColor} />}

            {p.magnets && (
              <div className="row-between">
                <div>
                  <p className="strong" style={{ fontSize: 15 }}>แม่เหล็กใต้แผ่น</p>
                  <p className="small" style={{ marginTop: 2 }}>ชิ้นละ {baht(MAGNET_PRICE)} ยึดกับ Target Box และ Slant Box</p>
                </div>
                <QtyStepper value={magnets} onChange={setMagnets} min={0} max={MAX_MAGNETS} decLabel="ลดแม่เหล็ก" incLabel="เพิ่มแม่เหล็ก" />
              </div>
            )}

            <div className="stack">
              <button type="button" className="btn btn--primary btn--lg btn--block" onClick={addToCart}>ใส่ตะกร้า · {baht(total)}</button>
              <p className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <TruckIcon style={{ flex: 'none', marginTop: 1 }} />
                ค่าส่งคิดตามน้ำหนักรวมของออร์เดอร์ ต่ำกว่า 1 กก. ฿50 · 1-5 กก. ฿100 · 5 กก. ขึ้นไป ฿200
              </p>
            </div>
          </div>
        </section>

        {d?.story && (
          <section className="container section--lg" style={{ textAlign: 'center' }}>
            <h2 className="display" style={{ margin: '0 auto', maxWidth: 760, fontSize: 'clamp(34px, 7vw, 64px)', lineHeight: 1.12, letterSpacing: 0 }}>{d.story.title}</h2>
            <p className="lead" style={{ margin: '18px auto 0', maxWidth: 560 }}>{d.story.body}</p>
            <img src={d.story.img} alt={d.story.alt} className="photo" style={{ marginTop: 36, aspectRatio: '4 / 3', maxHeight: 640, borderRadius: 24 }} />
          </section>
        )}

        {p.colors === undefined || p.cat !== 'sb' ? null : (
          <section className="container section--lg split split--center" style={{ gap: '28px 48px' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 10 }}>วัสดุ</p>
              <h2 className="title">ยางเกรดสนามเด็กเล่น บนไม้ยางพาราส่งออก</h2>
              <p className="lead" style={{ marginTop: 16, fontSize: 16 }}>ผิว EPDM มีลายช่วยยึดเกาะ รับแรงกระแทกได้ถึง 200 กก. โครงสร้างออกแบบโดยสถาปนิก</p>
            </div>
            <img src={img.epdmCloseup} alt="ผิวยาง EPDM ระยะใกล้" className="photo" style={{ aspectRatio: '4 / 3' }} />
          </section>
        )}

        {p.magnets && (
          <section className="container section--lg split split--center" style={{ gap: '28px 48px', flexWrap: 'wrap-reverse' }}>
            <img src={img.magnets} alt="แม่เหล็กฝังใต้แผ่นกระดานและบนกล่อง" className="photo" style={{ aspectRatio: '1' }} />
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

        {d?.moves && (
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

        {d?.specs && (
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

        {d?.related && (
          <section className="section--lg" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 className="title" style={{ padding: '0 16px' }}>ใช้ร่วมกันได้</h2>
            <div className="pdp-related">
              {d.related.map((s) => {
                const r = findProduct(s);
                return r ? <MiniProductCard key={s} p={r} /> : null;
              })}
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
