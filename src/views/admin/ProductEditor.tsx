'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { CATEGORIES } from '../../data/products';
import { COLOR_PRESETS } from '../../data/seed';
import type { CategoryId, Product, ProductDetail, ProductSize, ProductText, StockStatus } from '../../lib/types';
import { PRODUCT_TOKENS_HELP } from '../../lib/productTokens';
import { youTubeId, youTubeThumb } from '../../lib/video';
import { removeProduct, saveProduct, uploadProductImage } from '../../server/actions/admin';

interface Props {
  product: Product;
  isNew: boolean;
  allProducts: Product[];
}

const presetOf = (p: Product) => COLOR_PRESETS.find((c) => JSON.stringify(c.colors) === JSON.stringify(p.colors))?.id ?? 'keep';

const specsToText = (specs: ProductDetail['specs']) => (specs ?? []).map(([k, v]) => `${k} | ${v}`).join('\n');
const textToSpecs = (t: string): [string, string][] =>
  t.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [k, ...rest] = l.split('|');
    return [k.trim(), rest.join('|').trim()];
  });

type EditorTab = 'info' | 'price' | 'media' | 'en';
const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: 'info', label: 'ข้อมูลสินค้า' },
  { id: 'price', label: 'ราคาและขนาด' },
  { id: 'media', label: 'รูปและวิดีโอ' },
  { id: 'en', label: 'English' },
];

/** Open the tab that holds the field a save error is about. */
function tabForError(error: string): EditorTab {
  if (/ขนาด|แม่เหล็ก|ราคา/.test(error)) return 'price';
  if (/วิดีโอ|รูป/.test(error)) return 'media';
  return 'info';
}

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`field${wide ? ' span-all' : ''}`}>
      {label}
      {hint && <span className="field__hint">{hint}</span>}
      {children}
    </label>
  );
}

