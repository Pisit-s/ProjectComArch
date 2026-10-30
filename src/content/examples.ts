import type { Op } from '@/lib/fp/simulate';

/**
 * Inputs of every worked example (PLAN.md appendix C). Only inputs live here; bits, hex and
 * stored values are always computed by the engine. Golden tests import these inputs and check
 * the expected bits typed in tests/unit/fp/golden.test.ts.
 */

export interface OpExample {
  id: string;
  op: Op;
  a: string;
  b: string;
  /** Short label for quick-pick buttons. */
  label: string;
  /** What the example teaches. */
  note: string;
  /** Shown as a quick pick in the chapter (the rest appear in the Lab). */
  featured: boolean;
}

export const ADD_SUB_EXAMPLES: OpExample[] = [
  {
    id: 'A1',
    op: '+',
    a: '0.5',
    b: '-0.4375',
    label: '0.5 + (−0.4375)',
    note: 'ลบกันแล้วต้อง Normalize ซ้าย 3 บิต ไม่ต้องปัด',
    featured: true,
  },
  {
    id: 'A2',
    op: '+',
    a: '0.1',
    b: '0.2',
    label: '0.1 + 0.2',
    note: 'ผลไม่ใช่ 0.3 พอดี เพราะ 0.1 และ 0.2 เก็บแบบประมาณ แล้วยังต้องปัดขึ้นอีก',
    featured: true,
  },
  {
    id: 'A3',
    op: '+',
    a: '1',
    b: '1e-8',
    label: '1 + 1e-8',
    note: 'ตัวเล็กถูกเลื่อนจนหลุดหมด เหลือแค่ Sticky จึงหายไปทั้งตัว',
    featured: true,
  },
  {
    id: 'A4',
    op: '+',
    a: '16777216',
    b: '1',
    label: '16777216 + 1',
    note: 'กึ่งกลางพอดี (tie) และบิตสุดท้ายเป็น 0 อยู่แล้ว จึงปัดลง',
    featured: true,
  },
  {
    id: 'A5',
    op: '+',
    a: '16777216',
    b: '3',
    label: '16777216 + 3',
    note: 'กึ่งกลางพอดี (tie) แต่บิตสุดท้ายเป็น 1 จึงปัดขึ้นให้เป็นเลขคู่',
    featured: true,
  },
  {
    id: 'A6',
    op: '-',
    a: '1.0000001',
    b: '1',
    label: '1.0000001 − 1',
    note: 'ลบค่าที่ใกล้กันมาก บิตหน้าหายไปเยอะ ต้อง Normalize ซ้ายหลายบิต',
    featured: true,
  },
];

export const MUL_EXAMPLES: OpExample[] = [
  {
    id: 'M1',
    op: '*',
    a: '1.5',
    b: '2.5',
    label: '1.5 × 2.5',
    note: 'ขั้นตอนพื้นฐาน ผลคูณน้อยกว่า 2 จึงไม่ต้อง Normalize',
    featured: true,
  },
  {
    id: 'M2',
    op: '*',
    a: '0.5',
    b: '-0.4375',
    label: '0.5 × (−0.4375)',
    note: 'Sign ได้จาก XOR และต้องลบ Bias ออกหนึ่งครั้ง',
    featured: true,
  },
  {
    id: 'M3',
    op: '*',
    a: '6.5',
    b: '2.75',
    label: '6.5 × 2.75',
    note: 'partial product 3 แถว ผลคูณ ≥ 2 จึงเลื่อนขวาและ Exponent + 1',
    featured: true,
  },
  {
    id: 'M4',
    op: '*',
    a: '0.1',
    b: '3',
    label: '0.1 × 3',
    note: 'บิตที่ตัดทิ้งเกินครึ่ง จึงปัดขึ้น',
    featured: true,
  },
  {
    id: 'M5',
    op: '*',
    a: '3e38',
    b: '10',
    label: '3e38 × 10',
    note: 'Exponent เกิน 254 จึง Overflow เป็น +∞',
    featured: true,
  },
  {
    id: 'M6',
    op: '*',
    a: '1e-30',
    b: '1e-30',
    label: '1e-30 × 1e-30',
    note: 'ผลเล็กเกินกว่าที่เก็บได้ จึง Underflow เป็น 0',
    featured: true,
  },
  {
    id: 'M7',
    op: '*',
    a: '1e-20',
    b: '1e-20',
    label: '1e-20 × 1e-20',
    note: 'Underflow แต่ยังเก็บเป็น Subnormal ได้',
    featured: false,
  },
  {
    id: 'M8',
    op: '*',
    a: '1.5',
    b: '-6',
    label: '1.5 × (−6)',
    note: 'ผลคูณ ≥ 2 เลื่อนขวา 1 บิต',
    featured: false,
  },
  {
    id: 'M9',
    op: '*',
    a: '0.1',
    b: '0.1',
    label: '0.1 × 0.1',
    note: 'partial product 13 แถว และต้องปัดขึ้น',
    featured: false,
  },
  {
    id: 'M10',
    op: '*',
    a: '-2',
    b: '0',
    label: '(−2) × 0',
    note: 'กฎค่าพิเศษ: ได้ −0 เพราะ Sign = XOR',
    featured: false,
  },
  {
    id: 'M11',
    op: '*',
    a: '0',
    b: 'Infinity',
    label: '0 × ∞',
    note: 'ไม่มีความหมายทางคณิตศาสตร์ ได้ NaN',
    featured: false,
  },
];

