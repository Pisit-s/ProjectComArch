import type { SectionId } from './sections';

/** Page copy outside the scenes (PLAN.md C.2, C.7, C.9, C.11). */

export const HERO = {
  pill: 'Computer Architecture · บวก ลบ Floating-Point',
  intro:
    'ต่อจากวิชา Digital: จากบวกเลขฐานสองไปจนถึงวงจรบวกเลข floating-point กดเล่นทีละขั้น และลองใส่เลขเองได้',
  prereq: "ควรรู้มาก่อน: เลขฐานสอง, two's complement, full adder",
  start: 'เริ่มเรียน',
  skip: 'ข้ามไปลองเอง',
  teaser: 'ข้างในเกิดอะไรขึ้น เลื่อนลงไปดู',
  replay: 'เล่นซ้ำ',
  /** Captions of the three teaser steps. */
  steps: {
    decimal: 'ในโปรแกรมเราเขียนเลขทศนิยมแบบนี้',
    operands: 'ในเครื่อง float แต่ละตัวเก็บเป็น 32 บิต',
    sum: 'ผลบวกก็ออกมาเป็น 32 บิตเหมือนกัน',
  },
} as const;

export const TAKEAWAY: Partial<Record<SectionId, string>> = {
  binary: 'ลบ = บวกค่าติดลบ วงจรเดียวทำได้ทั้งสองอย่าง แต่รู้จักแค่จำนวนเต็ม',
  'float-in-c': 'float เก็บเลขแบบ ±1.xxx × 2ᵉ: เครื่องหมาย เลขชี้กำลัง และตัวเลขหลังจุด',
  ieee754: 'ค่า = (−1)ˢ × 1.significand × 2^(Exponent − 127)',
  convert: 'ฐานสอง → normalize → exponent + 127 → significand 23 บิต → hex',
  'fp-add': 'align → บวก/ลบ significand → normalize → ปัดเศษ ใช้ทั้งบวกและลบ',
  circuit: 'วงจรบวก float คือ ALU + MUX + shifter ต่อกันตาม 4 ขั้น',
};

export const BRIDGE = {
  binary: 'แล้วถ้าเป็น 6.5 + 3.75 ล่ะ',
  dec4: 'ฐานสองทำ 4 ขั้นเดียวกันทุกอย่าง',
} as const;

/** Chapter 3 fact chips (slide w03c_mult page 14). */
export const FACTS = {
  ieee: 'IEEE Std 754-1985 (ฉบับปัจจุบัน 754-2019)',
  sizes: 'float = single 32 บิต · double = 64 บิต',
} as const;

/** Extra one-liners inside a chapter ("ข้อความอื่นในบท", at most 2 per chapter). */
export const OTHER: Partial<Record<SectionId, string[]>> = {
  binary: [BRIDGE.binary],
  ieee754: [FACTS.ieee, FACTS.sizes],
  'fp-add': [BRIDGE.dec4],
};

/** Icon names are mapped to lucide icons in summary-section.tsx. */
export type SummaryIcon = 'minus' | 'fields' | 'steps' | 'shift' | 'round' | 'circuit';

export const SUMMARY: { text: string; back: SectionId; icon: SummaryIcon }[] = [
  {
    text: 'ลบ = บวกค่าติดลบ ใช้วงจรบวกตัวเดิมได้ทั้งจำนวนเต็มและ floating-point',
    back: 'binary',
    icon: 'minus',
  },
  {
    text: 'float เก็บ 3 ส่วน: sign 1 บิต, exponent 8 บิต (bias 127), significand 23 บิต',
    back: 'ieee754',
    icon: 'fields',
  },
  {
    text: 'บวก/ลบ 4 ขั้น: align → บวก/ลบ significand → normalize → ปัดเศษ',
    back: 'fp-add',
    icon: 'steps',
  },
  { text: 'เลื่อนขวา 1 ตำแหน่งต้องเพิ่ม exponent 1 ค่าเลยเท่าเดิม', back: 'fp-add', icon: 'shift' },
  {
    text: 'G, R, S ทำให้ปัดได้ถูก แต่ผลก็ยังอาจไม่ตรงค่าจริง เช่น 0.1 + 0.2',
    back: 'fp-add',
    icon: 'round',
  },
  {
    text: 'ในวงจร: Small ALU → MUX + Shifter → Big ALU → Normalize → Round',
    back: 'circuit',
    icon: 'circuit',
  },
];

export const FOOTER = {
  about:
    'comkrub · สื่อการสอนวิชา Computer Architecture เรื่องการบวกและลบเลข Floating-Point · คำนวณทุกอย่างใน browser',
  lessons: 'บทเรียน',
  references: 'อ้างอิง',
  madeBy: 'จัดทำโดย',
  instructor: 'อาจารย์ผู้สอน',
  analytics: 'นับผู้เข้าชมด้วย Vercel Web Analytics · ไม่ใช้ cookie เก็บเฉพาะข้อมูลแบบไม่ระบุตัวตน',
  code: 'โค้ดบน GitHub',
} as const;

