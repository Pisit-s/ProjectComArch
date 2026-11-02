import type { CaptionTable } from './types';

export const CH3: CaptionTable = {
  'layout.bits': () => 'float หนึ่งตัวมี 32 บิต แบ่งเป็น 3 ส่วน',
  'layout.sign': () => 'บิต 31: Sign บอกเครื่องหมาย 0 = บวก, 1 = ลบ',
  'layout.exp': () => 'บิต 30–23: Exponent เก็บเลขชี้กำลังจริง + 127 จะได้ไม่ติดลบ',
  'layout.sig': () => 'บิต 22–0: Significand คือตัวเลขหลังจุดของ 1.xxx',
  'layout.hidden': () => 'เลข normalized ขึ้นต้นด้วย 1 เสมอ จึงไม่ต้องเก็บ 1 หน้าจุด',
  'layout.formula': () => 'รวม 3 ส่วนเป็นค่า: (−1)ˢ × 1.significand × 2^(Exponent − 127)',
  'layout.plugSign': (p) => `s = ${p.s} จึงเป็นค่า${p.sign === 'neg' ? 'ลบ' : 'บวก'}`,
  'layout.plugExp': (p) => `Exponent = ${p.E} → เลขชี้กำลังจริง ${p.E} − 127 = ${p.e}`,
  'layout.plugSig': (p) => `เติม 1 ที่ซ่อนไว้: 1.significand = ${p.sigDec}`,
  'layout.value': (p) => `${p.sigDec} × 2^${p.e} = ${p.value}`,
  'bitplay.live': (p) => `Exponent เลือกช่วง [${p.lo}, ${p.hi}) · Significand เลือกตำแหน่งในช่วง`,
  'special.zone0': () => 'Exponent = 0: ศูนย์ และเลขที่เล็กกว่าเลขปกติ (subnormal) ไม่มี 1 ที่ซ่อน',
  'special.zoneNormal': () => 'Exponent = 1–254: ตัวเลขปกติ (normalized)',
  'special.zone255': () => 'Exponent = 255: ∞ และ NaN',
  'special.range': (p) => `เล็กสุด ≈ ${p.min} · ใหญ่สุด ≈ ${p.max}`,
  'double.compare': (p) => `double: 1 + ${p.e64} + ${p.f64} บิต bias ${p.b64}`,
};
