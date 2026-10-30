import type { Bit } from './format';

/** Unsigned integers for Chapter 1. Values are small (8 bits), so plain numbers are exact. */

export interface BitTerm {
  /** Bit position, 0 = least significant. */
  position: number;
  weight: number;
  bit: Bit;
  /** weight * bit */
  contribution: number;
}

export function assertBits(bits: string): void {
  if (!/^[01]+$/.test(bits)) throw new RangeError(`not a bit string: "${bits}"`);
}

/** MSB first. */
export function uintTerms(bits: string): BitTerm[] {
  assertBits(bits);
  const n = bits.length;
  return [...bits].map((c, i) => {
    const position = n - 1 - i;
    const weight = 2 ** position;
    const bit: Bit = c === '1' ? 1 : 0;
    return { position, weight, bit, contribution: bit * weight };
  });
}

export function uintValue(bits: string): number {
  return uintTerms(bits).reduce((s, t) => s + t.contribution, 0);
}

export function uintToBits(n: number, width = 8): string {
  if (!Number.isInteger(n) || n < 0 || n >= 2 ** width) {
    throw new RangeError(`${n} does not fit in ${width} bits`);
  }
  return n.toString(2).padStart(width, '0');
}

export const uintMax = (width = 8): number => 2 ** width - 1;

export type UintParse =
  { ok: true; value: number } | { ok: false; error: 'empty' | 'invalid' | 'range' };

export function parseUint(text: string, width = 8): UintParse {
  const s = text.trim();
  if (s === '') return { ok: false, error: 'empty' };
  if (!/^\d+$/.test(s)) return { ok: false, error: 'invalid' };
  const v = Number(s);
  if (s.length > 6 || v > uintMax(width)) return { ok: false, error: 'range' };
  return { ok: true, value: v };
}

export interface UintStep {
  /** Terms added so far, MSB first (only 1 bits). */
  terms: BitTerm[];
  /** The term added in this step (null for the starting step). */
  current: BitTerm | null;
  sum: number;
}

/** Binary -> decimal, one 1-bit at a time (StepPlayer data for "1011 = 8 + 2 + 1"). */
export function uintSteps(bits: string): UintStep[] {
  const ones = uintTerms(bits).filter((t) => t.bit === 1);
  const steps: UintStep[] = [{ terms: [], current: null, sum: 0 }];
  let sum = 0;
  ones.forEach((t, i) => {
    sum += t.weight;
    steps.push({ terms: ones.slice(0, i + 1), current: t, sum });
  });
  return steps;
}
