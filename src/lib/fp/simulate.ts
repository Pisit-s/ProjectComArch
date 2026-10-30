import { addSub } from './add';
import { div } from './div';
import { type EncodeResult, encodeDecimal } from './encode';
import type { FloatFormat } from './format';
import { mul } from './mul';
import type { ParseError } from './parse';
import { decode } from './decode';
import { type Rational, add, div as divR, mul as mulR, sub } from './rational';
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
    if (op === '+') typed = add(x, y);
    else if (op === '-') typed = sub(x, y);
    else if (op === '*') typed = mulR(x, y);
    else if (y.num !== 0n) typed = divR(x, y);
  }
  const stored = decode(fmt, result.bits).value;
  const error = typed && stored ? sub(stored, typed) : null;
  return { ok: true, op, a, b, result, typed, stored, error };
}