export const DIV_EXAMPLES: OpExample[] = [
  {
    id: 'D1',
    op: '/',
    a: '7.5',
    b: '2.5',
    label: '7.5 ÷ 2.5',
    note: 'ขั้นตอนพื้นฐาน ผลหาร ≥ 1 หารลงตัว',
    featured: true,
  },
  {
    id: 'D2',
    op: '/',
    a: '9',
    b: '12',
    label: '9 ÷ 12',
    note: 'ผลหารน้อยกว่า 1 จึงเลื่อนซ้ายและ Exponent − 1',
    featured: true,
  },
  {
    id: 'D3',
    op: '/',
    a: '1',
    b: '3',
    label: '1 ÷ 3',
    note: 'หารไม่ลงตัว เศษที่เหลือกลายเป็น Sticky แล้วปัดขึ้น',
    featured: true,
  },
  {
    id: 'D4',
    op: '/',
    a: '1',
    b: '0',
    label: '1 ÷ 0',
    note: 'หารด้วยศูนย์ ได้ +∞',
    featured: true,
  },
  {
    id: 'D5',
    op: '/',
    a: '0',
    b: '0',
    label: '0 ÷ 0',
    note: 'ไม่มีความหมายทางคณิตศาสตร์ ได้ NaN',
    featured: true,
  },
  {
    id: 'D6',
    op: '/',
    a: '2',
    b: '3',
    label: '2 ÷ 3',
    note: 'หารไม่ลงตัว ปัดขึ้น',
    featured: false,
  },
  {
    id: 'D7',
    op: '/',
    a: '1',
    b: '10',
    label: '1 ÷ 10',
    note: 'ได้ค่าเดียวกับการพิมพ์ 0.1 ตรง ๆ',
    featured: false,
  },
  {
    id: 'D8',
    op: '/',
    a: '-6',
    b: '0.75',
    label: '(−6) ÷ 0.75',
    note: 'Sign = 1 หารลงตัว',
    featured: false,
  },
  {
    id: 'D9',
    op: '/',
    a: '3e38',
    b: '0.1',
    label: '3e38 ÷ 0.1',
    note: 'Overflow เป็น +∞',
    featured: false,
  },
  {
    id: 'D10',
    op: '/',
    a: '1e-30',
    b: '1e10',
    label: '1e-30 ÷ 1e10',
    note: 'Underflow แต่ยังเป็น Subnormal ได้',
    featured: false,
  },
  {
    id: 'D11',
    op: '/',
    a: '1e-38',
    b: '1e10',
    label: '1e-38 ÷ 1e10',
    note: 'ตัวตั้งเป็น Subnormal อยู่แล้ว ผลเล็กเกินจึงเป็น 0',
    featured: false,
  },
  {
    id: 'D12',
    op: '/',
    a: '-1',
    b: '0',
    label: '(−1) ÷ 0',
    note: 'หารด้วยศูนย์ ได้ −∞',
    featured: false,
  },
  {
    id: 'D13',
    op: '/',
    a: '0',
    b: '5',
    label: '0 ÷ 5',
    note: '0 หารด้วยค่าใด ๆ ได้ 0',
    featured: false,
  },
];

