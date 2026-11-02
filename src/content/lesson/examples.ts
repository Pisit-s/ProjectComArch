import type { Width } from '@/lib/int/adder';

/**
 * Inputs of every example chip (PLAN.md appendix D). Inputs only: results always come from the
 * engine / models. Golden tests check the expected bits separately.
 */

export interface FpExample {
  a: string;
  op: '+' | '-';
  b: string;
}

const fp = (a: string, op: '+' | '-', b: string): FpExample => ({ a, op, b });

/** Main example of the whole story (PLAN.md 1.1 rule 3). */
export const MAIN = fp('6.5', '+', '3.75');
export const SUB_MAIN = fp('0.5', '-', '0.4375');
export const ROUND_MAIN = fp('0.1', '+', '0.2');

/** Chips of scenes 5.2-5.3, 6.1 and the playground (D.1). */
export const FP_EXAMPLES: FpExample[] = [
  MAIN,
  fp('3.75', '-', '6.5'),
  SUB_MAIN,
  fp('9.75', '+', '0.5625'),
  fp('1.5', '+', '0.375'),
  fp('100', '+', '0.1'),
  ROUND_MAIN,
  fp('1', '+', '1e-8'),
  fp('16777216', '+', '1'),
  fp('16777216', '+', '3'),
  fp('1.0000001', '-', '1'),
];

export const SUB_EXAMPLES: FpExample[] = [
  SUB_MAIN,
  fp('3.75', '-', '6.5'),
  fp('1.0000001', '-', '1'),
];
export const ROUND_EXAMPLES: FpExample[] = [
  ROUND_MAIN,
  fp('16777216', '+', '1'),
  fp('16777216', '+', '3'),
  fp('1', '+', '1e-8'),
  fp('100', '+', '0.1'),
];
export const CIRCUIT_EXAMPLES: FpExample[] = [MAIN, SUB_MAIN, ROUND_MAIN];

export interface IntExample {
  a: number;
  b: number;
  width: Width;
}

export const INT_ADD_EXAMPLES: IntExample[] = [
  { a: 7, b: 6, width: 8 },
  { a: 3, b: 2, width: 4 },
  { a: 9, b: 8, width: 4 },
];
export const INT_SUB_EXAMPLES: IntExample[] = [
  { a: 7, b: 6, width: 4 },
  { a: 3, b: 5, width: 4 },
];

/** The 8 four-bit additions of slide w03c pages 6-9 (signed operands). */
export const WHEEL_EXAMPLES: [number, number][] = [
  [3, 2],
  [3, -2],
  [-3, 2],
  [-3, -2],
  [4, 5],
  [4, -5],
  [-4, 5],
  [-4, -5],
];

export const SHIFT_DEFAULT = 104;
export const SHIFT_EXAMPLES = [104, 13];

/** Scene 2.1: int i = 7 + 6; float f = 6.5f + 3.75f; and the 0.1f + 0.2f chip. */
export const C_CODE = {
  int: { a: 7, b: 6 },
  float: { a: '6.5', b: '3.75', decimals: 6 },
  teaser: { a: '0.1', b: '0.2', decimals: 9 },
};

/** Scene 2.2 (slide w03c_mult page 13) and the binary chip of 6.5. */
export const POINT_EXAMPLES: { text: string; exp: number }[] = [
  { text: '0.002', exp: 4 },
  { text: '987.02', exp: 9 },
  { text: '2.34', exp: 56 },
];

/** Scene 3.1-3.2 chips. */
/** Scene 3.1 reads bits (hex) before conversion is taught: 6.5, 3.75, −0.75 and P&H's −5. */
export const LAYOUT_EXAMPLES = ['40D00000', '40700000', 'BF400000', 'C0A00000'];
export const LAYOUT_DEFAULT = LAYOUT_EXAMPLES[0];
export const BITPLAY_EXAMPLES = ['1', '1.5', '2', '3', '6.5', '0.75'];

/** Scene 3.3: bit patterns of slide w03c_mult pages 16-17 (hex inputs; values come from the engine). */
export const SPECIAL_EXAMPLES = [
  '00000000',
  '80000000',
  '00000001',
  '00800000',
  '7F7FFFFF',
  '7F800000',
  'FF800000',
  '7FC00000',
];

/** Scene 4.1 / 4.2 chips (decode inputs are hex typed by the learner). */
export const ENCODE_EXAMPLES = ['6.5', '3.75', '-0.75', '0.1', '10.25'];
export const DECODE_EXAMPLES = ['C0A00000', '41240000', '3DCCCCCD'];

/** Scene 5.1 (P&H 3.5): 9.999 x 10^1 + 1.610 x 10^-1 with 4 digits. */
export const DEC4 = { a: { text: '9.999', exp: 1 }, b: { text: '1.610', exp: -1 }, p: 4 };
