/**
 * Demo content loaded into an empty database on first run.
 * After that, everything here is edited from /admin.
 */
import type { ColorOption, Order, Product, ShopRequest, ShopSettings } from '../lib/types';

export const RUBBER_COLORS: ColorOption[] = [
  { label: 'ฟ้า', name: 'ฟ้า Sky Blue', swatch: '#5FAEDB' },
  { label: 'ส้ม', name: 'ส้ม', swatch: '#EE7D2B' },
  { label: 'ผสม', name: 'ผสมฟ้า-ส้ม', swatch: 'linear-gradient(90deg,#5FAEDB 50%,#EE7D2B 50%)' },
];

export const LURE_COLORS: ColorOption[] = [
  { label: 'เหลือง', name: 'เหยื่อเหลือง', swatch: '#F6CF55' },
  { label: 'ฟ้า', name: 'เหยื่อฟ้า', swatch: '#5FAEDB' },
  { label: 'ชมพู', name: 'เหยื่อชมพู', swatch: '#E86FBF' },
];

export const CHASER_COLORS: ColorOption[] = [
  { label: 'ฟ้าอมเขียว', name: 'สายฟ้าอมเขียว', swatch: '#5ED6E6' },
  { label: 'ม่วง', name: 'สายม่วง', swatch: '#7C4DE0' },
];

/** Colour sets the admin can pick from. */
export const COLOR_PRESETS: { id: string; label: string; colors: ColorOption[]; legend: string; swatchesLabel: string }[] = [
  { id: 'none', label: 'ไม่มีตัวเลือกสี', colors: [], legend: '', swatchesLabel: '' },
  { id: 'rubber', label: 'สีผิวยาง (ฟ้า / ส้ม / ผสม)', colors: RUBBER_COLORS, legend: 'สีผิวยาง', swatchesLabel: 'สีผิวยาง ฟ้า ส้ม ผสม' },
  { id: 'lure', label: 'สีเหยื่อ (เหลือง / ฟ้า / ชมพู)', colors: LURE_COLORS, legend: 'สีเหยื่อ', swatchesLabel: 'สีเหยื่อ เหลือง ฟ้า ชมพู' },
  { id: 'chaser', label: 'สีสาย (ฟ้าอมเขียว / ม่วง)', colors: CHASER_COLORS, legend: 'สีสาย', swatchesLabel: 'สีสาย ฟ้าอมเขียว ม่วง' },
];

const rubber = { colors: RUBBER_COLORS, colorsLabel: 'สีผิวยาง', swatchesLabel: 'สีผิวยาง ฟ้า ส้ม ผสม' };
const none = { colors: [], colorsLabel: '', swatchesLabel: '' };
const base = { cover: false, badge: '', comingSoon: false, custom: false, magnets: false, sku: '', stock: 'ready' as const, visible: true, detail: {} };

type SeedProduct = Omit<Product, 'sort'>;

