import { img } from './images';

export interface ProductDetail {
  /** "แผ่นกระดาน 80 × 33 × 1.5 cm · รหัส 0101" */
  subtitle: string;
  gallery: { src: string; alt: string }[];
  story?: { title: string; body: string; img: string; alt: string };
  moves?: { tag: string; tone: string; title: string; body: string }[];
  specs?: [string, string][];
  related?: string[];
  faq?: { q: string; a: string }[];
}

export const SHARED_FAQ = [
  {
    q: 'จัดส่งกี่วัน ค่าส่งเท่าไร',
    a: 'สินค้าพร้อมส่งประกอบเสร็จแล้ว ใช้เวลาทำผิวยางสีที่เลือก 3-5 วัน สินค้าพรีออเดอร์ใช้เวลาผลิต 28-35 วัน จัดส่งผ่านไปรษณีย์ไทยหรือนิ่มเอ็กซ์เพรส และแจ้งเลขพัสดุภายใน 1 วันหลังส่ง ค่าส่งคิดตามน้ำหนักรวม ต่ำกว่า 1 กก. ฿50, 1-5 กก. ฿100, 5 กก. ขึ้นไป ฿200',
  },
  {
    q: 'ถ้าสินค้าเสียหายระหว่างขนส่ง',
    a: 'ถ่ายรูปความเสียหายแล้วแจ้งเราภายใน 24 ชั่วโมงหลังได้รับ เราจะลดราคาให้หากเสียหายเล็กน้อยและยังใช้งานได้ หรือเปลี่ยนชิ้นใหม่หากใช้งานไม่ได้',
  },
];

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  'place-board': {
    subtitle: 'แผ่นกระดาน 80 × 33 × 1.5 cm · รหัส 0101',
    gallery: [
      { src: img.placeBoard, alt: 'ค็อกเกอร์สแปเนียลยืนบน Place Board สีฟ้ากลางสนาม' },
      { src: img.magnets, alt: 'ด้านล่างแผ่นกระดานที่ติดแม่เหล็ก' },
      { src: img.heroSet, alt: 'Place Board วางคู่กับ Oct Box และ Target Box' },
      { src: img.epdmCloseup, alt: 'ผิวยาง EPDM ระยะใกล้' },
    ],
    story: {
      title: 'จุดยืนที่หมาเข้าใจได้ทันที',
      body: 'แผ่นกว้างพอให้หมานั่ง ยืน หรือนอนได้สบาย เป็นจุดหมายชัดเจนสำหรับฝึก Place และ Stay ทั้งในบ้านและกลางสนาม',
      img: img.heroSet,
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
      // TODO: confirm the real weight.
      ['น้ำหนัก', '[ระบุน้ำหนัก] กก.'],
    ],
    related: ['target-box', 'slant-box', 'oct-box', 'narrow-target'],
    faq: [
      {
        q: 'ใช้ได้กับหมาขนาดไหน อายุเท่าไร',
        a: 'รับแรงกระแทกได้ถึง 200 กก. ใช้ได้ตั้งแต่ลูกหมาจนหมาสูงวัย เริ่มจากวางราบกับพื้นก่อน แล้วค่อยต่อกับฐานเมื่อหมามั่นใจ หมาสูงวัยหรือมีปัญหาข้อ ควรปรึกษาสัตวแพทย์ก่อนเริ่มท่าใหม่',
      },
      {
        q: 'ต้องใส่แม่เหล็กกี่ชิ้น',
        // TODO: confirm the recommended magnet count.
        a: 'แม่เหล็กราคาชิ้นละ ฿100 ฐานที่จะใช้คู่กันต้องสั่งแม่เหล็กด้วย จำนวนที่แนะนำ [ระบุจำนวน]',
      },
    ],
  },
};
