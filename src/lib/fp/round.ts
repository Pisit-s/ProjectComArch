import {
  type Bit,
  type FloatFormat,
  bias,
  bitLength,
  emin,
  expFieldMax,
  hiddenBit,
  infBits,
  pack,
  precision,
  zeroBits,
} from './format';
import type { Flags, RangeOutcome, RoundDecision, Step } from './steps';

export interface RoundInfo {
  /** Biased exponent after normalizing, before any denormalization (may be out of range). */
  normExp: number;
  /** Range check before rounding. */
  range: RangeOutcome;
  denormShift: number;
  kept: bigint;
  guard: Bit;
  round: Bit;
  sticky: Bit;
  decision: RoundDecision;
  roundedUp: boolean;
  carryOut: boolean;
  /** kept after rounding and the carry shift */
  result: bigint;
  /** Biased exponent field before / after carry (subnormal range: 0 before; 0 or 1 after). */
  expBefore: number;
  expAfter: number;
  subnormal: boolean;
  overflowAfterRound: boolean;
}

export interface RoundPackResult {
  bits: bigint;
  flags: Flags;
  info: RoundInfo;
}

const bit = (n: bigint, i: number): Bit => (i >= 0 && ((n >> BigInt(i)) & 1n) === 1n ? 1 : 0);

export function decideRounding(
  lsb: Bit,
  g: Bit,
  r: Bit,
  s: Bit,
): { up: boolean; decision: RoundDecision } {
  if (!g && !r && !s) return { up: false, decision: 'exact' };
  if (!g) return { up: false, decision: 'down' };
  if (r || s) return { up: true, decision: 'up' };
  // exact tie: choose the neighbour whose last bit is 0
  return lsb ? { up: true, decision: 'tie-even-up' } : { up: false, decision: 'tie-even-down' };
}

/**
 * Round and pack the exact value  P * 2^(-pFrac) * 2^e  (P >= 0), plus a sticky bit for
 * any non-zero tail that was already dropped (division remainder, encode remainder).
 * Round to nearest, ties to even. Underflow denormalizes from the full-width P before rounding.
 */
export function roundPack(
  fmt: FloatFormat,
  sign: Bit,
  P: bigint,
  pFrac: number,
  e: number,
  extraSticky: Bit = 0,
): RoundPackResult {
  const F = fmt.fracBits;
  const b = bias(fmt);
  const minE = emin(fmt);

  let E: number;
  let shift: number;
  let normExp: number;
  let denormShift = 0;
  if (P === 0n) {
    // value is only the dropped tail (or exactly 0)
    E = minE;
    normExp = minE + b - 1;
    shift = 0;
    denormShift = 0;
  } else {
    const lead = bitLength(P) - 1;
    E = e + lead - pFrac;
    normExp = E + b;
    shift = lead - F;
    if (E < minE) {
      denormShift = minE - E;
      shift += denormShift;
      E = minE;
    }
  }

  let kept: bigint;
  let g: Bit = 0;
  let r: Bit = 0;
  let s: Bit = extraSticky;
  if (shift > 0) {
    kept = P >> BigInt(shift);
    g = bit(P, shift - 1);
    r = bit(P, shift - 2);
    const lowBits = Math.max(shift - 2, 0);
    if ((P & ((1n << BigInt(lowBits)) - 1n)) !== 0n) s = 1;
  } else {
    kept = P << BigInt(-shift);
  }

  let range: RangeOutcome = 'ok';
  if (normExp >= expFieldMax(fmt)) range = 'overflow';
  else if (P === 0n || denormShift > 0) range = 'underflow-subnormal';

  const { up, decision } = decideRounding(bit(kept, 0), g, r, s);
  const keptBefore = kept;
  const subnormalBefore = kept < hiddenBit(fmt);
  const expBefore = subnormalBefore ? 0 : E + b;
  if (up) kept += 1n;
  let carryOut = false;
  if (kept === 1n << BigInt(precision(fmt))) {
    kept >>= 1n;
    E += 1;
    carryOut = true;
  }

  const inexact = g === 1 || r === 1 || s === 1;
  const flags: Flags = {
    inexact,
    overflow: false,
    underflow: false,
    divideByZero: false,
    invalid: false,
  };

  let bits: bigint;
  let overflowAfterRound = false;
  let expAfter: number;
  if (kept === 0n) {
    bits = zeroBits(fmt, sign);
    expAfter = 0;
    if (range === 'underflow-subnormal') range = 'underflow-zero';
  } else if (kept < hiddenBit(fmt)) {
    bits = pack(fmt, sign, 0, kept);
    expAfter = 0;
  } else if (E + b >= expFieldMax(fmt)) {
    bits = infBits(fmt, sign);
    expAfter = E + b;
    flags.overflow = true;
    flags.inexact = true;
    overflowAfterRound = range !== 'overflow';
  } else {
    bits = pack(fmt, sign, E + b, kept - hiddenBit(fmt));
    expAfter = E + b;
  }
  if (range === 'underflow-subnormal' || range === 'underflow-zero') {
    flags.underflow = inexact;
  }

  return {
    bits,
    flags,
    info: {
      normExp,
      range,
      denormShift,
      kept: keptBefore,
      guard: g,
      round: r,
      sticky: s,
      decision,
      roundedUp: up,
      carryOut,
      result: kept,
      expBefore,
      expAfter,
      subnormal: subnormalBefore,
      overflowAfterRound,
    },
  };
}

export function rangeStep(fmt: FloatFormat, info: RoundInfo): Step {
  return {
    id: 'range',
    flow: 'range',
    kind: 'range',
    outcome: info.range,
    exponent: info.normExp,
    minExp: 1,
    maxExp: expFieldMax(fmt) - 1,
    denormShift: info.denormShift,
  };
}

export function roundStep(info: RoundInfo): Step {
  return {
    id: 'round',
    flow: 'round',
    kind: 'round',
    kept: info.kept,
    guard: info.guard,
    round: info.round,
    sticky: info.sticky,
    decision: info.decision,
    rounded: info.roundedUp,
    result: info.result,
    carryOut: info.carryOut,
    expBefore: info.expBefore,
    expAfter: info.expAfter,
    subnormal: info.subnormal,
    overflowAfterRound: info.overflowAfterRound,
  };
}
