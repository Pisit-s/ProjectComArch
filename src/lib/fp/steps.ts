import type { Bit, Fields, FloatClass } from './format';
import type { Rational } from './rational';

/**
 * Steps are plain data. The UI renders each step from its own fields only, so stepping
 * backwards needs no replay. All exponents stored in steps are BIASED values
 * (they may fall outside 1..254 when a result overflows or underflows).
 */

export type RoundDecision = 'exact' | 'down' | 'up' | 'tie-even-down' | 'tie-even-up';

export type SpecialRule =
  // inputs (encode)
  | 'zero-input'
  | 'inf-input'
  | 'nan-input'
  // any operation
  | 'nan-operand'
  // add/sub
  | 'inf-minus-inf'
  | 'inf-operand'
  | 'zero-plus-zero'
  | 'add-zero';

export type RangeOutcome = 'ok' | 'overflow' | 'underflow-subnormal' | 'underflow-zero';

/** Flowchart box this step belongs to. */
export type FlowNode =
  | 'to-binary'
  | 'decode'
  | 'special'
  | 'sign'
  | 'exponent'
  | 'compare'
  | 'align'
  | 'significand'
  | 'normalize'
  | 'range'
  | 'round'
  | 'encode'
  | 'fields'
  | 'classify'
  | 'value';

export interface Flags {
  inexact: boolean;
  overflow: boolean;
  underflow: boolean;
  divideByZero: boolean;
  invalid: boolean;
}

export const NO_FLAGS: Flags = {
  inexact: false,
  overflow: false,
  underflow: false,
  divideByZero: false,
  invalid: false,
};

export interface FracRow {
  /** Fraction before doubling (0 <= value < 1). */
  value: Rational;
  /** value * 2 */
  doubled: Rational;
  /** Integer part of doubled: the next bit. */
  bit: Bit;
}

export interface IntRow {
  value: bigint;
  quotient: bigint;
  /** value mod 2 */
  bit: Bit;
}

type StepBody =
  | {
      kind: 'decode';
      operand: 'A' | 'B';
      bits: bigint;
      fields: Fields;
      cls: FloatClass;
      /** Integer significand (hidden bit included for normal numbers). */
      significand: bigint;
      /** Effective biased exponent (subnormal: 1). */
      exponent: number;
      /** Left shifts that would normalize a subnormal operand (0 for normal ones). */
      normalizeShift: number;
      value: Rational | null;
    }
  | { kind: 'negate'; before: bigint; after: bigint }
  | { kind: 'special'; rule: SpecialRule; resultBits: bigint; flags: Flags }
  | { kind: 'sign'; a: Bit; b: Bit | null; result: Bit; rule: 'xor' | 'from-larger' | 'input' }
  | {
      kind: 'exponent';
      mode: 'compare' | 'add-bias' | 'sub-bias' | 'encode-bias' | 'decode-bias';
      /** Biased exponent of A (encode-bias: unbiased e; decode-bias: field value). */
      ea: number;
      /** Biased exponent of B (0 when not used). */
      eb: number;
      bias: number;
      /** add-bias: ea + eb - bias · sub-bias: ea - eb + bias · compare: max · encode: e + bias · decode: ea - bias */
      result: number;
      /** compare: ea - eb after swapping (>= 0). */
      diff: number;
      swapped: boolean;
    }
  | {
      kind: 'align';
      /** Exponent difference d. */
      shift: number;
      /** Smaller significand with 3 extra low bits (G, R, S) before shifting. */
      before: bigint;
      /** After shifting right by d with bits that fall off ORed into the lowest bit. */
      after: bigint;
      sticky: Bit;
      /** State after each single shift 0..min(d, fracBits + 4); the last entry always equals `after`. */
      stages: { shift: number; value: bigint; sticky: Bit }[];
      /** Larger significand with 3 extra low bits. */
      larger: bigint;
      /** Bits after the binary point in before/after/larger. */
      fracBits: number;
      exponent: number;
    }
  | {
      kind: 'sig-add';
      a: bigint;
      b: bigint;
      op: '+' | '-';
      result: bigint;
      fracBits: number;
      sign: Bit;
    }
  | {
      kind: 'normalize';
      direction: 'left' | 'right' | 'none';
      amount: number;
      before: bigint;
      beforeFracBits: number;
      after: bigint;
      afterFracBits: number;
      expBefore: number;
      expAfter: number;
    }
  | {
      kind: 'range';
      outcome: RangeOutcome;
      /** Biased exponent before rounding (may be < 1 or > max). */
      exponent: number;
      minExp: number;
      maxExp: number;
      /** Extra right shifts used to fit a subnormal result. */
      denormShift: number;
    }
  | {
      kind: 'round';
      /** Kept significand before rounding (p bits for normal, fewer for subnormal). */
      kept: bigint;
      guard: Bit;
      round: Bit;
      sticky: Bit;
      decision: RoundDecision;
      /** true when 1 ulp was added. */
      rounded: boolean;
      /** kept after rounding (and after the carry shift). */
      result: bigint;
      carryOut: boolean;
      /** Biased exponent before / after the carry adjustment (subnormal: 0). */
      expBefore: number;
      expAfter: number;
      subnormal: boolean;
      /** Rounding up pushed the value to infinity. */
      overflowAfterRound: boolean;
    }
  | { kind: 'encode'; bits: bigint; fields: Fields; hex: string; cls: FloatClass }
  // encode-from-decimal (Chapter 3)
  | {
      kind: 'int-binary';
      intPart: bigint;
      binary: string;
      /** Repeated division by 2 (empty when intPart is 0); capped for very large values. */
      rows: IntRow[];
      rowsTruncated: boolean;
    }
  | {
      kind: 'frac-binary';
      fracPart: Rational;
      rows: FracRow[];
      binary: string;
      /** Remainder reached 0 within the rows shown. */
      terminated: boolean;
    }
  | {
      kind: 'point';
      intBinary: string;
      fracBinary: string;
      /** floor(log2 |x|) */
      e: number;
      /** max(e, emin): the exponent actually used */
      eUsed: number;
      direction: 'left' | 'right' | 'none';
      amount: number;
      subnormal: boolean;
      /** Significand bits after normalizing with 3 extra bits (fracBits + 3 after the point). */
      normalized: bigint;
      fracBits: number;
    }
  // decode (Chapter 3)
  | { kind: 'fields'; bits: bigint; fields: Fields; hex: string }
  | { kind: 'classify'; expField: number; fracZero: boolean; cls: FloatClass; expMax: number }
  | {
      kind: 'significand';
      hidden: Bit;
      frac: bigint;
      significand: bigint;
      fracBits: number;
    }
  | {
      kind: 'value';
      sign: Bit;
      cls: FloatClass;
      significand: bigint;
      fracBits: number;
      /** Unbiased exponent applied to the significand. */
      exponent: number;
      value: Rational | null;
    };

export type Step = { id: string; flow: FlowNode } & StepBody;
export type StepKind = Step['kind'];
export type StepOf<K extends StepKind> = Extract<Step, { kind: K }>;

export interface FpResult {
  bits: bigint;
  steps: Step[];
  flags: Flags;
  /** Exact mathematical result of the stored operands (null when a special value is involved). */
  exact: Rational | null;
}
