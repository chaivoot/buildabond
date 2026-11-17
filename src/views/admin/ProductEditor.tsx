'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { CATEGORIES } from '../../data/products';
import { COLOR_PRESETS } from '../../data/seed';
import type { CategoryId, Product, ProductDetail, ProductText, StockStatus } from '../../lib/types';
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
  const [preset, setPreset] = useState(presetOf(product));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  const set = <K extends keyof Product>(k: K, v: Product[K]) => { setP((x) => ({ ...x, [k]: v })); setSaved(false); };
  const setDetail = (d: Partial<ProductDetail>) => { setP((x) => ({ ...x, detail: { ...x.detail, ...d } })); setSaved(false); };
  const setEn = (d: Partial<ProductText>) => { setP((x) => ({ ...x, en: { ...x.en, ...d } })); setSaved(false); };
  const gallery = p.detail.gallery ?? [];

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
    const chosen = COLOR_PRESETS.find((c) => c.id === preset);
    const next: Product = {
      ...p,
      ...(chosen ? { colors: chosen.colors, colorsLabel: chosen.legend, swatchesLabel: chosen.swatchesLabel } : {}),
      detail: { ...p.detail, specs: textToSpecs(specs) },
      en: { ...p.en, specs: textToSpecs(specsEn) },
    };
    start(async () => {
      const res = await saveProduct(next, isNew ? null : product.slug).catch((e: Error) => ({ error: e.message }));
      if (res.error) return setError(res.error);
      setSaved(true);
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

      <div className="stack" style={{ marginTop: 18, gap: 18 }}>
        <section className="admin-card">
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

        <section className="admin-card">
          <h2>ราคาและการขาย</h2>
          <div className="admin-grid">
            <Field label="ราคา (บาท)" hint="ราคาที่ใช้คิดเงินในตะกร้า">
              <input className="input" type="number" min={0} value={p.price} onChange={(e) => set('price', Number(e.target.value))} />
            </Field>
            <Field label="ข้อความราคา" hint="ที่แสดงในหน้ารวมสินค้า เช่น เริ่ม ฿1,590">
              <input className="input" value={p.priceLabel} onChange={(e) => set('priceLabel', e.target.value)} />
            </Field>
            <Field label="น้ำหนักต่อชิ้น (กก.)" hint="ใช้คิดค่าส่ง">
              <input className="input" type="number" min={0} step={0.1} value={p.kg} onChange={(e) => set('kg', Number(e.target.value))} />
            </Field>
            <Field label="สถานะสินค้า">
              <select className="input" value={p.stock} onChange={(e) => set('stock', e.target.value as StockStatus)}>
                <option value="ready">พร้อมส่ง</option>
                <option value="preorder">พรีออเดอร์ (28-35 วัน)</option>
              </select>
            </Field>
            <Field label="ตัวเลือกสี">
              <select className="input" value={preset} onChange={(e) => { setPreset(e.target.value); setSaved(false); }}>
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

        <section className="admin-card" lang="en">
          <h2>ภาษาอังกฤษ (English)</h2>
          <p className="small" style={{ marginBottom: 12 }}>แสดงให้ลูกค้าที่เข้าเว็บจากต่างประเทศ หรือเลือก EN ช่องที่ว่างไว้จะใช้ข้อความภาษาไทยแทน</p>
          <div className="admin-grid">
            <Field label="Short description" wide><input className="input" value={p.en?.desc ?? ''} onChange={(e) => setEn({ desc: e.target.value })} placeholder={p.th} /></Field>
            <Field label="Product page subtitle" wide><input className="input" value={p.en?.subtitle ?? ''} onChange={(e) => setEn({ subtitle: e.target.value })} placeholder={p.detail.subtitle} /></Field>
            <Field label="Price label" hint="e.g. From ฿1,590"><input className="input" value={p.en?.priceLabel ?? ''} onChange={(e) => setEn({ priceLabel: e.target.value })} placeholder={p.priceLabel} /></Field>
            <Field label="Badge"><input className="input" value={p.en?.badge ?? ''} onChange={(e) => setEn({ badge: e.target.value })} placeholder={p.badge} /></Field>
            <Field label="Specifications" hint="One per line: Label | Value" wide>
              <textarea className="input" rows={5} value={specsEn} onChange={(e) => { setSpecsEn(e.target.value); setSaved(false); }} placeholder={'Size | 80 L × 33 W × 1.5 H cm\nWeight | 3.5 kg'} />
            </Field>
          </div>
        </section>

        <section className="admin-card">
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

        <section className="admin-card">
          <h2>สเปกและสินค้าที่ใช้ร่วมกัน</h2>
          <div className="admin-grid">
            <Field label="สเปก" hint="บรรทัดละรายการ รูปแบบ หัวข้อ | รายละเอียด" wide>
              <textarea className="input" rows={7} value={specs} onChange={(e) => { setSpecs(e.target.value); setSaved(false); }} placeholder={'ขนาด | ยาว 80 × กว้าง 33 × สูง 1.5 cm\nน้ำหนัก | 3.5 กก.'} />
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
      </div>

      <div className="admin-actions">
        <button type="button" className="btn btn--primary btn--square" onClick={save} disabled={pending || uploading}>
          {pending ? 'กำลังบันทึก…' : isNew ? 'สร้างสินค้า' : 'บันทึก'}
        </button>
        {saved && !pending && <span className="admin-note admin-note--ok" style={{ padding: '8px 12px' }}>บันทึกแล้ว หน้าร้านอัปเดตแล้ว</span>}
        {error && <span role="alert" className="admin-note admin-note--warn" style={{ padding: '8px 12px' }}>{error}</span>}
        {!isNew && (
          <button
            type="button"
            className="btn btn--square btn--danger"
            style={{ marginLeft: 'auto', fontSize: 14 }}
            disabled={pending}
            onClick={() => confirm(`ลบ ${product.name} ถาวร? ถ้าแค่ไม่อยากให้ขาย ให้เอาเครื่องหมาย "แสดงบนหน้าร้าน" ออกแทน`) && start(() => removeProduct(product.slug))}
          >
            ลบสินค้า
          </button>
        )}
      </div>
    </>
  );
}
