/**
 * Small unsigned / two's complement integers for Chapter 1 (slides w03c pages 3-12, 29-33, 36-37).
 * Widths are 4 or 8 bits, so plain numbers are exact; nothing here is floating point.
 */
export type Width = 4 | 8;
export type Bit = 0 | 1;

export interface Column {
  /** Bit position, 0 = rightmost. */
  i: number;
  a: Bit;
  b: Bit;
  cin: Bit;
  sum: Bit;
  cout: Bit;
}

export interface AddResult {
  width: Width;
  a: number;
  b: number;
  carryIn: Bit;
  /** Rightmost column first. */
  columns: Column[];
  result: number;
  carryOut: Bit;
  /** Two's complement overflow: carry into the sign column differs from carry out of it. */
  signedOverflow: boolean;
  /** Unsigned overflow: a carry leaves the leftmost column. */
  unsignedOverflow: boolean;
}

export const mask = (width: Width): number => (1 << width) - 1;

function check(width: Width, v: number): void {
  if (!Number.isInteger(v) || v < 0 || v > mask(width)) {
    throw new RangeError(`${v} is not a ${width}-bit pattern`);
  }
}

const bitAt = (v: number, i: number): Bit => ((v >> i) & 1) as Bit;

/** Ripple-carry addition, one full adder per column (slide w03c page 29). */
export function addBits(width: Width, a: number, b: number, carryIn: Bit = 0): AddResult {
  check(width, a);
  check(width, b);
  const columns: Column[] = [];
  let carry: Bit = carryIn;
  let result = 0;
  for (let i = 0; i < width; i++) {
    const x = bitAt(a, i);
    const y = bitAt(b, i);
    const total = x + y + carry;
    const sum = (total & 1) as Bit;
    const cout = (total >> 1) as Bit;
    columns.push({ i, a: x, b: y, cin: carry, sum, cout });
    result |= sum << i;
    carry = cout;
  }
  const top = columns[width - 1];
  return {
    width,
    a,
    b,
    carryIn,
    columns,
    result,
    carryOut: carry,
    signedOverflow: top.cin !== top.cout,
    unsignedOverflow: carry === 1,
  };
}

export interface SubResult {
  width: Width;
  a: number;
  b: number;
  /** Binvert = 1: every bit of b flipped. */
  inverted: number;
  /** -b in two's complement (inverted + 1). */
  negB: number;
  /** a + inverted with CarryIn = 1 (slide w03c page 33). */
  add: AddResult;
  result: number;
  /** a - b does not fit in the signed range. */
  signedOverflow: boolean;
}

/** a - b = a + (-b): Binvert = 1 and CarryIn = 1 on the same adder. */
export function subBits(width: Width, a: number, b: number): SubResult {
  check(width, a);
  check(width, b);
  const inverted = ~b & mask(width);
  const negB = (inverted + 1) & mask(width);
  const add = addBits(width, a, inverted, 1);
  return {
    width,
    a,
    b,
    inverted,
    negB,
    add,
    result: add.result,
    signedOverflow: add.signedOverflow,
  };
}

export interface ShiftResult {
  value: number;
  /** Bits that fell off the right end, in the order they fell. */
  lost: Bit[];
}

/** Logical shift right by s places: zeros come in on the left (slide w03c pages 36-37). */
export function shiftRight(width: Width, v: number, s: number): ShiftResult {
  check(width, v);
  if (!Number.isInteger(s) || s < 0 || s > width) throw new RangeError(`shift ${s}`);
  const lost: Bit[] = [];
  for (let k = 0; k < s; k++) lost.push(bitAt(v, k));
  return { value: v >> s, lost };
}

/** Two's complement value of a bit pattern. */
export function toSigned(width: Width, v: number): number {
  check(width, v);
  return v & (1 << (width - 1)) ? v - (1 << width) : v;
}

/** Bit pattern of a signed value in range. */
export function fromSigned(width: Width, n: number): number {
  const min = -(1 << (width - 1));
  const max = (1 << (width - 1)) - 1;
  if (!Number.isInteger(n) || n < min || n > max) throw new RangeError(`${n} out of range`);
  return n & mask(width);
}

export const signedRange = (width: Width): { min: number; max: number } => ({
  min: -(1 << (width - 1)),
  max: (1 << (width - 1)) - 1,
});

export function toBits(width: Width, v: number): string {
  check(width, v);
  return v.toString(2).padStart(width, '0');
}