const list: SeedProduct[] = [
  {
    ...base, ...rubber, slug: 'place-board', cat: 'sb', name: 'Place Board', th: 'แผ่นกระดาน 80×33×1.5 cm', priceLabel: '฿2,190', price: 2190, kg: 3.5,
    img: '/images/place-board.jpg', cover: true, magnets: true, sku: '0101',
    detail: {
      subtitle: 'แผ่นกระดาน 80 × 33 × 1.5 cm · รหัส 0101',
      gallery: [
        { src: '/images/place-board.jpg', alt: 'ค็อกเกอร์สแปเนียลยืนบน Place Board สีฟ้ากลางสนาม' },
        { src: '/images/magnets.jpg', alt: 'ด้านล่างแผ่นกระดานที่ติดแม่เหล็ก' },
        { src: '/images/hero-set.jpg', alt: 'Place Board วางคู่กับ Oct Box และ Target Box' },
        { src: '/images/epdm-closeup.jpg', alt: 'ผิวยาง EPDM ระยะใกล้' },
      ],
      story: {
        title: 'จุดยืนที่หมาเข้าใจได้ทันที',
        body: 'แผ่นกว้างพอให้หมานั่ง ยืน หรือนอนได้สบาย เป็นจุดหมายชัดเจนสำหรับฝึก Place และ Stay ทั้งในบ้านและกลางสนาม',
        img: '/images/hero-set.jpg',
        alt: 'Place Board สีฟ้าวางบนสนามหญ้าข้าง Oct Box',
      },
      moves: [
        { tag: 'Obedience Training', tone: 'tag--sky', title: 'Place & Stay', body: 'ส่งหมาขึ้นแผ่นแล้วรออยู่ตรงนั้น ค่อย ๆ เพิ่มเวลาและระยะห่าง' },
        { tag: 'Obedience Training', tone: 'tag--sky', title: 'Settle', body: 'ให้แผ่นกระดานเป็นมุมผ่อนคลาย นอนพักได้แม้มีสิ่งเร้ารอบตัว' },
        { tag: 'Movement Puzzles', tone: 'tag--orange', title: 'Back-up', body: 'ถอยหลังขึ้นแผ่นทีละขา ฝึกการรับรู้ขาหลัง' },
        { tag: 'Canine Fitness', tone: 'tag--sand', title: 'Plank Walk', body: 'ต่อเป็นสะพานบน Target Box แล้วเดินช้า ๆ ไปจนสุดแผ่น' },
      ],
      specs: [
        ['รหัสสินค้า', '0101'],
        ['ขนาด', 'ยาว 80 × กว้าง 33 × สูง 1.5 cm'],
        ['โครงสร้าง', 'ไม้ยางพาราเกรดส่งออก'],
        ['ผิวหน้า', 'ยาง EPDM เกรดสนามเด็กเล่น ลายกันลื่น'],
        ['รับแรงกระแทก', 'สูงสุด 200 กก.'],
        ['สี', 'ฟ้า Sky Blue / ส้ม / ผสมฟ้า-ส้ม 50:50'],
        ['น้ำหนัก', '[ระบุน้ำหนัก] กก.'],
      ],
      related: ['target-box', 'slant-box', 'oct-box', 'narrow-target'],
      faq: [
        {
          q: 'ใช้ได้กับหมาขนาดไหน อายุเท่าไร',
          a: 'รับแรงกระแทกได้ถึง 200 กก. ใช้ได้ตั้งแต่ลูกหมาจนหมาสูงวัย เริ่มจากวางราบกับพื้นก่อน แล้วค่อยต่อกับฐานเมื่อหมามั่นใจ หมาสูงวัยหรือมีปัญหาข้อ ควรปรึกษาสัตวแพทย์ก่อนเริ่มท่าใหม่',
        },
        { q: 'ต้องใส่แม่เหล็กกี่ชิ้น', a: 'แม่เหล็กราคาชิ้นละ ฿100 ฐานที่จะใช้คู่กันต้องสั่งแม่เหล็กด้วย จำนวนที่แนะนำ [ระบุจำนวน]' },
      ],
    },
  },
  { ...base, ...rubber, slug: 'target-box', cat: 'sb', name: 'Target Box', th: 'สูง 6 / 10 cm', priceLabel: 'เริ่ม ฿1,590', price: 1590, kg: 2.6, img: '/images/target-box.jpg' },
  { ...base, ...rubber, slug: 'slant-box', cat: 'sb', name: 'Slant Box', th: 'มุมเอียง 15° / 20°', priceLabel: 'เริ่ม ฿1,590', price: 1590, kg: 2.4, img: '/images/slant-box.jpg' },
  { ...base, ...rubber, slug: 'oct-box', cat: 'sb', name: 'Oct Box', th: 'ฐานแปดเหลี่ยม สูง 16 cm มีรูเสียบ Cavaletti', priceLabel: '฿3,590', price: 3590, kg: 4.2, img: '/images/oct-box.jpg' },
  { ...base, ...rubber, slug: 'narrow-target', cat: 'sb', name: 'Narrow Target', th: 'ฐานยืน 25 / 35 / 45 cm', priceLabel: 'เริ่ม ฿390', price: 390, kg: 0.6, img: '/images/narrow-target.jpg' },
  { ...base, ...none, slug: 'jump-box', cat: 'sb', name: 'Jump Box', th: 'กล่องกระโดด สั่งทำตามขนาด', priceLabel: 'เริ่ม ฿2,590', price: 2590, kg: 6, img: '/images/jump-box.jpg', cover: true, badge: 'สั่งทำ', custom: true },
  { ...base, ...none, slug: 'platform', cat: 'sb', name: 'Platform', th: 'ฐานรอง สั่งทำตามขนาด', priceLabel: 'เริ่ม ฿2,990', price: 2990, kg: 6, img: '/images/magnets.jpg', cover: true, badge: 'สั่งทำ', custom: true },
  { ...base, ...none, slug: 'wobbler', cat: 'sb', name: 'Wobbler', th: 'แท่นโยก 4.5 / 9.5 cm', priceLabel: 'แจ้งเตือนเมื่อพร้อมขาย', price: 0, kg: 0, img: '', comingSoon: true, badge: 'Coming soon' },
  { ...base, slug: 'flirt-pole', cat: 'ip', name: 'Flirt Pole', th: 'ไซส์ S / M เหยื่อ 3 สี', priceLabel: 'เริ่ม ฿790', price: 790, kg: 0.6, img: '/images/flirt-pole.jpg', cover: true, colors: LURE_COLORS, colorsLabel: 'สีเหยื่อ', swatchesLabel: 'สีเหยื่อ เหลือง ฟ้า ชมพู' },
  { ...base, ...none, slug: 'bungee-pocket', cat: 'tug', name: 'Bungee Pocket', th: 'ขนแกะ + ลูกบอลบันจี้ พกพาสะดวก', priceLabel: '฿1,550', price: 1550, kg: 0.4, img: '/images/bungee-pocket.jpg' },
  { ...base, ...none, slug: 'sheepskin-bungee', cat: 'tug', name: 'Sheepskin Bungee / Ball', th: 'ยาว 58 / 62 cm สำหรับหมาที่ชอบดึงแรง', priceLabel: '฿1,450 / ฿1,550', price: 1450, kg: 0.4, img: '/images/sheepskin-bungee.jpg' },
  { ...base, slug: 'sheepskin-chaser', cat: 'tug', name: 'Sheepskin Chaser', th: 'ยาว 112 cm เหมาะกับทุกสายพันธุ์', priceLabel: '฿1,450', price: 1450, kg: 0.4, img: '/images/sheepskin-chaser.jpg', colors: CHASER_COLORS, colorsLabel: 'สีสาย', swatchesLabel: 'สีสาย ฟ้าอมเขียว ม่วง' },
  { ...base, ...none, slug: 'rabbitskin-chaser', cat: 'tug', name: 'Rabbitskin Chaser', th: 'ยาว 118 cm มีตัวบีบส่งเสียงด้านใน', priceLabel: '฿1,550', price: 1550, kg: 0.4, img: '/images/rabbitskin-chaser.jpg' },
  { ...base, ...none, slug: 'rabbit-dummy', cat: 'tug', name: 'Rabbit Dummy', th: 'หนัก 500 กรัม ขนกระต่ายแท้', priceLabel: '฿1,550', price: 1550, kg: 0.5, img: '/images/rabbit-dummy.jpg' },
];

