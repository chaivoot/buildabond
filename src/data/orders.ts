import type { OrderStatus } from '../components/StatusPill';

/** TODO: replace with the real orders API. Demo data mirrors the design. */
export interface AdminOrder {
  id: string;
  name: string;
  phone: string;
  date: string;
  slipTime?: string;
  status: OrderStatus;
  addr: string;
  items: [string, number][];
  kg: number;
  carrier?: string;
  track?: string;
}

export const DEMO_ORDERS: AdminOrder[] = [
  { id: 'BB-261116-0042', name: 'ณัฐกานต์ ใจดี', phone: '081-234-5678', date: '16 พ.ย. 22:51', slipTime: '16 พ.ย. 23:02', status: 'ส่งสลิปแล้ว', addr: '99/12 ซอยสุขุมวิท 50 พระโขนง คลองเตย กรุงเทพฯ 10260', items: [['Place Board ฟ้า + แม่เหล็ก 4', 2590], ['Target Box 10 cm ส้ม', 1690], ['Flirt Pole M เหยื่อชมพู', 890]], kg: 6.7 },
  { id: 'BB-261116-0041', name: 'ภาณุ ศรีสุข', phone: '089-555-1201', date: '16 พ.ย. 20:14', status: 'รอชำระ', addr: '45 ถนนนิมมานเหมินท์ สุเทพ เมือง เชียงใหม่ 50200', items: [['Rabbit Dummy', 1550]], kg: 0.5 },
  { id: 'BB-261116-0040', name: 'ศิริพร วงศ์ทอง', phone: '062-118-4433', date: '16 พ.ย. 18:03', slipTime: '16 พ.ย. 18:20', status: 'ส่งสลิปแล้ว', addr: '12/3 หมู่ 5 บางพูด ปากเกร็ด นนทบุรี 11120', items: [['Narrow Target 35 cm ส้ม', 490], ['Narrow Target 45 cm ส้ม', 590]], kg: 1.2 },
  { id: 'BB-261115-0039', name: 'ธนวัฒน์ แก้วมณี', phone: '095-772-9080', date: '15 พ.ย. 13:40', status: 'ยืนยันแล้ว', addr: '88 ถนนพระราม 9 ห้วยขวาง กรุงเทพฯ 10310', items: [['Oct Box ผสมฟ้า-ส้ม', 3590]], kg: 4.2 },
  { id: 'BB-261115-0038', name: 'กมลชนก ปัญญา', phone: '086-410-2290', date: '15 พ.ย. 09:12', status: 'ยืนยันแล้ว', addr: '7 ซอยลาดพร้าว 71 วังทองหลาง กรุงเทพฯ 10310', items: [['Slant Box 20° ฟ้า + แม่เหล็ก 2', 1890], ['Sheepskin Chaser', 1450]], kg: 3.4 },
  { id: 'BB-261114-0037', name: 'วรเชษฐ์ มั่นคง', phone: '081-900-3321', date: '14 พ.ย. 16:55', status: 'จัดส่งแล้ว', addr: '230 ถนนมิตรภาพ ในเมือง ขอนแก่น 40000', items: [['Flirt Pole S เหยื่อเหลือง', 790]], kg: 0.5, carrier: 'ไปรษณีย์ไทย', track: 'EF551234870TH' },
];

/** Shop bank account shown on the payment page. */
export const BANK = { name: 'ธนาคารกรุงไทย (KTB)', number: '539-1-36496-5', holder: 'Mrs. Natigarn Suwannapet' };