/** Special operand values offered as quick picks in Chapter 5 and the Lab. */
export const SPECIAL_OPERANDS: { label: string; value: string }[] = [
  { label: '0', value: '0' },
  { label: '−0', value: '-0' },
  { label: '∞', value: 'Infinity' },
  { label: '−∞', value: '-Infinity' },
  { label: 'NaN', value: 'NaN' },
];

export interface EncodeExample {
  id: string;
  input: string;
  note: string;
}

export const ENCODE_EXAMPLES: EncodeExample[] = [
  { id: 'E1', input: '5.75', note: 'เก็บได้พอดี' },
  { id: 'E2', input: '-13.25', note: 'ค่าติดลบ Sign = 1' },
  { id: 'E3', input: '0.1', note: 'เก็บไม่พอดี ต้องปัดขึ้น' },
  { id: 'E4', input: '0.2', note: 'เก็บไม่พอดี' },
  { id: 'E5', input: '0.3', note: 'เก็บไม่พอดี' },
  { id: 'E6', input: '1', note: 'Exponent จริงเป็น 0' },
  { id: 'E7', input: '0.15625', note: 'เก็บได้พอดี Exponent ติดลบ' },
  { id: 'E8', input: '3.4028235e38', note: 'ค่าจำกัดที่มากที่สุด' },
  { id: 'E9', input: '3.5e38', note: 'ใหญ่เกินช่วง กลายเป็น ∞' },
  { id: 'E10', input: '1e-40', note: 'เล็กมาก เก็บเป็น Subnormal' },
  { id: 'E11', input: '1e-45', note: 'Subnormal ที่เล็กที่สุด' },
  { id: 'E12', input: '7e-46', note: 'เล็กกว่าครึ่งหนึ่งของ Subnormal ที่เล็กที่สุด กลายเป็น 0' },
  {
    id: 'E13',
    input: '1.00000017881393432617187499',
    note: 'ถ้าแปลงผ่าน double ก่อนจะปัดสองครั้งแล้วผิด',
  },
  { id: 'E14', input: '16777217', note: 'กึ่งกลางพอดี เลือกตัวที่บิตสุดท้ายเป็น 0' },
  { id: 'E15', input: '-0', note: 'ศูนย์ติดลบ' },
];

/** Quick picks shown in the Chapter 3 encoder. */
export const ENCODER_PICKS = ['E1', 'E2', 'E3', 'E7', 'E9', 'E10'];

export interface DecodeExample {
  id: string;
  /** Decimal source; the bits shown to the learner come from encoding it with the engine. */
  source: string;
  note: string;
}

export const DECODE_EXAMPLES: DecodeExample[] = [
  { id: 'X1', source: '0.15625', note: 'ค่า normal ทั่วไป' },
  { id: 'X2', source: '1e-45', note: 'Subnormal ที่เล็กที่สุด' },
  { id: 'X3', source: '1.17549435e-38', note: 'ค่า normalized ที่เล็กที่สุด' },
  { id: 'X4', source: '-0', note: 'ศูนย์ติดลบ' },
  { id: 'X5', source: 'Infinity', note: 'Infinity' },
  { id: 'X6', source: 'NaN', note: 'NaN' },
];

export interface FractionExample {
  id: string;
  input: string;
  bits: 8 | 16 | 23 | 32;
}

export const FRACTION_EXAMPLES: FractionExample[] = [
  { id: 'F1', input: '0.375', bits: 8 },
  { id: 'F2', input: '0.625', bits: 8 },
  { id: 'F3', input: '0.1', bits: 16 },
  { id: 'F4', input: '0.1', bits: 23 },
  { id: 'F5', input: '0.1', bits: 8 },
];

export const INTEGER_EXAMPLES = [
  { id: 'I1', bits: '00001010' },
  { id: 'I2', bits: '00001011' },
  { id: 'I3', bits: '11111111' },
];

export const ALL_OP_EXAMPLES = [...ADD_SUB_EXAMPLES, ...MUL_EXAMPLES, ...DIV_EXAMPLES];

export function findExample(id: string): OpExample | undefined {
  return ALL_OP_EXAMPLES.find((e) => e.id === id);
}
