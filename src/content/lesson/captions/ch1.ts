import type { CaptionTable } from './types';

export const CH1: CaptionTable = {
  'int.add.start': () => 'บวกจากหลักขวาสุดไปซ้าย ทีละหลัก',
  'int.add.column': (p) => `หลัก ${p.i}: ${p.a} + ${p.b} + ทด ${p.cin} = ${p.sum} ทด ${p.cout}`,
  'int.add.rest': () => 'หลักที่เหลือเป็น 0 ทั้งหมด',
  'int.add.end': (p) => `ได้ ${p.bits}₂ = ${p.dec}`,
  'int.add.carryOut': (p) => `ได้ ${p.bits}₂ และมีตัวทดหลุดหลักซ้ายสุด (เกินช่วง)`,
  'int.sub.rewrite': (p) => `${p.a} − ${p.b} = ${p.a} + (−${p.b})`,
  'int.sub.invert': (p) => `Binvert = 1: กลับทุกบิตของ ${p.b}`,
  'int.sub.carryIn': (p) => `CarryIn = 1: บวกเพิ่ม 1 ได้ −${p.b} แบบ two's complement`,
  'int.sub.add': () => 'บวกด้วย adder ตัวเดิม',
  'int.sub.end': (p) => `ได้ ${p.bits}₂ = ${p.dec} ตัวทดที่หลุดซ้ายสุดทิ้งได้`,
  'int.wheel.range': (p) => `4 บิตแบบ two's complement เก็บได้ ${p.min} ถึง ${p.max}`,
  'int.wheel.start': (p) => `เริ่มที่ ${p.a}`,
  'int.wheel.walk': (p) => `เดิน ${p.steps} ช่อง${p.dir === 'cw' ? 'ตามเข็ม' : 'ทวนเข็ม'}`,
  'int.wheel.ok': (p) => `ได้ ${p.r} ถูกต้อง`,
  'int.wheel.overflow': (p) =>
    `ข้ามรอยต่อ ${p.max} กับ ${p.min} ได้ ${p.r} แทน ${p.truth}: overflow`,
  'int.wheel.rule': () => 'บวก + บวก ได้ลบ หรือ ลบ + ลบ ได้บวก แปลว่า overflow',
  'int.shift.live': (p) => `เลื่อนขวา ${p.s} ตำแหน่ง = หาร 2 ไป ${p.s} ครั้ง ได้ ${p.dec}`,
};