export function ProductEditor({ product, isNew, allProducts }: Props) {
  const router = useRouter();
  const [p, setP] = useState<Product>(product);
  const [specs, setSpecs] = useState(specsToText(product.detail.specs));
  const [specsEn, setSpecsEn] = useState(specsToText(product.en?.specs));
  const [videos, setVideos] = useState((product.detail.videos ?? []).join('\n'));
  const [preset, setPreset] = useState(presetOf(product));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(isNew);
  const [tab, setTab] = useState<EditorTab>('info');
  const touch = () => { setSaved(false); setDirty(true); };
  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => { setP((x) => ({ ...x, [k]: v })); touch(); };
  const setDetail = (d: Partial<ProductDetail>) => { setP((x) => ({ ...x, detail: { ...x.detail, ...d } })); touch(); };
  const setEn = (d: Partial<ProductText>) => { setP((x) => ({ ...x, en: { ...x.en, ...d } })); touch(); };
  const gallery = p.detail.gallery ?? [];
  const sizes = p.detail.sizes ?? [];
  const setSizeAt = (i: number, patch: Partial<ProductSize>) => setDetail({ sizes: sizes.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const moveSize = (i: number, d: -1 | 1) => { const s = [...sizes]; [s[i], s[i + d]] = [s[i + d], s[i]]; setDetail({ sizes: s }); };
  // Colours as they'll be saved: the chosen preset's, or the product's own.
  const shownColors = COLOR_PRESETS.find((c) => c.id === preset)?.colors ?? p.colors;
  const colorImages = p.detail.colorImages ?? {};
  const soldOutColors = p.detail.soldOutColors ?? [];
  const toggleColorStock = (key: string, out: boolean) =>
    setDetail({ soldOutColors: out ? [...soldOutColors.filter((k) => k !== key), key] : soldOutColors.filter((k) => k !== key) });
  const setColorImage = (key: string, url: string | null) => {
    const next = { ...colorImages };
    if (url) next[key] = url; else delete next[key];
    setDetail({ colorImages: next });
  };
  const videoLines = videos.split('\n').map((l) => l.trim()).filter(Boolean);
  const badVideos = videoLines.filter((l) => !youTubeId(l));

  const upload = async (file: File | undefined): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    setError('');
    const f = new FormData();
    f.set('file', file);
    const res = await uploadProductImage(f).catch(() => ({ error: 'อัปโหลดไม่สำเร็จ', url: undefined }));
    setUploading(false);
    if (res.error || !res.url) {
      setError(res.error ?? 'อัปโหลดไม่สำเร็จ');
      return null;
    }
    return res.url;
  };

  const moveImage = (i: number, d: -1 | 1) => {
    const g = [...gallery];
    [g[i], g[i + d]] = [g[i + d], g[i]];
    setDetail({ gallery: g });
  };

  const save = () => {
    setError('');
    if (badVideos.length) { setTab('media'); return setError(`ลิงก์วิดีโอไม่ถูกต้อง: ${badVideos[0]}`); }
    const chosen = COLOR_PRESETS.find((c) => c.id === preset);
    const next: Product = {
      ...p,
      ...(chosen ? { colors: chosen.colors, colorsLabel: chosen.legend, swatchesLabel: chosen.swatchesLabel } : {}),
      detail: { ...p.detail, specs: textToSpecs(specs), videos: videoLines },
      en: { ...p.en, specs: textToSpecs(specsEn) },
    };
    start(async () => {
      const res = await saveProduct(next, isNew ? null : product.slug).catch((e: Error) => ({ error: e.message }));
      if (res.error) { setTab(tabForError(res.error)); return setError(res.error); }
      setSaved(true);
      setDirty(false);
      if (isNew || next.slug !== product.slug) router.replace(`/admin/products/${next.slug.trim().toLowerCase()}`);
      else router.refresh();
    });
  };

  const others = allProducts.filter((x) => x.slug !== product.slug);

  return (
    <>
      <p className="small"><Link href="/admin/products">← สินค้าทั้งหมด</Link></p>
      <div className="admin-head" style={{ marginTop: 8 }}>
        <h1>{isNew ? 'เพิ่มสินค้า' : p.name || 'แก้ไขสินค้า'}</h1>
        {!isNew && p.visible && !p.comingSoon && !p.custom && (
          <Link href={`/products/${product.slug}`} target="_blank" style={{ fontSize: 14 }}>ดูหน้าสินค้า ↗</Link>
        )}
      </div>

      <div role="tablist" aria-label="ส่วนของข้อมูลสินค้า" className="admin__tabs">
        {EDITOR_TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="editor-panel" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="stack" id="editor-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} style={{ marginTop: 18, gap: 18 }}>
        <section hidden={tab !== 'info'} className="admin-card">
          <h2>ข้อมูลหลัก</h2>
          <div className="admin-grid">
            <Field label="ชื่อสินค้า"><input className="input" value={p.name} onChange={(e) => set('name', e.target.value)} required /></Field>
            <Field label="ลิงก์สินค้า (slug)" hint="ภาษาอังกฤษตัวเล็ก ตัวเลข และ - เช่น place-board">
              <input className="input" value={p.slug} onChange={(e) => set('slug', e.target.value)} pattern="[a-z0-9-]+" required />
            </Field>
            <Field label="หมวด">
              <select className="input" value={p.cat} onChange={(e) => set('cat', e.target.value as CategoryId)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="คำอธิบายสั้น" wide><input className="input" value={p.th} onChange={(e) => set('th', e.target.value)} /></Field>
            <Field label="หัวข้อรองในหน้าสินค้า" hint="ว่างไว้จะใช้คำอธิบายสั้น" wide>
              <input className="input" value={p.detail.subtitle ?? ''} onChange={(e) => setDetail({ subtitle: e.target.value })} />
            </Field>
          </div>
        </section>

        <section hidden={tab !== 'price'} className="admin-card">
          <h2>ราคาและการขาย</h2>
          <div className="admin-grid">
            <Field label="ราคา (บาท)" hint={sizes.length ? 'มีหลายขนาด: ใช้ราคาของแต่ละขนาดด้านล่างแทน' : 'ราคาที่ใช้คิดเงินในตะกร้า'}>
              <input className="input" type="number" min={0} value={p.price} onChange={(e) => set('price', Number(e.target.value))} />
            </Field>
            <Field label="ข้อความราคา" hint="ที่แสดงในหน้ารวมสินค้า เช่น เริ่ม ฿1,590">
              <input className="input" value={p.priceLabel} onChange={(e) => set('priceLabel', e.target.value)} />
            </Field>
            <Field label="น้ำหนักต่อชิ้น (กก.)" hint={sizes.length ? 'มีหลายขนาด: ใช้น้ำหนักของแต่ละขนาดด้านล่างแทน' : 'ใช้คิดค่าส่ง'}>
              <input className="input" type="number" min={0} step={0.1} value={p.kg} onChange={(e) => set('kg', Number(e.target.value))} />
            </Field>
            <Field label="สถานะสินค้า">
              <select className="input" value={p.stock} onChange={(e) => set('stock', e.target.value as StockStatus)}>
                <option value="ready">พร้อมส่ง</option>
                <option value="preorder">พรีออเดอร์ (28-35 วัน)</option>
              </select>
            </Field>
            <Field label="ตัวเลือกสี">
              <select className="input" value={preset} onChange={(e) => { setPreset(e.target.value); touch(); }}>
                {COLOR_PRESETS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                {preset === 'keep' && <option value="keep">ใช้ชุดสีเดิม</option>}
              </select>
            </Field>
            <Field label="ป้ายบนรูป" hint="เช่น ใหม่, ขายดี (ว่างได้)">
              <input className="input" value={p.badge} onChange={(e) => set('badge', e.target.value)} />
            </Field>
            <Field label="รหัสสินค้า"><input className="input" value={p.sku} onChange={(e) => set('sku', e.target.value)} /></Field>
            <Field label="ลำดับการแสดง" hint="น้อยขึ้นก่อน">
              <input className="input" type="number" value={p.sort} onChange={(e) => set('sort', Number(e.target.value))} />
            </Field>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '0 24px' }}>
            <label className="admin-check"><input type="checkbox" checked={p.visible} onChange={(e) => set('visible', e.target.checked)} />แสดงบนหน้าร้าน</label>
            <label className="admin-check"><input type="checkbox" checked={p.magnets} onChange={(e) => set('magnets', e.target.checked)} />เลือกเพิ่มแม่เหล็กได้</label>
            {p.magnets && (
              <label className="admin-check">
                จำนวนแม่เหล็กที่ใช้
                <input className="input input--sm" style={{ width: 80, height: 40 }} type="number" min={1} max={20} value={p.magnetCount || ''} onChange={(e) => set('magnetCount', Number(e.target.value))} aria-label="จำนวนแม่เหล็กที่ใช้ต่อชิ้น" />
                ชิ้น
              </label>
            )}
            <label className="admin-check"><input type="checkbox" checked={p.cover} onChange={(e) => set('cover', e.target.checked)} />รูปหลักเป็นภาพบรรยากาศ (เต็มกรอบ)</label>
            <label className="admin-check"><input type="checkbox" checked={p.comingSoon} onChange={(e) => set('comingSoon', e.target.checked)} />เร็ว ๆ นี้ (ยังไม่ขาย)</label>
            <label className="admin-check"><input type="checkbox" checked={p.custom} onChange={(e) => set('custom', e.target.checked)} />สั่งทำ (ลิงก์ไปหน้าคำนวณราคา)</label>
          </div>
        </section>

        <section hidden={tab !== 'price'} className="admin-card">
          <h2>ขนาด</h2>
          <p className="small" style={{ marginBottom: 12 }}>
            ถ้าสินค้ามีหลายขนาด เพิ่มไว้ที่นี่ ลูกค้าจะเลือกขนาดในหน้าสินค้า และราคากับน้ำหนักจะเปลี่ยนตามขนาดที่เลือก ไม่มีหลายขนาดก็เว้นว่างไว้
          </p>
          {sizes.length > 0 && (
            <div className="admin-sizes">
              <div className="admin-sizes__row admin-sizes__head small" aria-hidden="true">
                <span>ชื่อขนาด</span><span>English</span><span>ราคา (บาท)</span><span>น้ำหนัก (กก.)</span><span />
              </div>
              {sizes.map((s, i) => (
                <div key={i} className="admin-sizes__row">
                  <input className="input input--sm" value={s.label} placeholder="เช่น สูง 6 cm" aria-label={`ชื่อขนาดที่ ${i + 1}`} onChange={(e) => setSizeAt(i, { label: e.target.value })} />
                  <input className="input input--sm" lang="en" value={s.labelEn ?? ''} placeholder={s.label || 'e.g. 6 cm high'} aria-label={`ชื่อขนาดที่ ${i + 1} ภาษาอังกฤษ`} onChange={(e) => setSizeAt(i, { labelEn: e.target.value })} />
                  <input className="input input--sm" type="number" min={0} value={s.price} aria-label={`ราคาขนาดที่ ${i + 1}`} onChange={(e) => setSizeAt(i, { price: Number(e.target.value) })} />
                  <input className="input input--sm" type="number" min={0} step={0.1} value={s.kg} aria-label={`น้ำหนักขนาดที่ ${i + 1}`} onChange={(e) => setSizeAt(i, { kg: Number(e.target.value) })} />
                  <span className="admin-sizes__btns">
                    <button type="button" aria-label="เลื่อนขึ้น" disabled={i === 0} onClick={() => moveSize(i, -1)}>↑</button>
                    <button type="button" aria-label="เลื่อนลง" disabled={i === sizes.length - 1} onClick={() => moveSize(i, 1)}>↓</button>
                    <button type="button" aria-label="ลบขนาดนี้" onClick={() => setDetail({ sizes: sizes.filter((_, j) => j !== i) })}>✕</button>
                  </span>
                </div>
              ))}
            </div>
          )}
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 10 }} onClick={() => setDetail({ sizes: [...sizes, { label: '', price: p.price, kg: p.kg }] })}>
            + เพิ่มขนาด
          </button>
        </section>

        {(shownColors.length > 0 || sizes.length > 0) && (
          <section hidden={tab !== 'price'} className="admin-card">
            <h2>ของหมด</h2>
            <p className="small" style={{ marginBottom: 12 }}>
              ติ๊กตัวเลือกที่ของหมด ลูกค้ายังเห็นแต่กดเลือกไม่ได้ (ขึ้นว่า "หมด") เอาเครื่องหมายออกเมื่อมีของ · ถ้าหมดทุกตัวเลือก ปุ่มใส่ตะกร้าจะขึ้นว่าหมด
              ส่วนการสร้างออร์เดอร์ในหลังบ้านยังเลือกได้ เผื่อรับพรีออเดอร์
            </p>
            {shownColors.length > 0 && (
              <fieldset className="plain">
                <legend className="small strong">สี</legend>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 22px' }}>
                  {shownColors.map((c) => {
                    const key = c.labelTh ?? c.label;
                    const out = soldOutColors.includes(key);
                    return (
                      <label key={key} className="admin-check">
                        <input type="checkbox" checked={out} onChange={(e) => toggleColorStock(key, e.target.checked)} />
                        <span className="swatch" style={{ background: c.swatch, opacity: out ? 0.35 : 1 }} />
                        {c.label}{out && <span className="tag tag--orange">หมด</span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
            {sizes.length > 0 && (
              <fieldset className="plain" style={{ marginTop: 10 }}>
                <legend className="small strong">ขนาด</legend>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 22px' }}>
                  {sizes.map((s, i) => (
                    <label key={i} className="admin-check">
                      <input type="checkbox" checked={!!s.soldOut} onChange={(e) => setSizeAt(i, { soldOut: e.target.checked })} />
                      {s.label || `ขนาดที่ ${i + 1}`}{s.soldOut && <span className="tag tag--orange">หมด</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>
        )}

        <section hidden={tab !== 'en'} className="admin-card" lang="en">
          <h2>ภาษาอังกฤษ (English)</h2>
          <p className="small" style={{ marginBottom: 12 }}>แสดงให้ลูกค้าที่เข้าเว็บจากต่างประเทศ หรือเลือก EN ช่องที่ว่างไว้จะใช้ข้อความภาษาไทยแทน</p>
          <div className="admin-grid">
            <Field label="Short description" wide><input className="input" value={p.en?.desc ?? ''} onChange={(e) => setEn({ desc: e.target.value })} placeholder={p.th} /></Field>
            <Field label="Product page subtitle" wide><input className="input" value={p.en?.subtitle ?? ''} onChange={(e) => setEn({ subtitle: e.target.value })} placeholder={p.detail.subtitle} /></Field>
            <Field label="Price label" hint="e.g. From ฿1,590"><input className="input" value={p.en?.priceLabel ?? ''} onChange={(e) => setEn({ priceLabel: e.target.value })} placeholder={p.priceLabel} /></Field>
            <Field label="Badge"><input className="input" value={p.en?.badge ?? ''} onChange={(e) => setEn({ badge: e.target.value })} placeholder={p.badge} /></Field>
            <Field label="Specifications" hint="One per line: Label | Value" wide>
              <textarea className="input" rows={5} value={specsEn} onChange={(e) => { setSpecsEn(e.target.value); touch(); }} placeholder={'Size | 80 L × 33 W × 1.5 H cm\nWeight | 3.5 kg'} />
            </Field>
          </div>
        </section>

        <section hidden={tab !== 'media'} className="admin-card">
          <h2>รูปภาพ</h2>
          <p className="small" style={{ marginBottom: 12 }}>รูปแรกในแกลเลอรีจะเป็นรูปหลักในหน้าสินค้า รูปหน้าปกใช้ในหน้ารวมสินค้าและตะกร้า</p>
          <div className="admin-gallery">
            <div className="admin-gallery__item">
              <div className="admin-gallery__img">{p.img && <Image src={p.img} alt="รูปหน้าปก" fill sizes="160px" />}</div>
              <div className="admin-gallery__bar" style={{ justifyContent: 'center' }}>
                <label className="text-btn text-btn--link" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
                  {p.img ? 'เปลี่ยนรูปหน้าปก' : 'ใส่รูปหน้าปก'}
                  <input type="file" accept="image/*" className="visually-hidden" onChange={async (e) => { const url = await upload(e.target.files?.[0]); if (url) set('img', url); e.target.value = ''; }} />
                </label>
              </div>
            </div>
            {gallery.map((g, i) => (
              <div key={`${g.src.slice(-40)}-${i}`} className="admin-gallery__item">
                <div className="admin-gallery__img"><Image src={g.src} alt={g.alt} fill sizes="160px" /></div>
                <div className="admin-gallery__bar">
                  <button type="button" aria-label="เลื่อนไปซ้าย" disabled={i === 0} onClick={() => moveImage(i, -1)}>←</button>
                  <button type="button" aria-label="ใช้เป็นรูปหน้าปก" title="ใช้เป็นรูปหน้าปก" onClick={() => set('img', g.src)}>★</button>
                  <button type="button" aria-label="ลบรูป" onClick={() => setDetail({ gallery: gallery.filter((_, j) => j !== i) })}>✕</button>
                  <button type="button" aria-label="เลื่อนไปขวา" disabled={i === gallery.length - 1} onClick={() => moveImage(i, 1)}>→</button>
                </div>
              </div>
            ))}
            <label className="admin-upload" aria-busy={uploading}>
              <span style={{ fontSize: 24 }} aria-hidden="true">+</span>
              {uploading ? 'กำลังอัปโหลด…' : 'เพิ่มรูปในแกลเลอรี'}
              <input type="file" accept="image/*" className="visually-hidden" disabled={uploading}
                onChange={async (e) => { const url = await upload(e.target.files?.[0]); if (url) setDetail({ gallery: [...gallery, { src: url, alt: p.name }] }); e.target.value = ''; }} />
            </label>
          </div>
        </section>

        {shownColors.length > 0 && (
          <section hidden={tab !== 'media'} className="admin-card">
            <h2>รูปตามสี</h2>
            <p className="small" style={{ marginBottom: 12 }}>ใส่รูปของแต่ละสี เมื่อลูกค้าเลือกสีนั้น รูปหลักในหน้าสินค้าจะเปลี่ยนเป็นรูปนี้ และใช้เป็นรูปในตะกร้า สีที่ไม่มีรูปจะใช้รูปแกลเลอรีตามปกติ</p>
            <div className="admin-gallery">
              {shownColors.map((c) => {
                const key = c.labelTh ?? c.label;
                const src = colorImages[key];
                return (
                  <div key={key} className="admin-gallery__item">
                    <div className="admin-gallery__img">
                      {src ? <Image src={src} alt={`สี${c.label}`} fill sizes="160px" /> : <span className="admin-gallery__empty"><span className="swatch swatch--lg" style={{ background: c.swatch }} /></span>}
                    </div>
                    <div className="admin-gallery__bar" style={{ justifyContent: 'space-between', paddingInline: 8 }}>
                      <span style={{ fontSize: 13 }}>{c.label}</span>
                      <span style={{ display: 'inline-flex', gap: 6 }}>
                        <label className="text-btn text-btn--link" style={{ cursor: 'pointer', fontSize: 13 }}>
                          {src ? 'เปลี่ยน' : 'ใส่รูป'}
                          <input type="file" accept="image/*" className="visually-hidden" disabled={uploading} onChange={async (e) => { const url = await upload(e.target.files?.[0]); if (url) setColorImage(key, url); e.target.value = ''; }} />
                        </label>
                        {src && <button type="button" aria-label={`ลบรูปสี${c.label}`} onClick={() => setColorImage(key, null)}>✕</button>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section hidden={tab !== 'media'} className="admin-card">
          <h2>วิดีโอ</h2>
          <div className="admin-grid">
            <Field label="ลิงก์ YouTube" hint="บรรทัดละ 1 ลิงก์ ใช้ได้ทั้งคลิปปกติและ Shorts · วิดีโอจะต่อท้ายรูปในแกลเลอรีหน้าสินค้า" wide>
              <textarea className="input" rows={3} value={videos} onChange={(e) => { setVideos(e.target.value); touch(); }} placeholder="https://www.youtube.com/shorts/…" />
            </Field>
          </div>
          {badVideos.length > 0 && <p className="small" role="alert" style={{ marginTop: 8, color: 'var(--danger, #b42318)' }}>ลิงก์นี้ไม่ใช่ YouTube: {badVideos.join(', ')}</p>}
          {videoLines.some((l) => youTubeId(l)) && (
            <div className="admin-gallery" style={{ marginTop: 12 }}>
              {videoLines.map((l) => youTubeId(l)).filter((id): id is string => !!id).map((id, i) => (
                <a key={`${id}-${i}`} className="admin-gallery__item" href={`https://youtu.be/${id}`} target="_blank" rel="noopener noreferrer" title="เปิดดูใน YouTube">
                  <div className="admin-gallery__img"><Image src={youTubeThumb(id)} alt={`วิดีโอที่ ${i + 1}`} fill sizes="160px" /></div>
                </a>
              ))}
            </div>
          )}
        </section>

        <section hidden={tab !== 'info'} className="admin-card">
          <h2>สเปกและสินค้าที่ใช้ร่วมกัน</h2>
          <div className="admin-grid">
            <Field label="สเปก" hint={`บรรทัดละรายการ รูปแบบ หัวข้อ | รายละเอียด · ใช้ตัวแปรได้: ${PRODUCT_TOKENS_HELP}`} wide>
              <textarea className="input" rows={7} value={specs} onChange={(e) => { setSpecs(e.target.value); touch(); }} placeholder={'ขนาด | ยาว 80 × กว้าง 33 × สูง 1.5 cm\nน้ำหนัก | 3.5 กก.'} />
            </Field>
          </div>
          <fieldset className="plain" style={{ marginTop: 14 }}>
            <legend style={{ fontSize: 14, fontWeight: 500 }}>ใช้ร่วมกันได้ (แสดงท้ายหน้าสินค้า)</legend>
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '0 20px' }}>
              {others.map((o) => {
                const rel = p.detail.related ?? [];
                const on = rel.includes(o.slug);
                return (
                  <label key={o.slug} className="admin-check">
                    <input type="checkbox" checked={on} onChange={() => setDetail({ related: on ? rel.filter((s) => s !== o.slug) : [...rel, o.slug] })} />
                    {o.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </section>
        {!isNew && tab === 'info' && (
          <section className="admin-card admin-danger">
            <div>
              <h2>ลบสินค้า</h2>
              <p className="small">ลบถาวร กู้คืนไม่ได้ ถ้าแค่ไม่อยากให้ขาย ให้เอาเครื่องหมาย "แสดงบนหน้าร้าน" ในแท็บราคาและขนาดออกแทน</p>
            </div>
            <button
              type="button"
              className="btn btn--square btn--danger"
              style={{ fontSize: 14 }}
              disabled={pending}
              onClick={() => confirm(`ลบ ${product.name} ถาวร? ถ้าแค่ไม่อยากให้ขาย ให้เอาเครื่องหมาย "แสดงบนหน้าร้าน" ออกแทน`) && start(() => removeProduct(product.slug))}
            >
              ลบสินค้า
            </button>
          </section>
        )}
      </div>

      <div className="admin-actions" data-dirty={dirty}>
        <button type="button" className="btn btn--primary btn--square" onClick={save} disabled={pending || uploading}>
          {pending ? 'กำลังบันทึก…' : isNew ? 'สร้างสินค้า' : 'บันทึก'}
        </button>
        {dirty && !pending && !error && <span className="admin-actions__status">● มีการแก้ไขที่ยังไม่บันทึก</span>}
        {saved && !pending && <span className="admin-note admin-note--ok" style={{ padding: '8px 12px' }}>บันทึกแล้ว หน้าร้านอัปเดตแล้ว</span>}
        {error && <span role="alert" className="admin-note admin-note--warn" style={{ padding: '8px 12px' }}>{error}</span>}
      </div>
    </>
  );
}
