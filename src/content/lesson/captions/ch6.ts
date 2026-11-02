import type { CaptionTable } from './types';

const DECISION: Record<string, string> = {
  exact: 'ไม่ต้องปัด',
  down: 'ปัดลง',
  up: 'ปัดขึ้น',
  'tie-even-down': 'เสมอ ปัดลงเป็นเลขคู่',
  'tie-even-up': 'เสมอ ปัดขึ้นเป็นเลขคู่',
};

export const CH6: CaptionTable = {
  'hw.unpack': () => 'A กับ B เข้ามา แยก sign, exponent, significand',
  'hw.negate': () => 'ลบ: Control กลับ sign ของ B',
  'hw.swap': () => 'Control สลับให้ตัวที่ใหญ่กว่าไปทาง Big ALU',
  'hw.compare': (p) => `Small ALU: ${p.EA} − ${p.EB} ต่างกัน ${p.diff}`,
  'hw.align': (p) => `MUX ส่งตัวเล็กเข้า Shifter เลื่อนขวา ${p.d} ตำแหน่ง`,
  'hw.add': () => 'Big ALU บวก significand',
  'hw.sub': () => 'Big ALU ลบ significand (Binvert = 1, CarryIn = 1)',
  'hw.normalize': (p) =>
    p.dir === 'none'
      ? 'Normalize: อยู่ในรูป 1.xxx แล้ว ไม่ต้องเลื่อน'
      : `Normalize เลื่อน${p.dir === 'right' ? 'ขวา' : 'ซ้าย'} ${p.k} ตำแหน่ง exponent ${p.dir === 'right' ? '+' : '−'}${p.k}`,
  'hw.round': (p) => `Rounding hardware ดู G R S = ${p.grs}: ${DECISION[p.decision] ?? p.decision}`,
  'hw.pack': (p) => `ได้ผลลัพธ์ ${p.hex}`,
};
