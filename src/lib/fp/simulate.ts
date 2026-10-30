import { addSub } from './add';
import { div } from './div';
import { type EncodeResult, encodeDecimal } from './encode';
import type { FloatFormat } from './format';
import { mul } from './mul';
import type { ParseError } from './parse';
import type { FpResult } from './steps';

export type Op = '+' | '-' | '*' | '/';
export const OPS: readonly Op[] = ['+', '-', '*', '/'];

export function operate(fmt: FloatFormat, op: Op, a: bigint, b: bigint): FpResult {
  switch (op) {
    case '+':
    case '-':
      return addSub(fmt, a, b, op);
    case '*':
      return mul(fmt, a, b);
    case '/':
      return div(fmt, a, b);
  }
}

export type SimulationOutcome =
  | { ok: true; op: Op; a: EncodeResult; b: EncodeResult; result: FpResult }
  | { ok: false; errorA: ParseError | null; errorB: ParseError | null };

/** Encode both decimal operands to the format first, then run the operation on the stored bits. */
export function simulate(
  fmt: FloatFormat,
  op: Op,
  aText: string,
  bText: string,
): SimulationOutcome {
  const a = encodeDecimal(fmt, aText);
  const b = encodeDecimal(fmt, bText);
  if (!a.ok || !b.ok) {
    return { ok: false, errorA: a.ok ? null : a.error, errorB: b.ok ? null : b.error };
  }
  return { ok: true, op, a, b, result: operate(fmt, op, a.bits, b.bits) };
}
