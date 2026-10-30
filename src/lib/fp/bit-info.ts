import { decode } from './decode';
import { type Bit, type FloatFormat, bias, width } from './format';
import { type Rational, pow2 } from './rational';

export type BitField = 'sign' | 'exp' | 'frac';

export interface BitMeaning {
  field: BitField;
  /** Bit number in the whole word, 0 = least significant (binary32: 0..31). */
  bitNumber: number;
  bit: Bit;
  /**
   * sign: unused · exp: position inside the exponent field (0 = LSB, weight 2^k)
   * · frac: position after the binary point (1 = first fraction bit, weight 2^-k)
   */
  position: number;
  /** Weight inside its field: exp 2^k (integer), frac 2^-k of the significand. */
  fieldWeight: Rational | null;
  /** How much this bit adds to the exponent field value (exp bits only). */
  expContribution: number | null;
  /** How much this bit adds to the final value (frac bits of finite numbers; null otherwise). */
  valueContribution: Rational | null;
  /** Unbiased exponent used for the fraction weight (normal: E - bias, subnormal: emin). */
  scaleExponent: number | null;
}

/**
 * Meaning of the bit at index `i` counted from the left (0 = sign bit) — the order bits are drawn.
 */
export function bitMeaning(fmt: FloatFormat, bits: bigint, i: number): BitMeaning {
  const w = width(fmt);
  if (i < 0 || i >= w) throw new RangeError(`bit index ${i} outside 0..${w - 1}`);
  const bitNumber = w - 1 - i;
  const bit: Bit = ((bits >> BigInt(bitNumber)) & 1n) === 1n ? 1 : 0;
  const d = decode(fmt, bits);
  if (i === 0) {
    return {
      field: 'sign',
      bitNumber,
      bit,
      position: 0,
      fieldWeight: null,
      expContribution: null,
      valueContribution: null,
      scaleExponent: null,
    };
  }
  if (i <= fmt.expBits) {
    const k = fmt.expBits - i;
    return {
      field: 'exp',
      bitNumber,
      bit,
      position: k,
      fieldWeight: pow2(k),
      expContribution: bit ? 2 ** k : 0,
      valueContribution: null,
      scaleExponent: null,
    };
  }
  const k = i - fmt.expBits;
  const finite = d.cls === 'normal' || d.cls === 'subnormal' || d.cls === 'zero';
  const scale = d.cls === 'normal' ? d.expField - bias(fmt) : 1 - bias(fmt);
  return {
    field: 'frac',
    bitNumber,
    bit,
    position: k,
    fieldWeight: pow2(-k),
    expContribution: null,
    valueContribution: finite ? (bit ? pow2(scale - k) : { num: 0n, den: 1n }) : null,
    scaleExponent: finite ? scale : null,
  };
}
