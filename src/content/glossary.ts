/** Terms used across the site (PLAN.md 7.9). `Term` shows the meaning the first time a term appears. */
export const GLOSSARY = {
  bit: { term: 'บิต (bit)', meaning: 'หลักหนึ่งหลักของเลขฐานสอง มีค่าได้แค่ 0 หรือ 1' },
  place: {
    term: 'ค่าประจำหลัก',
    meaning: 'ค่าที่หลักนั้นมีอยู่แล้วตามตำแหน่ง เช่นหลักร้อยมีค่า 100',
  },
  weight: { term: 'น้ำหนัก (weight)', meaning: 'ค่าประจำหลักของบิต เช่นบิตที่ 3 มีน้ำหนัก 2³ = 8' },
  unsigned: { term: 'Unsigned', meaning: 'จำนวนเต็มที่ไม่มีเครื่องหมาย ทุกบิตใช้เก็บขนาดของค่า' },
  sign: { term: 'Sign', meaning: 'บิตเครื่องหมาย 0 = บวก, 1 = ลบ' },
  exponent: { term: 'Exponent', meaning: 'ส่วนเลขชี้กำลังของ 2 เก็บแบบบวก Bias ไว้' },
  bias: { term: 'Bias', meaning: 'ค่าที่บวกเพิ่มให้ exponent ก่อนเก็บ (Single Precision = 127)' },
  biasedExponent: {
    term: 'Biased exponent',
    meaning: 'ค่าที่อยู่ใน field Exponent จริง = exponent จริง + 127',
  },
  fraction: {
    term: 'Fraction',
    meaning: '23 บิตหลังจุดที่เก็บจริง (บางตำราเรียก mantissa)',
  },
  significand: {
    term: 'Significand',
    meaning: 'ตัวเลข 1.Fraction รวม hidden bit แล้ว ยาว 24 บิต',
  },
  hiddenBit: {
    term: 'Hidden bit',
    meaning: 'เลข 1 หน้าจุดของค่า normalized ที่ไม่ต้องเก็บจริง เพราะรู้อยู่แล้วว่าเป็น 1',
  },
  normalize: { term: 'Normalize', meaning: 'เลื่อนจุดให้อยู่ในรูป 1.xxx × 2ᵉ' },
  grs: {
    term: 'Guard / Round / Sticky',
    meaning:
      '3 บิตถัดจากบิตสุดท้ายที่เก็บได้ ใช้ตัดสินการปัด · Sticky คือ OR ของบิตที่เหลือทั้งหมด',
  },
  roundEven: {
    term: 'Round to nearest, ties to even',
    meaning: 'ปัดไปค่าที่ใกล้ที่สุด ถ้าอยู่กึ่งกลางพอดีให้เลือกตัวที่บิตสุดท้ายเป็น 0',
  },
  overflow: { term: 'Overflow', meaning: 'ผลใหญ่เกินกว่าค่าที่เก็บได้ จึงกลายเป็น ±∞' },
  underflow: {
    term: 'Underflow',
    meaning: 'ผลเล็กกว่าค่า normalized ที่เล็กที่สุด จึงเก็บเป็น Subnormal หรือ 0',
  },
  subnormal: {
    term: 'Subnormal',
    meaning:
      'ค่าที่ field Exponent เป็น 0 ไม่มี hidden bit ใช้เก็บค่าที่เล็กมาก (บางตำราเรียก denormal)',
  },
  infinity: {
    term: 'Infinity (∞)',
    meaning: 'ค่าพิเศษเมื่อ Exponent เป็น 1 ทั้งหมดและ Fraction เป็น 0',
  },
  nan: {
    term: 'NaN',
    meaning:
      'Not a Number: ค่าพิเศษของผลที่ไม่มีความหมาย เช่น 0 ÷ 0 (Exponent เป็น 1 ทั้งหมด Fraction ไม่เป็น 0)',
  },
  partialProduct: {
    term: 'Partial product',
    meaning: 'ผลคูณย่อยแต่ละแถวของการคูณแบบ shift-and-add',
  },
  multiplicand: { term: 'Multiplicand / Multiplier', meaning: 'ตัวตั้ง / ตัวคูณ' },
  dividend: {
    term: 'Dividend / Divisor / Quotient / Remainder',
    meaning: 'ตัวตั้ง / ตัวหาร / ผลหาร / เศษ',
  },
  single: {
    term: 'Single Precision (binary32)',
    meaning: 'รูปแบบ 32 บิต: Sign 1 · Exponent 8 · Fraction 23',
  },
  floatingPoint: {
    term: 'Floating-Point',
    meaning:
      'การเก็บจำนวนจริงในรูป ± significand × 2^exponent ทำให้จุดทศนิยม "ลอย" ไปตามขนาดของค่าได้',
  },
} as const;

export type TermKey = keyof typeof GLOSSARY;
