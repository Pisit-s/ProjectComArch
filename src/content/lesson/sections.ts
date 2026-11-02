import type { VocabId } from './vocab';

/**
 * The single source of the page order (PLAN.md 3.0, C.3): ids are the anchors on `/`.
 * Takeaways, bridges and quizzes live in copy.ts / quiz.ts under the same ids.
 */
export type SectionId =
  'binary' | 'float-in-c' | 'ieee754' | 'convert' | 'fp-add' | 'circuit' | 'playground' | 'summary';

export interface SceneDef {
  /** Anchor of the scene inside the page. */
  id: string;
  title: string;
}

export interface SectionDef {
  id: SectionId;
  /** Chapter number (0 for the summary). */
  number: number;
  title: string;
  /** Short name for the navigation and the journey map. */
  short: string;
  hook: string;
  vocab: VocabId[];
  scenes: SceneDef[];
  /** Slide pages and book sections the chapter is based on. */
  source?: string;
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'binary',
    number: 1,
    title: 'บวกและลบเลขฐานสอง',
    short: 'บวกลบฐานสอง',
    hook: 'ทบทวนจาก Digital: adder บวกทีละหลัก และใช้วงจรเดียวกันทำการลบ',
    vocab: ['carry', 'fullAdder', 'twosComplement', 'overflow', 'alu', 'shift'],
    scenes: [
      { id: 'int-add', title: '1.1 บวกทีละหลัก' },
      { id: 'int-sub', title: '1.2 ลบด้วย ALU ตัวเดิม' },
      { id: 'overflow', title: '1.3 วงล้อ overflow' },
      { id: 'shift', title: '1.4 เลื่อนบิต' },
    ],
    source: 'สไลด์ w03c หน้า 3–12, 29–33, 36–37 · P&H 3.2',
  },
  {
    id: 'float-in-c',
    number: 2,
    title: 'เลขทศนิยมในโปรแกรม',
    short: 'ทศนิยมใน C',
    hook: 'ภาษา C มี float กับ double สำหรับเลขทศนิยม ข้างในเก็บแบบ scientific notation ฐานสอง',
    vocab: ['float', 'double', 'scientific', 'normalized', 'floatingPoint'],
    scenes: [
      { id: 'c-code', title: '2.1 โค้ด C' },
      { id: 'point', title: '2.2 จุดที่เลื่อนได้' },
    ],
    source: 'สไลด์ w03c_mult หน้า 13',
  },
  {
    id: 'ieee754',
    number: 3,
    title: 'มาตรฐาน IEEE 754',
    short: 'IEEE 754',
    hook: 'ทุกเครื่องเก็บ float แบบเดียวกัน: 32 บิต แบ่งเป็น 3 ส่วน',
    vocab: ['sign', 'exponent', 'bias', 'significand', 'hiddenBit', 'hex'],
    scenes: [
      { id: 'layout', title: '3.1 แบ่ง 32 บิต' },
      { id: 'bit-play', title: '3.2 กดบิตเล่น' },
      { id: 'special', title: '3.3 ค่าพิเศษ' },
    ],
    source: 'สไลด์ w03c_mult หน้า 14–20',
  },
  {
    id: 'convert',
    number: 4,
    title: 'แปลงเลขทศนิยมเป็น IEEE 754',
    short: 'แปลงเลข',
    hook: 'แปลงเป็นฐานสอง เลื่อนจุดให้เป็น 1.xxx แล้วใส่ลงช่องทั้ง 3 ส่วน',
    vocab: ['binaryPoint', 'timesTwo', 'normalize', 'biasedExponent'],
    scenes: [
      { id: 'encode', title: '4.1 แปลงทีละขั้น' },
      { id: 'decode', title: '4.2 ถอดกลับ' },
    ],
    source: 'สไลด์ w03c_mult หน้า 15 · P&H 3.5',
  },
  {
    id: 'fp-add',
    number: 5,
    title: 'บวกและลบเลข Floating-Point',
    short: 'บวก/ลบ float',
    hook: 'ทำ 4 ขั้น: ทำ exponent ให้เท่ากัน, บวก significand, normalize, ปัดเศษ',
    vocab: ['align', 'grs', 'roundEven', 'lsb', 'overUnder'],
    scenes: [
      { id: 'dec4', title: '5.1 บวกแบบฐานสิบ 4 หลัก' },
      { id: 'fp-add-bits', title: '5.2 บวก' },
      { id: 'fp-sub', title: '5.3 ลบ' },
      { id: 'rounding', title: '5.4 ปัดเศษ' },
      { id: 'slide-fun-fact', title: '5.5 ลองตัวอย่างในสไลด์' },
    ],
    source: 'P&H 3.5 · สไลด์ w03c_mult หน้า 21–22 · IEEE 754-2019',
  },
  {
    id: 'circuit',
    number: 6,
    title: 'วงจรบวก/ลบ Floating-Point',
    short: 'วงจร',
    hook: 'เปิดดูข้างใน FPU: 4 ขั้นเดิมคือกล่องวงจรที่ต่อจาก ALU, MUX และ shifter',
    vocab: ['fpu', 'smallAlu', 'mux', 'shifter', 'bigAlu', 'control'],
    scenes: [{ id: 'circuit-flow', title: '6.1 ข้อมูลไหลผ่านวงจร' }],
    source: 'P&H 3.5 · สไลด์ w03c หน้า 30–33, 36–37 · w04a หน้า 7, 12',
  },
  {
    id: 'playground',
    number: 7,
    title: 'ลองเอง',
    short: 'ลองเอง',
    hook: 'ใส่ตัวเลขสองตัว เลือกบวกหรือลบ แล้วดูทั้งแบบบิตและแบบวงจร',
    vocab: [],
    scenes: [],
  },
  {
    id: 'summary',
    number: 0,
    title: 'สรุป',
    short: 'สรุป',
    hook: '',
    vocab: [],
    scenes: [],
  },
];

export const CHAPTERS = SECTIONS.filter((s) => s.number > 0);

export function sectionById(id: SectionId): SectionDef {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown section ${id}`);
  return s;
}
