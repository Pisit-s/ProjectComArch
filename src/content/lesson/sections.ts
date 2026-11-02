import type { VocabId } from './vocab';

/**
 * The single source of the page order (PLAN.md 3.0, C.3): ids are the anchors on `/`.
 * Takeaways, bridges and quizzes live in copy.ts / quiz.ts under the same ids.
 */
export type SectionId =
  'binary' | 'float-in-c' | 'ieee754' | 'fp-add' | 'circuit' | 'playground' | 'summary';

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
    title: 'IEEE 754: เก็บและแปลงเลข',
    short: 'IEEE 754',
    hook: 'รู้จัก 32 บิตของ float ก่อน แล้วแปลงเลขทศนิยมเข้าไป และถอดกลับออกมา',
    vocab: ['sign', 'exponent', 'significand', 'hiddenBit', 'normalize', 'timesTwo'],
    // the format first, then write a number into it, read it back, play, then the exceptions
    scenes: [
      { id: 'layout', title: '3.1 รู้จัก 32 บิต' },
      { id: 'encode', title: '3.2 แปลงทศนิยมเป็น 32 บิต' },
      { id: 'decode', title: '3.3 ถอดกลับ' },
      { id: 'bit-play', title: '3.4 กดบิตเล่น' },
      { id: 'special', title: '3.5 ค่าพิเศษ' },
    ],
    source: 'สไลด์ w03c_mult หน้า 14–20 · P&H 3.5',
  },
  {
    id: 'fp-add',
    number: 4,
    title: 'บวกและลบเลข Floating-Point',
    short: 'บวก/ลบ float',
    hook: 'ทำ 4 ขั้น: ทำ exponent ให้เท่ากัน, บวก significand, normalize, ปัดเศษ',
    vocab: ['align', 'grs', 'roundEven', 'lsb', 'overUnder'],
    scenes: [
      { id: 'dec4', title: '4.1 บวกแบบฐานสิบ 4 หลัก' },
      { id: 'fp-add-bits', title: '4.2 บวก' },
      { id: 'fp-sub', title: '4.3 ลบ' },
      { id: 'rounding', title: '4.4 ปัดเศษ' },
      { id: 'slide-fun-fact', title: '4.5 ลองตัวอย่างในสไลด์' },
    ],
    source: 'P&H 3.5 · สไลด์ w03c_mult หน้า 21–22 · IEEE 754-2019',
  },
  {
    id: 'circuit',
    number: 5,
    title: 'วงจรบวก/ลบ Floating-Point',
    short: 'วงจร',
    hook: 'เปิดดูข้างใน FPU: 4 ขั้นเดิมคือกล่องวงจรที่ต่อจาก ALU, MUX และ shifter',
    vocab: ['fpu', 'smallAlu', 'mux', 'shifter', 'bigAlu', 'control'],
    scenes: [{ id: 'circuit-flow', title: '5.1 ข้อมูลไหลผ่านวงจร' }],
    source: 'P&H 3.5 · สไลด์ w03c หน้า 30–33, 36–37 · w04a หน้า 7, 12',
  },
  {
    id: 'playground',
    number: 6,
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
/** Chapters that teach (vocabulary, scenes, quick check): every chapter except the playground. */
export const LESSONS = CHAPTERS.filter((s) => s.id !== 'playground');

export function sectionById(id: SectionId): SectionDef {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown section ${id}`);
  return s;
}
