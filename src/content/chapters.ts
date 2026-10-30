export type ChapterSlug =
  'number-systems' | 'binary-fractions' | 'ieee-754' | 'add-sub' | 'mul-div';

export type IconName = 'binary' | 'divide-fraction' | 'cpu' | 'plus-minus' | 'x' | 'flask';

export interface Chapter {
  number: number;
  slug: ChapterSlug;
  href: `/learn/${ChapterSlug}`;
  /** Full title (requirement FR-01). */
  title: string;
  /** Short label for menus. */
  short: string;
  /** One line about what the learner gets. */
  blurb: string;
  objectives: string[];
  readMinutes: number;
  icon: IconName;
}

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    slug: 'number-systems',
    href: '/learn/number-systems',
    title: 'ระบบเลขฐานและการคำนวณเลขฐานสอง',
    short: 'เลขฐานสอง',
    blurb: 'ค่าประจำหลัก น้ำหนักของแต่ละบิต และการแปลงเลขฐานสอง 8 บิตเป็นฐานสิบ',
    objectives: [
      'เข้าใจระบบเลขฐานและค่าประจำหลัก',
      'อธิบายความสัมพันธ์ของเลขฐานสิบกับเลขฐานสอง',
      'แปลงเลขฐานสองแบบไม่มีเครื่องหมายเป็นฐานสิบได้',
      'บอกได้ว่าแต่ละบิตเพิ่มค่าให้ผลรวมเท่าไร',
    ],
    readMinutes: 10,
    icon: 'binary',
  },
  {
    number: 2,
    slug: 'binary-fractions',
    href: '/learn/binary-fractions',
    title: 'เศษส่วนฐานสิบและเศษส่วนฐานสอง',
    short: 'เศษส่วนฐานสอง',
    blurb: 'น้ำหนัก 2⁻¹, 2⁻², … การแปลงด้วยการคูณ 2 และทำไม 0.1 ถึงเก็บไม่พอดี',
    objectives: [
      'เข้าใจค่าประจำหลักของเศษส่วนฐานสิบและฐานสอง',
      'คำนวณค่าฐานสิบของเศษส่วนฐานสองได้',
      'แปลงเศษส่วนฐานสิบเป็นฐานสองด้วยการคูณ 2 ซ้ำ',
      'เข้าใจว่าบางค่า เช่น 0.1 ต้องประมาณเมื่อมีบิตจำกัด',
    ],
    readMinutes: 12,
    icon: 'divide-fraction',
  },
  {
    number: 3,
    slug: 'ieee-754',
    href: '/learn/ieee-754',
    title: 'การแทนค่า Floating-Point ตามมาตรฐาน IEEE 754',
    short: 'IEEE 754',
    blurb: 'Sign, Exponent, Fraction ของ Single Precision · encode และ decode ทีละขั้น',
    objectives: [
      'อธิบายว่าทำไมต้องใช้ Floating-Point',
      'เชื่อม scientific notation ฐานสิบกับรูป 1.xxx × 2ᵉ',
      'ระบุ field Sign, Exponent, Fraction ของ Single Precision ได้',
      'encode เลขฐานสิบเป็น 32 บิตและ decode กลับได้',
    ],
    readMinutes: 18,
    icon: 'cpu',
  },
  {
    number: 4,
    slug: 'add-sub',
    href: '/learn/add-sub',
    title: 'การบวกและการลบเลข Floating-Point',
    short: 'บวก/ลบ',
    blurb: 'ปรับ Exponent ให้เท่ากัน บวก/ลบ Significand, Normalize และปัดด้วย Guard/Round/Sticky',
    objectives: [
      'เข้าใจว่าทำไมบวกเลข Floating-Point ตรง ๆ ไม่ได้',
      'อธิบายขั้นตอนหลักของการบวกและลบได้',
      'ติดตามขั้นตอนระหว่างการคำนวณได้',
      'เห็นว่าการปัดเศษทำให้ผลต่างจากคำตอบแม่นยำได้อย่างไร',
    ],
    readMinutes: 18,
    icon: 'plus-minus',
  },
  {
    number: 5,
    slug: 'mul-div',
    href: '/learn/mul-div',
    title: 'การคูณและการหารเลข Floating-Point',
    short: 'คูณ/หาร',
    blurb: 'XOR หา Sign, แก้ Bias ของ Exponent, partial product, การหารยาว และกรณีพิเศษ',
    objectives: [
      'อธิบายได้ว่าทำไมคูณ/หารไม่ต้องปรับ Exponent ให้เท่ากันแต่ต้องแก้ Bias',
      'หา Sign ด้วย XOR และคำนวณ Biased Exponent ของผลคูณและผลหาร',
      'คูณ Significand แบบ shift-and-add และหารแบบหารยาวฐานสอง',
      'Normalize และปัดเศษด้วย Guard, Round, Sticky',
      'รู้จัก Overflow, Underflow, การหารด้วยศูนย์ และ NaN',
    ],
    readMinutes: 22,
    icon: 'x',
  },
];

export const LAB = {
  href: '/lab' as const,
  title: 'Lab',
  short: 'Lab',
  blurb: 'แปลงค่าและคำนวณได้ครบ + − × ÷ แล้วส่งลิงก์ตัวอย่างให้เพื่อนเปิดดูขั้นเดียวกันได้',
  icon: 'flask' as IconName,
};

export function chapterBySlug(slug: ChapterSlug): Chapter {
  const c = CHAPTERS.find((x) => x.slug === slug);
  if (!c) throw new Error(`unknown chapter ${slug}`);
  return c;
}
