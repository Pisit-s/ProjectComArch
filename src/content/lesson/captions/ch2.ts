import type { CaptionTable } from './types';

export const CH2: CaptionTable = {
  'c.int': () => 'int ใช้ ALU บวกจำนวนเต็มแบบบทที่ 1',
  'c.float': () => 'float ต้องใช้วงจรบวกอีกแบบ (FPU)',
  'c.print': () => 'พิมพ์ผลออกมา',
  'c.teaser': () => 'พิมพ์ 9 หลักแล้วไม่ใช่ 0.3 พอดี ดูเหตุผลในบทที่ 5',
  'point.not': () => 'ยังไม่ normalized: หน้าจุดต้องมีเลขที่ไม่ใช่ 0 แค่หลักเดียว',
  'point.already': () => 'normalized อยู่แล้ว',
  'point.hopLeft': () => 'เลื่อนจุดไปซ้าย 1 หลัก เลขชี้กำลัง +1',
  'point.hopRight': () => 'เลื่อนจุดไปขวา 1 หลัก เลขชี้กำลัง −1',
  'point.done': () => 'ได้รูป normalized',
  'point.binary': () => 'ฐานสองก็ทำแบบเดียวกัน แต่คูณด้วย 2 ยกกำลัง',
};
