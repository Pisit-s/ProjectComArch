import {
  type Bit,
  type FloatFormat,
  classify,
  fieldsOf,
  infBits,
  nanBits,
  zeroBits,
} from './format';
import { type Flags, NO_FLAGS, type SpecialRule } from './steps';

export interface SpecialOutcome {
  rule: SpecialRule;
  bits: bigint;
  flags: Flags;
}

const withFlags = (f: Partial<Flags>): Flags => ({ ...NO_FLAGS, ...f });

/** a + b where b already carries the effective sign (subtraction flips B first). */
export function specialAdd(fmt: FloatFormat, a: bigint, b: bigint): SpecialOutcome | null {
  const ca = classify(fmt, a);
  const cb = classify(fmt, b);
  const sa = fieldsOf(fmt, a).sign;
  const sb = fieldsOf(fmt, b).sign;
  if (ca === 'nan' || cb === 'nan') {
    return { rule: 'nan-operand', bits: nanBits(fmt), flags: withFlags({}) };
  }
  if (ca === 'infinity' && cb === 'infinity') {
    if (sa !== sb) {
      return { rule: 'inf-minus-inf', bits: nanBits(fmt), flags: withFlags({ invalid: true }) };
    }
    return { rule: 'inf-operand', bits: a, flags: withFlags({}) };
  }
  if (ca === 'infinity') return { rule: 'inf-operand', bits: a, flags: withFlags({}) };
  if (cb === 'infinity') return { rule: 'inf-operand', bits: b, flags: withFlags({}) };
  if (ca === 'zero' && cb === 'zero') {
    const sign: Bit = sa === 1 && sb === 1 ? 1 : 0;
    return { rule: 'zero-plus-zero', bits: zeroBits(fmt, sign), flags: withFlags({}) };
  }
  if (cb === 'zero') return { rule: 'add-zero', bits: a, flags: withFlags({}) };
  if (ca === 'zero') return { rule: 'add-zero', bits: b, flags: withFlags({}) };
  return null;
}

export function specialMul(fmt: FloatFormat, a: bigint, b: bigint): SpecialOutcome | null {
  const ca = classify(fmt, a);
  const cb = classify(fmt, b);
  const sign = (fieldsOf(fmt, a).sign ^ fieldsOf(fmt, b).sign) as Bit;
  if (ca === 'nan' || cb === 'nan') {
    return { rule: 'nan-operand', bits: nanBits(fmt), flags: withFlags({}) };
  }
  const aInf = ca === 'infinity';
  const bInf = cb === 'infinity';
  const aZero = ca === 'zero';
  const bZero = cb === 'zero';
  if ((aInf && bZero) || (aZero && bInf)) {
    return { rule: 'zero-times-inf', bits: nanBits(fmt), flags: withFlags({ invalid: true }) };
  }
  if (aInf || bInf) return { rule: 'inf-times', bits: infBits(fmt, sign), flags: withFlags({}) };
  if (aZero || bZero) {
    return { rule: 'zero-times', bits: zeroBits(fmt, sign), flags: withFlags({}) };
  }
  return null;
}

export function specialDiv(fmt: FloatFormat, a: bigint, b: bigint): SpecialOutcome | null {
  const ca = classify(fmt, a);
  const cb = classify(fmt, b);
  const sign = (fieldsOf(fmt, a).sign ^ fieldsOf(fmt, b).sign) as Bit;
  if (ca === 'nan' || cb === 'nan') {
    return { rule: 'nan-operand', bits: nanBits(fmt), flags: withFlags({}) };
  }
  const aInf = ca === 'infinity';
  const bInf = cb === 'infinity';
  const aZero = ca === 'zero';
  const bZero = cb === 'zero';
  if (aInf && bInf) {
    return { rule: 'inf-div-inf', bits: nanBits(fmt), flags: withFlags({ invalid: true }) };
  }
  if (aZero && bZero) {
    return { rule: 'zero-div-zero', bits: nanBits(fmt), flags: withFlags({ invalid: true }) };
  }
  if (aInf) return { rule: 'inf-div', bits: infBits(fmt, sign), flags: withFlags({}) };
  if (bInf) return { rule: 'div-inf', bits: zeroBits(fmt, sign), flags: withFlags({}) };
  if (bZero) {
    return { rule: 'div-zero', bits: infBits(fmt, sign), flags: withFlags({ divideByZero: true }) };
  }
  if (aZero) return { rule: 'zero-div', bits: zeroBits(fmt, sign), flags: withFlags({}) };
  return null;
}
