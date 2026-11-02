import { type CaptionTable, neg, pow } from './types';
import { SPECIAL_RULES } from './rules';

export const CH4: CaptionTable = {
  'enc.special': (p) => SPECIAL_RULES[p.rule as keyof typeof SPECIAL_RULES] ?? p.rule,
  'enc.split': (p) => `แยกส่วนเต็ม ${p.int} กับส่วนเศษ ${p.frac}`,
  'enc.int': (p) => `ส่วนเต็ม ${p.int} = ${p.intBin}₂`,
  'enc.times2': (p) => `${p.f} × 2 = ${p.d} ได้บิต ${p.bit}`,
  'enc.loop': (p) => `เศษ ${p.f} เคยเจอแล้ว บิตจะวนซ้ำไม่จบ`,
  'enc.join': (p) => `รวมได้ ${p.bin}₂`,
  'enc.normalize': (p) =>
    p.k === '0'
      ? `อยู่ในรูป 1.xxx แล้ว: ${p.norm} × ${pow(2, p.e)}`
      : `เลื่อนจุด${p.dir === 'left' ? 'ไปซ้าย' : 'ไปขวา'} ${p.k} ตำแหน่ง ได้ ${p.norm} × ${pow(2, p.e)}`,
  'enc.sign': (p) => `Sign = ${p.s}`,
  'enc.exp': (p) => `Exponent = ${neg(p.e)} + 127 = ${p.E} = ${p.Ebits}₂`,
  'enc.sig': () => 'Significand = บิตหลังจุด เติม 0 ให้ครบ 23 บิต',
  'enc.hidden': () => '1 หน้าจุดไม่ต้องเก็บ (hidden bit)',
  'enc.round': () => 'บิตเกิน 23 ตัว ต้องปัดเศษ',
  'enc.hex': (p) => `32 บิต อ่านทีละ 4 บิตได้ ${p.hex}`,
  'enc.inexact': (p) => `เก็บได้แค่ค่าใกล้เคียง: ${p.stored}`,
  'dec.fields': (p) =>
    `แยก 3 ส่วน: s = ${p.s} จึงเป็นค่า${p.s === '1' ? 'ลบ' : 'บวก'}, Exponent, Significand`,
  'dec.exp': (p) => `Exponent ${p.E} − 127 = ${neg(p.e)}`,
  'dec.sig': (p) => `${p.lead ?? '1'}.significand = ${p.sig}₂`,
  'dec.value': (p) =>
    p.sig
      ? `ค่า = ${p.sign}${p.sig}₂ × ${pow(2, p.e)}${p.shifted ? ` = ${p.sign}${p.shifted}₂` : ''} = ${neg(p.value)}`
      : `ค่า = ${neg(p.value)}`,
};
