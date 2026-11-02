import { addSub } from './add';
import { type EncodeResult, encodeDecimal } from './encode';
import type { FloatFormat } from './format';
import type { ParseError } from './parse';
import { decode } from './decode';
import { type Rational, add, sub } from './rational';
import type { FpResult } from './steps';

export type Op = '+' | '-';
export const OPS: readonly Op[] = ['+', '-'];

export function operate(fmt: FloatFormat, op: Op, a: bigint, b: bigint): FpResult {
  return addSub(fmt, a, b, op);
}

export type SimulationOutcome =
  | {
      ok: true;
      op: Op;
      a: EncodeResult;
      b: EncodeResult;
      result: FpResult;
      /** Exact result of the values as typed (before storing them); null with special values. */
      typed: Rational | null;
      /** Stored float result (null for infinity / NaN). */
      stored: Rational | null;
      /** stored - typed: the total error of storing the inputs and rounding the result. */
      error: Rational | null;
    }
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
  const result = operate(fmt, op, a.bits, b.bits);
  const x = a.exact;
  const y = b.exact;
  let typed: Rational | null = null;
  if (x && y) {
    typed = op === '+' ? add(x, y) : sub(x, y);
  }
  const stored = decode(fmt, result.bits).value;
  const error = typed && stored ? sub(stored, typed) : null;
  return { ok: true, op, a, b, result, typed, stored, error };
}