/** Short labels used by components (each at most 20 graphemes). */
export const UI = {
  play: 'เล่น',
  pause: 'หยุด',
  prev: 'ย้อน',
  next: 'ถัดไป',
  restart: 'เริ่มใหม่',
  speed: 'ความเร็ว',
  present: 'นำเสนอ',
  exitPresent: 'ออก',
  why: 'ทำไม?',
  check: 'ตรวจ',
  correct: 'ถูก',
  wrong: 'ยังไม่ใช่',
  showAll: 'แสดงครบ 24 บิต',
  showLess: 'ย่อ',
  nextUp: 'ไปต่อ',
  copyLink: 'คัดลอกลิงก์',
  copied: 'คัดลอกแล้ว',
  examples: 'ตัวอย่าง',
  bitsView: 'บิต',
  circuitView: 'วงจร',
  chapter: 'บทที่',
  menu: 'เมนูบทเรียน',
  close: 'ปิด',
  home: 'หน้าแรก',
  skipToContent: 'ข้ามไปที่เนื้อหา',
  source: 'อ้างอิง',
  backTo: 'กลับไปบทที่',
  moreZeros: 'อีก',
  inputA: 'A',
  inputB: 'B',
  presenting: 'กำลังนำเสนอ',
  vocab: 'คำศัพท์',
  quiz: 'คำถามเช็ก',
  stepAlign: 'Align',
  stepAdd: 'บวก/ลบ',
  stepNorm: 'Normalize',
  stepRound: 'ปัดเศษ',
  stepOf: 'ขั้น',
  sceneLabel: 'ภาพเคลื่อนไหว',
  opAdd: 'บวก',
  opSub: 'ลบ',
  digits4: 'เก็บได้ 4 หลัก',
  lost: 'หลุดทิ้ง',
  stored: 'ค่าที่เก็บจริง',
  typed: 'ค่าที่พิมพ์',
  diff: 'ต่างกัน',
  result: 'ผลลัพธ์',
  roundDown: 'ปัดลง',
  wireIn: 'เข้า',
  wireOut: 'ออก',
  roundUp: 'ปัดขึ้น',
  exactValue: 'ผลจริง',
} as const;

/** Rows of the rounding rule table (scene 5.4). */
export const ROUND_RULES = [
  { id: 'down', when: 'G = 0', then: 'ปัดลง' },
  { id: 'up', when: 'G = 1, R หรือ S = 1', then: 'ปัดขึ้น' },
  { id: 'tie', when: 'G = 1, R = S = 0', then: 'เลือกตัวที่ LSB = 0' },
] as const;

/** Explanation shown after tapping one bit of a register. */
export const BIT_INFO = {
  bit: 'บิตที่',
  value: 'ค่า',
  bits: 'บิต',
  sign: '0 = ค่าบวก, 1 = ค่าลบ · ตอนนี้เป็น',
  positive: 'ค่าบวก',
  negative: 'ค่าลบ',
  expPos: 'ตำแหน่ง',
  expAdds: 'ใน field Exponent · บิตนี้เพิ่ม',
  expTail: 'ให้ค่า Exponent',
  fracPos: 'ตำแหน่งที่',
  fracWeight: 'หลังจุด น้ำหนัก',
  fracOf: 'ของ Significand',
  fracAdds: 'เพิ่มค่า',
  fracTail: 'ให้ผลลัพธ์',
  special: 'ค่านี้เป็นค่าพิเศษ บิตนี้จึงไม่ได้บอกขนาดของค่า',
  close: 'ปิดคำอธิบายบิต',
} as const;

/** A scene that crashed (error boundary). */
export const TOOL_ERROR = 'ภาพนี้มีปัญหา ลองรีเฟรชหน้า';

/** Input errors (from the engine parser kinds). */
export const INPUT_ERRORS: Record<string, string> = {
  empty: 'กรุณาพิมพ์ตัวเลข',
  comma: 'ใช้จุด (.) เป็นจุดทศนิยม ไม่ใช้ลูกน้ำ (,)',
  'too-long': 'ตัวเลขยาวเกินไป',
  'exponent-range': 'เลขยกกำลังใหญ่เกินไป',
  invalid: 'รูปแบบตัวเลขไม่ถูกต้อง เช่น 6.5, -0.75, 1e-8',
  hex: 'ใส่ hex 8 หลัก เช่น C0A00000',
  range: 'ต้องอยู่ในช่วงที่เก็บได้',
};

export const NOT_FOUND = {
  title: 'ไม่พบหน้านี้',
  body: 'ลิงก์อาจพิมพ์ผิดหรือหน้าถูกย้ายแล้ว บทเรียนทั้งหมดอยู่ในหน้าเดียว',
  home: 'ไปหน้าบทเรียน',
} as const;

export const ERROR_PAGE = {
  title: 'หน้านี้มีปัญหา',
  body: 'เกิดข้อผิดพลาดระหว่างแสดงหน้า ลองโหลดใหม่อีกครั้ง',
  retry: 'ลองอีกครั้ง',
  home: 'ไปหน้าบทเรียน',
} as const;
