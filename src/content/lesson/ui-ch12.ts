import { C_CODE } from './examples';

/** Scene 2.1 source code, written from the example inputs (results come from the engine). */
export const C_SOURCE = {
  main: [
    `int   i = ${C_CODE.int.a} + ${C_CODE.int.b};`,
    `float f = ${C_CODE.float.a}f + ${C_CODE.float.b}f;`,
    'printf("%d %f\\n", i, f);',
  ],
  teaser: [
    `float g = ${C_CODE.teaser.a}f + ${C_CODE.teaser.b}f;`,
    `printf("%.${C_CODE.teaser.decimals}f\\n", g);`,
  ],
  mainChip: `${C_CODE.float.a}f + ${C_CODE.float.b}f`,
  teaserChip: `${C_CODE.teaser.a}f + ${C_CODE.teaser.b}f`,
} as const;

/** Short labels used only by this branch's scenes (each at most 20 graphemes). */
export const UI_CH12 = {
  bits4: '4 บิต',
  bits8: '8 บิต',
  width: 'จำนวนบิต',
  carry: 'ทด',
  sum: 'ผล',
  carryOut: 'ทดออก',
  range: (max: number) => `ใส่ 0 ถึง ${max}`,
  overflow: 'overflow',
  ok: 'ถูกต้อง',
  seam: 'รอยต่อ',
  shiftBy: 'เลื่อนขวา',
  places: 'ตำแหน่ง',
  lost: 'บิตที่หลุด',
  output: 'output',
  notNormalized: 'ยังไม่ normalized',
  normalized: 'normalized',
  toChapter5: 'ดูในบทที่ 4',
  code: 'โค้ด C',
} as const;
