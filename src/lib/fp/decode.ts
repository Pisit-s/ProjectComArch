import { toHex } from './bits';
import {
  type Bit,
  type Fields,
  type FloatClass,
  type FloatFormat,
  bias,
  bitLength,
  classify,
  emin,
  expFieldMax,
  fieldsOf,
  hiddenBit,
  precision,
  width,
} from './format';
import { type Rational, ZERO, mul, neg, pow2, rat } from './rational';
import type { Step } from './steps';

export interface Decoded {
  sign: Bit;
  expField: number;
  fracField: bigint;
  cls: FloatClass;
  /** Integer significand: hidden bit | fraction (normal) or fraction (subnormal). */
  significand: bigint;
  /** Unbiased exponent of the significand's leading position (subnormal: emin). */
  exponent: number;
  /** Exact value (signed; -0 is reported as 0 with sign 1). null for infinity / NaN. */
  value: Rational | null;
}

export function decode(fmt: FloatFormat, bits: bigint): Decoded {
  const f = fieldsOf(fmt, bits);
  const cls = classify(fmt, bits);
  let significand = 0n;
  let exponent = 0;
  let value: Rational | null = null;
  if (cls === 'normal') {
    significand = hiddenBit(fmt) | f.frac;
    exponent = f.exp - bias(fmt);
  } else if (cls === 'subnormal' || cls === 'zero') {
    significand = f.frac;
    exponent = emin(fmt);
  }
  if (cls === 'normal' || cls === 'subnormal' || cls === 'zero') {
    const mag = mul(rat(significand), pow2(exponent - fmt.fracBits));
    value = f.sign ? neg(mag) : mag;
    if (cls === 'zero') value = ZERO;
  }
  return { sign: f.sign, expField: f.exp, fracField: f.frac, cls, significand, exponent, value };
}

/** Hardware-style unpack for add/sub: subnormals keep hidden bit 0 and exponent emin. */
export function unpackRaw(fmt: FloatFormat, bits: bigint): { sig: bigint; e: number } {
  const d = decode(fmt, bits);
  return { sig: d.significand, e: d.exponent };
}

/**
 * Unpack with the leading 1 always at bit position fracBits (mul/div).
 * Subnormals are shifted left by k and their exponent lowered by k.
 */
export function unpackNormalized(
  fmt: FloatFormat,
  bits: bigint,
): { sig: bigint; e: number; shift: number } {
  const d = decode(fmt, bits);
  if (d.cls === 'subnormal') {
    const k = precision(fmt) - bitLength(d.fracField);
    return { sig: d.fracField << BigInt(k), e: emin(fmt) - k, shift: k };
  }
  return { sig: d.significand, e: d.exponent, shift: 0 };
}

export function decodeStep(
  fmt: FloatFormat,
  operand: 'A' | 'B',
  bits: bigint,
  normalized: boolean,
): Step {
  const d = decode(fmt, bits);
  const u = normalized
    ? unpackNormalized(fmt, bits)
    : { sig: d.significand, e: d.exponent, shift: 0 };
  return {
    id: operand === 'A' ? 'decode-a' : 'decode-b',
    flow: 'decode',
    kind: 'decode',
    operand,
    bits,
    fields: fieldsOf(fmt, bits),
    cls: d.cls,
    significand: d.cls === 'normal' || d.cls === 'subnormal' ? u.sig : d.significand,
    exponent: d.cls === 'normal' || d.cls === 'subnormal' ? u.e + bias(fmt) : d.expField,
    normalizeShift: u.shift,
    value: d.value,
  };
}

export function encodeStep(fmt: FloatFormat, bits: bigint): Step {
  return {
    id: 'encode',
    flow: 'encode',
    kind: 'encode',
    bits,
    fields: fieldsOf(fmt, bits),
    hex: toHex(bits, width(fmt)),
    cls: classify(fmt, bits),
  };
}

export interface DecodeResult extends Decoded {
  bits: bigint;
  fields: Fields;
  steps: Step[];
}

/** Bits -> value with the steps of Chapter 3's decoder. */
export function decodeWithSteps(fmt: FloatFormat, bits: bigint): DecodeResult {
  const d = decode(fmt, bits);
  const f = fieldsOf(fmt, bits);
  const steps: Step[] = [
    { id: 'fields', flow: 'fields', kind: 'fields', bits, fields: f, hex: toHex(bits, width(fmt)) },
    {
      id: 'classify',
      flow: 'classify',
      kind: 'classify',
      expField: f.exp,
      fracZero: f.frac === 0n,
      cls: d.cls,
      expMax: expFieldMax(fmt),
    },
  ];
  if (d.cls === 'normal' || d.cls === 'subnormal') {
    steps.push(
      {
        id: 'sign',
        flow: 'sign',
        kind: 'sign',
        a: f.sign,
        b: null,
        result: f.sign,
        rule: 'input',
      },
      {
        id: 'exponent',
        flow: 'exponent',
        kind: 'exponent',
        mode: 'decode-bias',
        ea: d.cls === 'normal' ? f.exp : 1,
        eb: 0,
        bias: bias(fmt),
        result: d.exponent,
        diff: 0,
        swapped: false,
      },
      {
        id: 'significand',
        flow: 'significand',
        kind: 'significand',
        hidden: d.cls === 'normal' ? 1 : 0,
        frac: f.frac,
        significand: d.significand,
        fracBits: fmt.fracBits,
      },
    );
  }
  steps.push({
    id: 'value',
    flow: 'value',
    kind: 'value',
    sign: f.sign,
    cls: d.cls,
    significand: d.significand,
    fracBits: fmt.fracBits,
    exponent: d.exponent,
    value: d.value,
  });
  return { ...d, bits, fields: f, steps };
}
