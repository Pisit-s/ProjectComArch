/**
 * Topic registry: the single source of every topic and its status (PLAN.md 2.2, appendix C).
 * Home page, header, mobile menu, footer, sitemap, coming-soon pages and `OpenInSim` all read
 * from here. A WP flips its own topic to `ready` by editing one `status` line.
 */
export type TopicId = 'multiply' | 'divide' | 'floating-point' | 'mips';
export type TopicStatus = 'ready' | 'coming-soon';
export type TopicIconName = 'multiply' | 'divide' | 'floating-point' | 'mips';

export interface Topic {
  id: TopicId;
  kind: 'lesson' | 'simulator';
  /** Order on the home page: lessons 1-3 follow the textbook, then the simulator. */
  order: number;
  href: `/${TopicId}`;
  /** Full name, e.g. "การคูณแบบ MIPS". */
  title: string;
  /** Short name for menus, e.g. "คูณ". */
  short: string;
  /** One line on the card. */
  blurb: string;
  /** What the learner gets (cards and the coming-soon page). */
  covers: string[];
  /** e.g. "Patterson & Hennessy หัวข้อ 3.3". */
  textbook: string;
  icon: TopicIconName;
  status: TopicStatus;
}

export const TOPICS: readonly Topic[] = [
  {
    id: 'multiply',
    kind: 'lesson',
    order: 1,
    href: '/multiply',
    title: 'การคูณแบบ MIPS',
    short: 'คูณ',
    blurb:
      'คูณเลขฐานสองแบบ shift-and-add ทีละบิตตามฮาร์ดแวร์ในตำรา และคำสั่ง mult / multu ที่เก็บผลใน HI กับ LO',
    covers: [
      'คูณเลขฐานสองด้วยมือ และทำไมผลคูณต้องยาวเป็นสองเท่า',
      'ฮาร์ดแวร์การคูณรุ่นแรกและรุ่นปรับปรุง ดูทีละขั้นทีละรอบ',
      'การคูณเลขมีเครื่องหมาย',
      'คำสั่ง mult, multu, mfhi, mflo และการตรวจ overflow เอง',
    ],
    textbook: 'Patterson & Hennessy หัวข้อ 3.3',
    icon: 'multiply',
    status: 'coming-soon',
  },
  {
    id: 'divide',
    kind: 'lesson',
    order: 2,
    href: '/divide',
    title: 'การหารแบบ MIPS',
    short: 'หาร',
    blurb:
      'หารเลขฐานสองแบบ restoring ทีละบิตตามฮาร์ดแวร์ในตำรา และคำสั่ง div / divu ที่เก็บผลหารใน LO และเศษใน HI',
    covers: [
      'หารยาวฐานสอง: ผลหาร เศษ และตัวหาร',
      'ฮาร์ดแวร์การหารรุ่นแรกและรุ่นปรับปรุง ดูทีละขั้นทีละรอบ',
      'การหารเลขมีเครื่องหมาย และเครื่องหมายของเศษ',
      'คำสั่ง div, divu, mfhi, mflo และการหารด้วยศูนย์',
    ],
    textbook: 'Patterson & Hennessy หัวข้อ 3.4',
    icon: 'divide',
    status: 'coming-soon',
  },
  {
    id: 'floating-point',
    kind: 'lesson',
    order: 3,
    href: '/floating-point',
    title: 'Floating-Point (IEEE 754)',
    short: 'Floating-Point',
    blurb:
      'ตั้งแต่เลขฐานสอง เศษส่วนฐานสอง และ IEEE 754 ไปจนถึงบวก ลบ คูณ หาร Floating-Point ทีละบิต พร้อม Lab',
    covers: [
      'ระบบเลขฐานและเศษส่วนฐานสอง',
      'IEEE 754 Single Precision: encode และ decode',
      'บวก ลบ คูณ หาร Floating-Point พร้อม Guard, Round, Sticky',
      'Lab คำนวณเองและแชร์ลิงก์ได้',
    ],
    textbook: 'Patterson & Hennessy หัวข้อ 3.5',
    icon: 'floating-point',
    status: 'ready',
  },
  {
    id: 'mips',
    kind: 'simulator',
    order: 4,
    href: '/mips',
    title: 'MIPS Simulator',
    short: 'MIPS Sim',
    blurb:
      'เขียน assembly ของ MIPS แล้วรันทีละคำสั่ง ดู register, memory และรหัสเครื่องของทุกคำสั่ง พร้อมคำอธิบายทุกขั้น',
    covers: [
      'เขียนและ assemble โปรแกรม MIPS ในเบราว์เซอร์',
      'รันทีละคำสั่ง ย้อนกลับได้ เห็น register และ memory เปลี่ยน',
      'รหัสเครื่องแบบ R / I / J format ของทุกคำสั่ง',
      'โปรแกรมตัวอย่างและตารางคำสั่งตาม MIPS Reference Data',
    ],
    textbook: 'MIPS Reference Data (Green Card)',
    icon: 'mips',
    status: 'coming-soon',
  },
];

export function topicById(id: TopicId): Topic {
  const t = TOPICS.find((x) => x.id === id);
  if (!t) throw new Error(`unknown topic ${id}`);
  return t;
}

export const isReady = (id: TopicId): boolean => topicById(id).status === 'ready';

/** Topics sorted by `order` (home page, menus, footer). */
export const TOPICS_IN_ORDER: readonly Topic[] = [...TOPICS].sort((a, b) => a.order - b.order);

/** The first lesson that is ready: the second button on coming-soon pages. */
export function firstReadyLesson(): Topic | undefined {
  return TOPICS_IN_ORDER.find((t) => t.kind === 'lesson' && t.status === 'ready');
}

/** The topic a pathname belongs to (active state in menus), or undefined. */
export function topicOfPath(pathname: string): Topic | undefined {
  return TOPICS.find((t) => pathname === t.href || pathname.startsWith(`${t.href}/`));
}
