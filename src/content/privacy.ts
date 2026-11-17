/**
 * Privacy policy (Thailand PDPA). Describes what this site actually collects and does.
 * Have it reviewed before relying on it legally; update `updated` when the text changes.
 */
export interface PolicySection {
  h: string;
  p?: string[];
  list?: string[];
}

export interface Policy {
  title: string;
  updated: string;
  intro: string;
  sections: PolicySection[];
  contactLead: string;
}

export const PRIVACY: Record<'th' | 'en', Policy> = {
  th: {
    title: 'นโยบายความเป็นส่วนตัว',
    updated: 'ปรับปรุงล่าสุด 17 พฤศจิกายน 2569',
    intro:
      'Buildabond ("เรา") ให้ความสำคัญกับข้อมูลส่วนบุคคลของคุณ นโยบายนี้อธิบายว่าเราเก็บข้อมูลอะไร ใช้ทำอะไร เปิดเผยให้ใคร เก็บไว้นานแค่ไหน และคุณมีสิทธิอะไรบ้าง ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)',
    sections: [
      {
        h: '1. ผู้ควบคุมข้อมูลส่วนบุคคล',
        p: ['Buildabond Active Play & Fitness เป็นผู้ควบคุมข้อมูลส่วนบุคคลที่เก็บผ่านเว็บไซต์ www.build-a-bond.com ติดต่อเราได้ตามช่องทางในข้อ 11'],
      },
      {
        h: '2. ข้อมูลที่เราเก็บ',
        list: [
          'ข้อมูลติดต่อและจัดส่ง: ชื่อ-นามสกุล เบอร์โทร อีเมล ที่อยู่จัดส่ง และหมายเหตุที่คุณเขียนถึงร้าน',
          'ข้อมูลคำสั่งซื้อ: สินค้า ตัวเลือก ยอดเงิน สถานะ และเลขพัสดุ',
          'หลักฐานการชำระเงิน: รูปสลิปที่คุณอัปโหลด ซึ่งอาจมีชื่อผู้โอน ชื่อธนาคาร และเลขบัญชีบางส่วน',
          'ข้อมูลในแบบฟอร์ม: คำขอใบเสนอราคาสั่งทำ และข้อมูลธุรกิจ ผู้ติดต่อ เบอร์ LINE ID อีเมล ที่คุณกรอกในหน้าสำหรับธุรกิจ',
          'ข้อมูลทางเทคนิค: ประเทศที่คุณเข้าใช้งาน (ดูจาก IP เพื่อเลือกภาษาเริ่มต้น) และ IP address ที่ใช้ชั่วคราวเพื่อป้องกันการสุ่มเดาข้อมูลลูกค้า',
        ],
        p: ['เราไม่เก็บข้อมูลบัตรเครดิต เพราะร้านรับชำระด้วยการโอนเงินหรือพร้อมเพย์เท่านั้น'],
      },
      {
        h: '3. วัตถุประสงค์และฐานทางกฎหมาย',
        list: [
          'จัดการคำสั่งซื้อ ตรวจสอบการชำระเงิน จัดส่งสินค้า และติดต่อคุณเรื่องคำสั่งซื้อ (เพื่อปฏิบัติตามสัญญาซื้อขาย)',
          'จดจำที่อยู่จากคำสั่งซื้อครั้งก่อน เพื่อเติมให้อัตโนมัติเมื่อคุณกรอกอีเมลและเบอร์โทรเดิม และบันทึกประวัติการเปลี่ยนแปลงข้อมูลติดต่อ (ประโยชน์โดยชอบด้วยกฎหมาย เพื่อความสะดวกและความถูกต้องในการจัดส่ง)',
          'ตอบคำขอใบเสนอราคาและคำถามจากลูกค้าธุรกิจ (ขั้นตอนก่อนเข้าทำสัญญาตามคำขอของคุณ)',
          'ป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต เช่น จำกัดจำนวนครั้งการตรวจสอบข้อมูลลูกค้า (ประโยชน์โดยชอบด้วยกฎหมายด้านความปลอดภัย)',
          'เก็บเอกสารทางบัญชีและภาษี (ปฏิบัติตามกฎหมาย)',
        ],
        p: ['เราไม่ส่งข่าวสารการตลาดถึงคุณ หากไม่ได้รับความยินยอมจากคุณก่อน'],
      },
      {
        h: '4. การเปิดเผยข้อมูล',
        list: [
          'บริษัทขนส่ง เช่น ไปรษณีย์ไทย หรือนิ่มเอ็กซ์เพรส ได้รับชื่อ ที่อยู่ และเบอร์โทรเพื่อจัดส่งสินค้า',
          'ผู้ให้บริการระบบที่ประมวลผลข้อมูลแทนเรา ได้แก่ Vercel (โฮสต์เว็บไซต์และเก็บรูปภาพ) และ Neon (ฐานข้อมูล) ซึ่งใช้ข้อมูลตามคำสั่งของเราเท่านั้น',
          'หน่วยงานของรัฐ เมื่อกฎหมายกำหนด',
        ],
        p: ['เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณ'],
      },
      {
        h: '5. การส่งข้อมูลไปต่างประเทศ',
        p: ['ระบบของเว็บไซต์และฐานข้อมูลตั้งอยู่ที่ประเทศสิงคโปร์ ผู้ให้บริการมีมาตรการรักษาความปลอดภัยของข้อมูลตามมาตรฐานสากล'],
      },
      {
        h: '6. ระยะเวลาการเก็บข้อมูล',
        list: [
          'ข้อมูลคำสั่งซื้อและหลักฐานการชำระเงิน: เก็บตามระยะเวลาที่กฎหมายบัญชีและภาษีกำหนด',
          'ข้อมูลลูกค้าที่ใช้เติมที่อยู่และประวัติการเปลี่ยนแปลง: เก็บจนกว่าคุณจะขอให้ลบ',
          'คำขอใบเสนอราคาและข้อมูลลูกค้าธุรกิจ: เก็บเท่าที่จำเป็นในการติดต่อกลับและทำธุรกิจร่วมกัน',
          'IP address สำหรับป้องกันการสุ่มเดา: ลบโดยอัตโนมัติภายในประมาณ 1 วัน',
        ],
      },
      {
        h: '7. คุกกี้และข้อมูลที่เก็บในเบราว์เซอร์',
        list: [
          'คุกกี้ภาษา (lang): จำภาษาที่คุณเลือก',
          'ตะกร้าสินค้า: เก็บในเบราว์เซอร์ของคุณเท่านั้น',
          'ข้อมูลที่คุณเลือก "จำข้อมูลของฉันไว้ในเครื่องนี้": ชื่อ เบอร์ อีเมล และที่อยู่ เก็บในเบราว์เซอร์ของคุณ ล้างได้ด้วยลิงก์ "ไม่ใช่คุณ? ล้างข้อมูล" ในหน้าชำระเงิน หรือล้างข้อมูลเว็บไซต์ในเบราว์เซอร์',
        ],
        p: ['เราไม่ใช้คุกกี้โฆษณาหรือคุกกี้ติดตามจากบุคคลที่สาม'],
      },
      {
        h: '8. สิทธิของคุณ',
        p: [
          'คุณมีสิทธิขอเข้าถึงและขอสำเนาข้อมูล ขอแก้ไขให้ถูกต้อง ขอให้ลบหรือทำให้ไม่สามารถระบุตัวตนได้ ขอให้ระงับการใช้ คัดค้านการประมวลผล ขอรับหรือโอนย้ายข้อมูล และถอนความยินยอมที่เคยให้ไว้ โดยติดต่อเราตามข้อ 11 เราอาจขอยืนยันตัวตนก่อนดำเนินการ',
          'หากเห็นว่าเราไม่ปฏิบัติตามกฎหมาย คุณมีสิทธิร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.)',
        ],
      },
      {
        h: '9. ความปลอดภัยของข้อมูล',
        list: [
          'เว็บไซต์เชื่อมต่อแบบเข้ารหัส (HTTPS)',
          'หลังบ้านเข้าได้เฉพาะผู้ดูแลร้านที่มีรหัสผ่าน',
          'ลิงก์หน้าคำสั่งซื้อของคุณมีรหัสลับเฉพาะ และการค้นหาที่อยู่จากอีเมลและเบอร์โทรถูกจำกัดจำนวนครั้ง',
        ],
      },
      {
        h: '10. การเปลี่ยนแปลงนโยบาย',
        p: ['เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว และจะแสดงวันที่ปรับปรุงล่าสุดไว้ด้านบนของหน้านี้'],
      },
    ],
    contactLead: '11. ติดต่อเรา: สอบถามหรือใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคลได้ทาง',
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated 17 November 2026',
    intro:
      'Buildabond ("we") cares about your personal data. This policy explains what we collect, why we use it, who we share it with, how long we keep it and your rights, under Thailand’s Personal Data Protection Act B.E. 2562 (PDPA).',
    sections: [
      {
        h: '1. Data controller',
        p: ['Buildabond Active Play & Fitness is the data controller for personal data collected through www.build-a-bond.com. See section 11 to contact us.'],
      },
      {
        h: '2. What we collect',
        list: [
          'Contact and delivery details: full name, phone number, email, delivery address and any note you write to the shop.',
          'Order details: products, options, amounts, status and tracking number.',
          'Proof of payment: the slip image you upload, which may show the sender’s name, bank and part of an account number.',
          'Form details: custom-size quote requests, and the business, contact name, phone, LINE ID and email you enter on the business page.',
          'Technical data: the country you visit from (from your IP address, to choose the default language) and your IP address, kept briefly to prevent guessing of customer details.',
        ],
        p: ['We don’t collect card details: the shop only accepts bank transfer or PromptPay.'],
      },
      {
        h: '3. Why we use it, and the legal basis',
        list: [
          'To process orders, check payments, deliver products and contact you about your order (performance of the sales contract).',
          'To remember your address from a previous order and fill it in when you enter the same email and phone, and to keep a history of changes to your contact details (legitimate interest in convenient, accurate delivery).',
          'To answer quote requests and business enquiries (steps you asked for before entering a contract).',
          'To prevent unauthorised access, for example by limiting how often customer details can be checked (legitimate interest in security).',
          'To keep accounting and tax records (legal obligation).',
        ],
        p: ['We don’t send you marketing without your prior consent.'],
      },
      {
        h: '4. Who we share it with',
        list: [
          'Delivery companies, such as Thailand Post or Nim Express, receive your name, address and phone number to deliver your order.',
          'Service providers that process data on our behalf: Vercel (website hosting and image storage) and Neon (database). They use it only on our instructions.',
          'Government authorities, where the law requires.',
        ],
        p: ['We don’t sell or rent your personal data.'],
      },
      {
        h: '5. Transfers outside Thailand',
        p: ['The website and database run in Singapore. Our providers protect data with internationally recognised security measures.'],
      },
      {
        h: '6. How long we keep it',
        list: [
          'Orders and proof of payment: for as long as accounting and tax law requires.',
          'Customer details used to fill in your address, and their change history: until you ask us to delete them.',
          'Quote requests and business enquiries: as long as needed to get back to you and work together.',
          'IP addresses used to prevent guessing: deleted automatically within about a day.',
        ],
      },
      {
        h: '7. Cookies and data stored in your browser',
        list: [
          'Language cookie (lang): remembers the language you chose.',
          'Shopping cart: stored only in your browser.',
          'Details you choose to "remember on this device": name, phone, email and address, stored in your browser. Clear them with "Not you? Clear details" at checkout, or by clearing this site’s data in your browser.',
        ],
        p: ['We don’t use advertising or third-party tracking cookies.'],
      },
      {
        h: '8. Your rights',
        p: [
          'You can ask to access and get a copy of your data, correct it, delete or anonymise it, restrict or object to its use, receive or transfer it, and withdraw any consent you gave, by contacting us (section 11). We may need to confirm your identity first.',
          'If you believe we haven’t followed the law, you can complain to Thailand’s Office of the Personal Data Protection Committee (PDPC).',
        ],
      },
      {
        h: '9. Security',
        list: [
          'The website uses an encrypted connection (HTTPS).',
          'Only shop staff with the password can open the admin.',
          'Your order page link contains a secret key, and looking up an address by email and phone is rate limited.',
        ],
      },
      {
        h: '10. Changes to this policy',
        p: ['We may update this policy from time to time and will show the date of the latest update at the top of this page.'],
      },
    ],
    contactLead: '11. Contact us: for questions or to use your rights over your personal data, reach us on',
  },
};
