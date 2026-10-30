import type { FlowNode as PlayerFlowNode, PlayerStep } from '@/components/player/step-player';
import {
  BINARY32,
  type FloatFormat,
  type Op,
  type RangeOutcome,
  type RoundDecision,
  type SpecialRule,
  type Step,
  bias,
  expFieldMax,
  width,
} from '@/lib/fp';

/** Thai text for engine steps. The engine only produces data; every sentence lives here. */

export const OP_SYMBOL: Record<Op, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
export const OP_NAME: Record<Op, string> = { '+': 'บวก', '-': 'ลบ', '*': 'คูณ', '/': 'หาร' };

type FlowName = 'add' | 'mul' | 'div' | 'encode' | 'decode';

/** Flowchart boxes of each process; numbers come from the format (binary32: bias 127, 32 bits). */
export function flows(fmt: FloatFormat = BINARY32): Record<FlowName, PlayerFlowNode[]> {
  const b = bias(fmt);
  const all = `รวมเป็น ${width(fmt)} บิต`;
  return {
    add: [
      { id: 'decode', label: 'แยก Sign / Exponent / Significand' },
      { id: 'special', label: 'ค่าพิเศษ?' },
      { id: 'compare', label: 'เทียบ Exponent' },
      { id: 'align', label: 'เลื่อนให้ Exponent เท่ากัน' },
      { id: 'significand', label: 'บวก/ลบ Significand' },
      { id: 'normalize', label: 'Normalize' },
      { id: 'range', label: 'Overflow / Underflow?' },
      { id: 'round', label: 'ปัดเศษ' },
      { id: 'encode', label: all },
    ],
    mul: [
      { id: 'decode', label: 'แยก Sign / Exponent / Significand' },
      { id: 'special', label: 'ค่าพิเศษ?' },
      { id: 'sign', label: 'Sign = XOR' },
      { id: 'exponent', label: `EA + EB − ${b}` },
      { id: 'significand', label: 'คูณ Significand' },
      { id: 'normalize', label: 'Normalize' },
      { id: 'range', label: 'Overflow / Underflow?' },
      { id: 'round', label: 'ปัดเศษ + ยัง normalized?' },
      { id: 'encode', label: all },
    ],
    div: [
      { id: 'decode', label: 'แยก Sign / Exponent / Significand' },
      { id: 'special', label: 'ค่าพิเศษ?' },
      { id: 'sign', label: 'Sign = XOR' },
      { id: 'exponent', label: `EA − EB + ${b}` },
      { id: 'significand', label: 'หาร Significand' },
      { id: 'normalize', label: 'Normalize' },
      { id: 'range', label: 'Overflow / Underflow?' },
      { id: 'round', label: 'ปัดเศษ + ยัง normalized?' },
      { id: 'encode', label: all },
    ],
    encode: [
      { id: 'to-binary', label: 'แปลงเป็นฐานสอง' },
      { id: 'normalize', label: 'Normalize' },
      { id: 'sign', label: 'Sign' },
      { id: 'exponent', label: 'Biased exponent' },
      { id: 'range', label: 'อยู่ในช่วงไหม?' },
      { id: 'round', label: `Fraction ${fmt.fracBits} บิต + ปัดเศษ` },
      { id: 'encode', label: all },
    ],
    decode: [
      { id: 'fields', label: 'แยก 3 ส่วน' },
      { id: 'classify', label: 'ดูประเภท' },
      { id: 'sign', label: 'Sign' },
      { id: 'exponent', label: `Exponent − ${b}` },
      { id: 'significand', label: 'Significand' },
      { id: 'value', label: 'คำนวณค่า' },
    ],
  };
}

/** binary32 flows used by the chapters. */
export const FLOWS = flows();

export const flowFor = (op: Op, fmt: FloatFormat = BINARY32) => {
  const f = flows(fmt);
  return op === '*' ? f.mul : op === '/' ? f.div : f.add;
};

export function stepTitle(s: Step, op?: Op, fmt: FloatFormat = BINARY32): string {
  switch (s.kind) {
    case 'decode':
      return `แยกส่วนของ ${s.operand}`;
    case 'negate':
      return 'ลบ = บวกด้วย −B';
    case 'special':
      return 'กรณีพิเศษ';
    case 'sign':
      return s.rule === 'xor' ? 'Sign ด้วย XOR' : 'Sign bit';
    case 'exponent':
      switch (s.mode) {
        case 'compare':
          return 'เทียบ Exponent';
        case 'add-bias':
          return 'Exponent: บวกแล้วลบ Bias';
        case 'sub-bias':
          return 'Exponent: ลบแล้วบวก Bias';
        case 'encode-bias':
          return 'Biased exponent';
        case 'decode-bias':
          return 'Exponent จริง';
      }
      break;
    case 'align':
      return 'เลื่อนให้ Exponent เท่ากัน';
    case 'sig-add':
      return s.op === '+' ? 'บวก Significand' : 'ลบ Significand';
    case 'sig-mul':
      return 'คูณ Significand';
    case 'sig-div':
      return 'หาร Significand';
    case 'normalize':
      return 'Normalize';
    case 'range':
      return op === undefined ? 'ตรวจช่วง' : 'ตรวจ Overflow / Underflow';
    case 'round':
      return 'ปัดเศษด้วย G/R/S';
    case 'encode':
      return `รวมเป็น ${width(fmt)} บิต`;
    case 'int-binary':
      return 'ส่วนจำนวนเต็มเป็นฐานสอง';
    case 'frac-binary':
      return 'ส่วนเศษ: คูณ 2 ซ้ำ';
    case 'point':
      return 'Normalize: เลื่อนจุด';
    case 'fields':
      return 'แยก 3 ส่วน';
    case 'classify':
      return 'ดูประเภทจาก Exponent';
    case 'significand':
      return 'Significand';
    case 'value':
      return 'คำนวณค่า';
  }
  return (s as Step).id;
}

