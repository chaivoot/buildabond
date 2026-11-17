/**
 * Starting catalogue and settings loaded into an empty database on first run.
 * After that, everything here is edited from /admin. (No demo orders, customers or requests.)
 */
import type { ColorOption, Product, ProductText, ShopSettings } from '../lib/types';

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
const base = { cover: false, badge: '', comingSoon: false, custom: false, magnets: false, magnetCount: 0, sku: '', stock: 'ready' as const, visible: true, detail: {}, en: {} };

type SeedProduct = Omit<Product, 'sort' | 'en'> & { en?: ProductText };

const list: SeedProduct[] = [
  {
    ...base, ...rubber, slug: 'place-board', cat: 'sb', name: 'Place Board', th: 'แผ่นกระดาน 80×33×1.5 cm', priceLabel: '฿2,190', price: 2190, kg: 3.5,
    img: '/images/place-board.jpg', cover: true, magnets: true, magnetCount: 4, sku: '0101',
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
        ['น้ำหนัก', '{kg} กก.'],
      ],
      related: ['target-box', 'slant-box', 'oct-box', 'narrow-target'],
      faq: [
        {
          q: 'ใช้ได้กับหมาขนาดไหน อายุเท่าไร',
          a: 'รับแรงกระแทกได้ถึง 200 กก. ใช้ได้ตั้งแต่ลูกหมาจนหมาสูงวัย เริ่มจากวางราบกับพื้นก่อน แล้วค่อยต่อกับฐานเมื่อหมามั่นใจ หมาสูงวัยหรือมีปัญหาข้อ ควรปรึกษาสัตวแพทย์ก่อนเริ่มท่าใหม่',
        },
        { q: 'ต้องใส่แม่เหล็กกี่ชิ้น', a: 'Place Board ใช้แม่เหล็ก {magnets} ชิ้น ติดใต้แผ่น เลือกเพิ่มได้ตอนใส่ตะกร้า ส่วน Target Box และ Slant Box ที่จะใช้คู่กันก็เลือกเพิ่มแม่เหล็กได้เช่นกัน แม่เหล็กราคาชิ้นละ {magnetPrice}' },
      ],
    },
  },
  { ...base, ...rubber, slug: 'target-box', cat: 'sb', magnets: true, magnetCount: 2, name: 'Target Box', th: 'สูง 6 / 10 cm', priceLabel: 'เริ่ม ฿1,590', price: 1590, kg: 2.6, img: '/images/target-box.jpg' },
  { ...base, ...rubber, slug: 'slant-box', cat: 'sb', magnets: true, magnetCount: 2, name: 'Slant Box', th: 'มุมเอียง 15° / 20°', priceLabel: 'เริ่ม ฿1,590', price: 1590, kg: 2.4, img: '/images/slant-box.jpg' },
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

/** English copy, by product slug. */
export const SEED_EN: Record<string, ProductText> = {
  'place-board': {
    desc: 'Board, 80×33×1.5 cm',
    subtitle: 'Board, 80 × 33 × 1.5 cm · SKU 0101',
    story: {
      title: 'A spot your dog understands right away',
      body: 'Wide enough to sit, stand or lie down comfortably. A clear target for practising Place and Stay, at home or out in the field.',
      alt: 'Blue Place Board on the lawn next to an Oct Box',
    },
    moves: [
      { tag: 'Obedience Training', tone: 'tag--sky', title: 'Place & Stay', body: 'Send your dog onto the board and have them wait there. Slowly build up time and distance.' },
      { tag: 'Obedience Training', tone: 'tag--sky', title: 'Settle', body: 'Make the board a place to relax, lying down calmly even with distractions around.' },
      { tag: 'Movement Puzzles', tone: 'tag--orange', title: 'Back-up', body: 'Back onto the board one leg at a time to build hind-leg awareness.' },
      { tag: 'Canine Fitness', tone: 'tag--sand', title: 'Plank Walk', body: 'Bridge it across Target Boxes and walk slowly to the end of the board.' },
    ],
    specs: [
      ['SKU', '0101'],
      ['Size', '80 L × 33 W × 1.5 H cm'],
      ['Structure', 'Export-grade rubberwood'],
      ['Surface', 'Playground-grade EPDM rubber, non-slip texture'],
      ['Impact rating', 'Up to 200 kg'],
      ['Colours', 'Sky Blue / Orange / 50:50 blue-orange mix'],
      ['Weight', '{kg} kg'],
    ],
    faq: [
      {
        q: 'What size and age of dog is it for?',
        a: 'It takes impacts of up to 200 kg and suits puppies through to senior dogs. Start with it flat on the floor, then add a base once your dog is confident. For senior dogs or dogs with joint problems, check with your vet before starting new moves.',
      },
      { q: 'How many magnets do I need?', a: 'The Place Board uses {magnets} magnets fitted underneath; add them when you put it in your cart. Target Box and Slant Box can have magnets added too. Magnets are {magnetPrice} each.' },
    ],
    galleryAlts: [
      'Cocker spaniel standing on a blue Place Board in a field',
      'Underside of the board with magnets fitted',
      'Place Board with an Oct Box and Target Box',
      'Close-up of the EPDM rubber surface',
    ],
  },
  'target-box': { desc: '6 / 10 cm high', priceLabel: 'From ฿1,590' },
  'slant-box': { desc: '15° / 20° incline', priceLabel: 'From ฿1,590' },
  'oct-box': { desc: 'Octagonal base, 16 cm high, with Cavaletti holes' },
  'narrow-target': { desc: '25 / 35 / 45 cm', priceLabel: 'From ฿390' },
  'jump-box': { desc: 'Jump box, made to your size', priceLabel: 'From ฿2,590', badge: 'Custom' },
  platform: { desc: 'Platform, made to your size', priceLabel: 'From ฿2,990', badge: 'Custom' },
  wobbler: { desc: 'Wobble board, 4.5 / 9.5 cm', priceLabel: 'Notify me when available', badge: 'Coming soon' },
  'flirt-pole': { desc: 'Sizes S / M, lures in 3 colours', priceLabel: 'From ฿790' },
  'bungee-pocket': { desc: 'Sheepskin with a bungee ball, easy to carry' },
  'sheepskin-bungee': { desc: '58 / 62 cm long, for dogs who pull hard' },
  'sheepskin-chaser': { desc: '112 cm long, suits all breeds' },
  'rabbitskin-chaser': { desc: '118 cm long with a squeaker inside' },
  'rabbit-dummy': { desc: '500 g, real rabbit fur' },
};

export const SEED_PRODUCTS: Product[] = list.map((p, i) => ({ ...p, sort: (i + 1) * 10, en: SEED_EN[p.slug] ?? {} }));

export const SEED_SETTINGS: ShopSettings = {
  bank: { name: 'ธนาคารกรุงไทย (KTB)', nameEn: 'Krungthai Bank (KTB)', number: '539-1-36496-5', holder: 'Mrs. Natigarn Suwannapet' },
  promptpay: '',
  magnetPrice: 100,
  maxMagnets: 6,
  shipping: [
    { upToKg: 1, fee: 50 },
    { upToKg: 5, fee: 100 },
    { upToKg: null, fee: 200 },
  ],
};

