import type { CaptionTable } from './types';

export const CH3: CaptionTable = {
  'layout.bits': () => 'float หนึ่งตัวมี 32 บิต',
  'layout.sign': () => 'บิต 31: Sign',
  'layout.exp': () => 'บิต 30–23: Exponent 8 บิต',
  'layout.sig': () => 'บิต 22–0: Significand 23 บิต',
  'layout.formula': () => 'ค่า = (−1)ˢ × 1.significand × 2^(Exponent − 127)',
  'layout.plugSign': (p) => `s = ${p.s} จึงเป็นค่า${p.sign === 'neg' ? 'ลบ' : 'บวก'}`,
  'layout.plugExp': (p) => `Exponent = ${p.E} → เลขชี้กำลังจริง ${p.E} − 127 = ${p.e}`,
  'layout.plugSig': (p) => `เติม 1 ที่ซ่อนไว้: 1.significand = ${p.sigDec}`,
  'layout.value': (p) => `${p.sigDec} × 2^${p.e} = ${p.value}`,
  'bitplay.live': (p) => `Exponent เลือกช่วง [${p.lo}, ${p.hi}) · Significand เลือกตำแหน่งในช่วง`,
  'special.zone0': () => 'Exponent = 0: ศูนย์และ subnormal (ไม่มี 1 ที่ซ่อน)',
  'special.zoneNormal': () => 'Exponent = 1–254: ตัวเลขปกติ (normalized)',
  'special.zone255': () => 'Exponent = 255: ∞ และ NaN',
  'special.range': (p) => `เล็กสุด ≈ ${p.min} · ใหญ่สุด ≈ ${p.max}`,
  'double.compare': (p) => `double: 1 + ${p.e64} + ${p.f64} บิต bias ${p.b64}`,
};