export const SEED_PRODUCTS: Product[] = list.map((p, i) => ({ ...p, sort: (i + 1) * 10 }));

export const SEED_SETTINGS: ShopSettings = {
  bank: { name: 'ธนาคารกรุงไทย (KTB)', number: '539-1-36496-5', holder: 'Mrs. Natigarn Suwannapet' },
  promptpay: '',
  magnetPrice: 100,
  maxMagnets: 6,
  shipping: [
    { upToKg: 1, fee: 50 },
    { upToKg: 5, fee: 100 },
    { upToKg: null, fee: 200 },
  ],
};

const order = (o: Partial<Order> & Pick<Order, 'id' | 'name' | 'phone' | 'address' | 'items' | 'kg' | 'status' | 'createdAt'>): Order => {
  const subtotal = o.items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const shipping = o.kg < 1 ? 50 : o.kg < 5 ? 100 : 200;
  return { note: '', slipUrl: '', slipAt: null, confirmedAt: null, shippedAt: null, carrier: '', tracking: '', subtotal, shipping, total: subtotal + shipping, ...o };
};
const item = (slug: string, name: string, opt: string, unitPrice: number, kg: number) => ({ slug, name, opt, unitPrice, qty: 1, kg });

/** Demo orders (times are Bangkok, UTC+7). */
export const SEED_ORDERS: Order[] = [
  order({ id: 'BB-261116-0042', createdAt: '2026-11-16T22:51:00+07:00', slipAt: '2026-11-16T23:02:00+07:00', name: 'ณัฐกานต์ ใจดี', phone: '081-234-5678', status: 'ส่งสลิปแล้ว', address: '99/12 ซอยสุขุมวิท 50 พระโขนง คลองเตย กรุงเทพฯ 10260', kg: 6.7, items: [item('place-board', 'Place Board', 'ฟ้า · แม่เหล็ก 4 ชิ้น', 2590, 3.5), item('target-box', 'Target Box 10 cm', 'ส้ม', 1690, 2.6), item('flirt-pole', 'Flirt Pole M', 'เหยื่อชมพู', 890, 0.6)] }),
  order({ id: 'BB-261116-0041', createdAt: '2026-11-16T20:14:00+07:00', name: 'ภาณุ ศรีสุข', phone: '089-555-1201', status: 'รอชำระ', address: '45 ถนนนิมมานเหมินท์ สุเทพ เมือง เชียงใหม่ 50200', kg: 0.5, items: [item('rabbit-dummy', 'Rabbit Dummy', '—', 1550, 0.5)] }),
  order({ id: 'BB-261116-0040', createdAt: '2026-11-16T18:03:00+07:00', slipAt: '2026-11-16T18:20:00+07:00', name: 'ศิริพร วงศ์ทอง', phone: '062-118-4433', status: 'ส่งสลิปแล้ว', address: '12/3 หมู่ 5 บางพูด ปากเกร็ด นนทบุรี 11120', kg: 1.2, items: [item('narrow-target', 'Narrow Target 35 cm', 'ส้ม', 490, 0.6), item('narrow-target', 'Narrow Target 45 cm', 'ส้ม', 590, 0.6)] }),
  order({ id: 'BB-261115-0039', createdAt: '2026-11-15T13:40:00+07:00', slipAt: '2026-11-15T14:05:00+07:00', confirmedAt: '2026-11-15T16:00:00+07:00', name: 'ธนวัฒน์ แก้วมณี', phone: '095-772-9080', status: 'ยืนยันแล้ว', address: '88 ถนนพระราม 9 ห้วยขวาง กรุงเทพฯ 10310', kg: 4.2, items: [item('oct-box', 'Oct Box', 'ผสม', 3590, 4.2)] }),
  order({ id: 'BB-261115-0038', createdAt: '2026-11-15T09:12:00+07:00', slipAt: '2026-11-15T09:40:00+07:00', confirmedAt: '2026-11-15T11:20:00+07:00', name: 'กมลชนก ปัญญา', phone: '086-410-2290', status: 'ยืนยันแล้ว', address: '7 ซอยลาดพร้าว 71 วังทองหลาง กรุงเทพฯ 10310', kg: 3.4, items: [item('slant-box', 'Slant Box 20°', 'ฟ้า · แม่เหล็ก 2 ชิ้น', 1890, 3), item('sheepskin-chaser', 'Sheepskin Chaser', 'สายม่วง', 1450, 0.4)] }),
  order({ id: 'BB-261114-0037', createdAt: '2026-11-14T16:55:00+07:00', slipAt: '2026-11-14T17:10:00+07:00', confirmedAt: '2026-11-14T18:00:00+07:00', shippedAt: '2026-11-15T15:40:00+07:00', name: 'วรเชษฐ์ มั่นคง', phone: '081-900-3321', status: 'จัดส่งแล้ว', address: '230 ถนนมิตรภาพ ในเมือง ขอนแก่น 40000', kg: 0.5, carrier: 'ไปรษณีย์ไทย', tracking: 'EF551234870TH', items: [item('flirt-pole', 'Flirt Pole S', 'เหยื่อเหลือง', 790, 0.5)] }),
];

export const SEED_REQUESTS: ShopRequest[] = [
  { id: 'req-demo-1', kind: 'custom', createdAt: '2026-11-16T10:20:00+07:00', status: 'ใหม่', name: 'ปิยะพงษ์ เดชา', contact: '084-221-7788', data: { 'ขนาด (กว้าง×ยาว×สูง)': '90 × 60 × 15 cm', 'ขนาดรวม': '165 cm', 'สีผิวยาง': 'ผสม', 'ใช้ทำกิจกรรม': 'ใช้ในคลาสฟิตเนสหมา อยากได้แท่นยืนกว้าง ๆ' } },
  { id: 'req-demo-2', kind: 'business', createdAt: '2026-11-15T14:05:00+07:00', status: 'ติดต่อแล้ว', name: 'Happy Paws Pet Shop', contact: '02-555-0199 · LINE @happypaws', data: { 'ประเภทธุรกิจ': 'ร้านค้าสัตว์เลี้ยง', 'ผู้ติดต่อ': 'คุณมินตรา', 'อีเมล': 'contact@example.com', 'สนใจ': 'ซื้อส่ง, Dropship', 'รายละเอียด': 'สนใจ Place Board และ Target Box อย่างละ 10 ชิ้น' } },
];
