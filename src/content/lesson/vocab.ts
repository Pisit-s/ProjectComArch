/** Every term on the page (PLAN.md C.4). Each chapter opens with its own terms. */
export interface Vocab {
  term: string;
  /** Short Thai label shown once, in brackets. */
  thai?: string;
  meaning: string;
}

export const VOCAB = {
  carry: { term: 'Carry', thai: 'ตัวทด', meaning: '1 ที่ทดไปหลักถัดไป เมื่อผลรวมในหลักนั้นเกิน 1' },
  fullAdder: {
    term: 'Full adder',
    meaning: 'วงจรบวก 1 หลัก รับ a, b, carry in ให้ sum กับ carry out',
  },
  twosComplement: { term: "Two's complement", meaning: 'วิธีเก็บเลขติดลบ: กลับทุกบิตแล้วบวก 1' },
  overflow: { term: 'Overflow', meaning: 'ผลจริงเกินช่วงที่จำนวนบิตเก็บได้ บิตที่ได้จึงแทนค่าผิด' },
  alu: { term: 'ALU', meaning: 'วงจรคำนวณในซีพียู สั่งได้ว่าจะบวก ลบ AND หรือ OR' },
  shift: { term: 'Shift', meaning: 'ขยับบิตทั้งชุดไปซ้ายหรือขวา เลื่อนขวา 1 ตำแหน่งเท่ากับหาร 2' },

  float: { term: 'float', meaning: 'ชนิดข้อมูลทศนิยม 32 บิตในภาษา C (single precision)' },
  double: {
    term: 'double',
    meaning: 'ชนิดข้อมูลทศนิยม 64 บิต ละเอียดกว่า float (double precision)',
  },
  scientific: {
    term: 'Scientific notation',
    meaning: 'เขียนเลขเป็น ตัวเลข × ฐานยกกำลัง เช่น 0.002 × 10⁴',
  },
  normalized: {
    term: 'Normalized',
    meaning: 'หน้าจุดมีเลขที่ไม่ใช่ 0 แค่ 1 หลัก เช่น 2.34 × 10⁵⁶',
  },
  floatingPoint: { term: 'Floating point', meaning: 'จุดทศนิยมเลื่อนได้ โดยเปลี่ยนเลขชี้กำลังแทน' },
  fpu: {
    term: 'FPU',
    meaning: 'วงจรคำนวณเลข floating-point ในซีพียู ทำ 4 ขั้นของบทที่ 4 ด้วยฮาร์ดแวร์',
  },

  ieee754: {
    term: 'IEEE 754',
    meaning: 'มาตรฐานการเก็บเลข floating-point ที่เกือบทุกเครื่องใช้ (ฉบับแรกปี 1985)',
  },
  sign: { term: 'Sign (s)', meaning: 'บิตเครื่องหมาย: 0 = บวก, 1 = ลบ' },
  exponent: {
    term: 'Exponent',
    meaning: 'เก็บเลขชี้กำลังจริง + 127 (bias) เป็น 8 บิต · อ่านกลับ: Exponent − 127',
  },
  bias: {
    term: 'Bias',
    meaning: 'ค่าที่บวกเพิ่มให้เลขชี้กำลัง จะได้ไม่ต้องเก็บเลขติดลบ (single = 127)',
  },
  significand: {
    term: 'Significand',
    meaning: '23 บิตหลังจุดของ 1.xxx (ตำรา P&H เรียกช่องนี้ว่า fraction)',
  },
  hiddenBit: {
    term: 'Hidden bit',
    meaning: 'เลข 1 หน้าจุดที่ไม่ต้องเก็บ เพราะเลข normalized ขึ้นต้นด้วย 1 เสมอ',
  },

  binaryPoint: { term: 'Binary point', meaning: 'จุดของเลขฐานสอง หลักหลังจุดมีค่า ½, ¼, ⅛, …' },
  timesTwo: {
    term: 'คูณ 2 ซ้ำ',
    meaning: 'แปลงเศษเป็นฐานสอง: คูณ 2 แล้วเก็บเลขหน้าจุดเป็นบิตถัดไป',
  },
  normalize: {
    term: 'Normalize',
    meaning: 'เลื่อนจุดจนเหลือ 1 หน้าจุด แล้วนับว่าเลื่อนไปกี่ตำแหน่ง',
  },
  biasedExponent: {
    term: 'Biased exponent',
    meaning: 'เลขชี้กำลังจริง + 127 แล้วเขียนเป็นฐานสอง 8 บิต',
  },
  hex: { term: 'Hex', meaning: 'อ่าน 4 บิตเป็น 1 หลัก (0–9, A–F) 32 บิตจึงเหลือ 8 หลัก' },

  align: {
    term: 'Align',
    meaning: 'เลื่อน significand ของตัวที่ exponent น้อยกว่าไปทางขวา จน exponent เท่ากัน',
  },
  grs: {
    term: 'Guard, Round, Sticky',
    meaning: '3 บิตที่เก็บเผื่อไว้ท้าย significand ใช้ตัดสินว่าจะปัดขึ้นหรือลง',
  },
  roundEven: {
    term: 'Round to nearest even',
    meaning: 'ปัดไปค่าที่ใกล้ที่สุด ถ้าห่างเท่ากันเลือกตัวที่บิตสุดท้ายเป็น 0',
  },
  lsb: { term: 'LSB', meaning: 'บิตขวาสุดที่เก็บได้ ปัดขึ้นคือบวก 1 ที่บิตนี้' },
  overUnder: {
    term: 'Overflow / Underflow',
    meaning: 'exponent ของผลใหญ่เกินจนเป็น ∞ หรือเล็กเกินกว่าที่เก็บแบบปกติได้',
  },

  smallAlu: {
    term: 'Small ALU',
    meaning: 'ลบ exponent สองตัว ได้ว่าต่างกันเท่าไรและตัวไหนใหญ่กว่า',
  },
  mux: { term: 'MUX', meaning: 'ตัวเลือกสัญญาณ ส่งค่าจากหนึ่งในหลายทางออกไปตามสัญญาณควบคุม' },
  shifter: {
    term: 'Shifter',
    meaning: 'เลื่อนบิตกี่ตำแหน่งก็ได้ในครั้งเดียว (barrel shifter ในสไลด์)',
  },
  bigAlu: { term: 'Big ALU', meaning: 'บวกหรือลบ significand แบบเดียวกับ ALU ในบทที่ 1' },
  control: {
    term: 'Control',
    meaning: 'ดูผลจาก Small ALU กับ sign แล้วสั่ง MUX, shifter และ Big ALU',
  },
  roundingHw: {
    term: 'Rounding hardware',
    meaning: 'ดู G, R, S แล้วตัดสินว่าจะบวก 1 ที่ LSB หรือไม่',
  },
} as const satisfies Record<string, Vocab>;

export type VocabId = keyof typeof VOCAB;