export function toPlayerSteps(steps: Step[], op?: Op, fmt: FloatFormat = BINARY32): PlayerStep[] {
  return steps.map((s) => ({ id: s.id, title: stepTitle(s, op, fmt), flow: s.flow }));
}

export const SPECIAL_TEXT: Record<SpecialRule, { rule: string; why: string }> = {
  'zero-input': {
    rule: 'ศูนย์เก็บแบบพิเศษ: Exponent และ Fraction เป็น 0 ทั้งหมด',
    why: 'ศูนย์เขียนในรูป 1.xxx × 2ᵉ ไม่ได้ จึงมีรูปแบบบิตของตัวเอง และมีทั้ง +0 กับ −0 ตาม Sign',
  },
  'inf-input': {
    rule: '∞ เก็บเป็น Exponent = 1 ทั้งหมด และ Fraction = 0',
    why: 'IEEE 754 จองรูปแบบนี้ไว้แทนค่าที่ใหญ่เกินช่วง',
  },
  'nan-input': {
    rule: 'NaN เก็บเป็น Exponent = 1 ทั้งหมด และ Fraction ไม่เป็น 0',
    why: 'NaN (Not a Number) ใช้แทนผลที่ไม่มีความหมาย',
  },
  'nan-operand': {
    rule: 'มี NaN อยู่ในการคำนวณ ผลเป็น NaN เสมอ',
    why: 'ค่าที่ไม่มีความหมายนำไปคำนวณต่อก็ยังไม่มีความหมาย',
  },
  'inf-minus-inf': {
    rule: '(+∞) + (−∞) = NaN',
    why: 'สองค่าที่ใหญ่ไม่จำกัดหักล้างกันแล้วไม่รู้ว่าเหลือเท่าไร จึงเป็น Invalid operation',
  },
  'inf-operand': {
    rule: '∞ บวก/ลบกับค่าจำกัด ได้ ∞ ตัวเดิม',
    why: 'ค่าจำกัดใด ๆ ไม่ทำให้ ∞ เปลี่ยน',
  },
  'zero-plus-zero': {
    rule: '(±0) + (±0): ได้ −0 เฉพาะเมื่อทั้งคู่เป็น −0 นอกนั้นได้ +0',
    why: 'เป็นกฎของ IEEE 754 เมื่อปัดแบบ round to nearest',
  },
  'add-zero': {
    rule: 'x + 0 = x',
    why: 'บวกศูนย์แล้วค่าไม่เปลี่ยน จึงได้บิตของ x เดิมทันที',
  },
  'zero-times-inf': {
    rule: '0 × ∞ = NaN',
    why: 'ไม่มีคำตอบที่ถูกต้องทางคณิตศาสตร์ จึงเป็น Invalid operation',
  },
  'inf-times': {
    rule: '∞ × x = ±∞ (x ไม่เป็น 0) · Sign = XOR',
    why: 'คูณค่าที่ใหญ่ไม่จำกัดด้วยค่าที่ไม่ใช่ศูนย์ยังใหญ่ไม่จำกัด',
  },
  'zero-times': {
    rule: '0 × x = ±0 · Sign = XOR',
    why: 'คูณด้วยศูนย์ได้ศูนย์ แต่ Sign ยังคิดด้วย XOR ตามปกติ',
  },
  'inf-div-inf': {
    rule: '∞ ÷ ∞ = NaN',
    why: 'ไม่รู้ว่าค่าไหนใหญ่กว่ากันเท่าไร จึงเป็น Invalid operation',
  },
  'zero-div-zero': {
    rule: '0 ÷ 0 = NaN',
    why: 'ไม่มีคำตอบที่ถูกต้องทางคณิตศาสตร์ จึงเป็น Invalid operation',
  },
  'inf-div': {
    rule: '∞ ÷ x = ±∞ (x เป็นค่าจำกัด) · Sign = XOR',
    why: 'หารค่าที่ใหญ่ไม่จำกัดด้วยค่าจำกัดยังใหญ่ไม่จำกัด',
  },
  'div-inf': {
    rule: 'x ÷ ∞ = ±0 (x เป็นค่าจำกัด) · Sign = XOR',
    why: 'หารด้วยค่าที่ใหญ่ไม่จำกัดได้ค่าที่เข้าใกล้ศูนย์',
  },
  'div-zero': {
    rule: 'x ÷ 0 = ±∞ (x ไม่เป็น 0) · Sign = XOR',
    why: 'IEEE 754 ให้ผลเป็น ∞ และแจ้ง Division by zero แทนที่จะหยุดโปรแกรม',
  },
  'zero-div': {
    rule: '0 ÷ x = ±0 (x ไม่เป็น 0) · Sign = XOR',
    why: 'ศูนย์หารด้วยค่าใด ๆ ได้ศูนย์',
  },
};

export const ROUND_TEXT: Record<RoundDecision, { short: string; why: string }> = {
  exact: {
    short: 'ไม่ต้องปัด',
    why: 'G = R = S = 0 ไม่มีบิต 1 ถูกตัดทิ้ง ค่าที่เก็บได้ตรงพอดี',
  },
  down: {
    short: 'ปัดลง',
    why: 'G = 0 ส่วนที่ตัดทิ้งน้อยกว่าครึ่งหนึ่งของบิตสุดท้าย จึงตัดทิ้งไปเฉย ๆ',
  },
  up: {
    short: 'ปัดขึ้น',
    why: 'G = 1 และ R หรือ S เป็น 1 ส่วนที่ตัดทิ้งมากกว่าครึ่ง จึงบวก 1 ที่บิตสุดท้าย',
  },
  'tie-even-down': {
    short: 'กึ่งกลางพอดี → ปัดลง',
    why: 'G = 1, R = S = 0 คืออยู่กึ่งกลางพอดี (tie) บิตสุดท้ายเป็น 0 อยู่แล้ว (เลขคู่) จึงไม่ต้องบวก',
  },
  'tie-even-up': {
    short: 'กึ่งกลางพอดี → ปัดขึ้นเป็นเลขคู่',
    why: 'G = 1, R = S = 0 คืออยู่กึ่งกลางพอดี (tie) บิตสุดท้ายเป็น 1 (เลขคี่) จึงบวก 1 ให้บิตสุดท้ายเป็น 0',
  },
};

export function rangeText(outcome: RangeOutcome, fmt: FloatFormat = BINARY32): string {
  const max = expFieldMax(fmt) - 1;
  switch (outcome) {
    case 'ok':
      return `Biased exponent อยู่ในช่วง 1–${max} เก็บเป็นค่า normalized ได้`;
    case 'overflow':
      return `Biased exponent เกิน ${max} ใหญ่เกินกว่าที่เก็บได้ → Overflow ผลเป็น ±∞`;
    case 'underflow-subnormal':
      return 'Biased exponent ต่ำกว่า 1 เล็กกว่าค่า normalized ที่เล็กที่สุด → Underflow เลื่อน Significand ไปทางขวาเพื่อเก็บเป็น Subnormal (Exponent field = 0)';
    case 'underflow-zero':
      return 'Biased exponent ต่ำกว่า 1 มากจนเลื่อนแล้วไม่เหลือบิตไหนเลย → Underflow ผลเป็น ±0';
  }
}

export const FLAG_TEXT = {
  inexact: 'Inexact (ปัดเศษแล้วไม่ตรง)',
  overflow: 'Overflow',
  underflow: 'Underflow',
  divideByZero: 'Division by zero',
  invalid: 'Invalid operation',
} as const;

export const CLASS_TEXT = {
  zero: 'ศูนย์',
  subnormal: 'Subnormal',
  normal: 'Normal',
  infinity: 'Infinity',
  nan: 'NaN',
} as const;

export const PARSE_ERROR_TEXT: Record<string, string> = {
  empty: 'กรุณาพิมพ์ตัวเลข',
  comma: 'ใช้จุด (.) เป็นจุดทศนิยม ไม่ใช้ลูกน้ำ (,)',
  'too-long': 'ตัวเลขยาวเกินไป (ไม่เกิน 200 ตัวอักษร)',
  'exponent-range': 'เลขยกกำลังใหญ่เกินไป (ไม่เกิน e±100000)',
  invalid: 'รูปแบบตัวเลขไม่ถูกต้อง ตัวอย่างที่ใช้ได้: 5.75, -13.25, 1e-8, inf, nan',
  'out-of-range': 'ต้องเป็นเศษส่วนที่ 0 ≤ x < 1 เช่น 0.1, 0.375',
  'uint-range': 'ต้องอยู่ระหว่าง 0 ถึง 255 (8 บิต)',
  'uint-invalid': 'พิมพ์เป็นจำนวนเต็ม 0 ถึง 255 เท่านั้น',
  'bits-empty': 'กรุณาพิมพ์บิต',
  'bits-char': 'ใช้ได้เฉพาะ 0 และ 1 (เว้นวรรคหรือขีดคั่นได้)',
  'bits-length': 'ต้องมีครบ 32 บิต',
  'hex-char': 'ใช้ได้เฉพาะ 0–9 และ A–F',
  'hex-length': 'ต้องมี 8 หลักพอดี (เช่น 40B80000)',
};
