import { describe, expect, it } from 'vitest';
import {
  BINARY16,
  BINARY32,
  BINARY64,
  MINI8,
  R,
  bias,
  convertFraction,
  decode,
  decodeWithSteps,
  emax,
  emin,
  exactDecimal,
  formatRational,
  fractionToBinary,
  fractionValue,
  groupNibbles,
  nanBits,
  parseBitString,
  parseDecimal,
  parseHex,
  parseUint,
  rationalToDecimal,
  splitFields,
  toBinaryString,
  toHex,
  uintTerms,
  uintToBits,
  uintValue,
  unpackNormalized,
} from '@/lib/fp';
import { F32, stepOf } from './helpers';

describe('format', () => {
  it('derived constants', () => {
    expect([bias(BINARY32), emin(BINARY32), emax(BINARY32)]).toEqual([127, -126, 127]);
    expect([bias(MINI8), emin(MINI8)]).toEqual([7, -6]);
    expect(bias(BINARY16)).toBe(15);
    expect(bias(BINARY64)).toBe(1023);
    expect(nanBits(BINARY32)).toBe(0x7fc00000n);
  });
});

describe('bits', () => {
  it('strings and hex', () => {
    expect(toBinaryString(5n, 8)).toBe('00000101');
    expect(() => toBinaryString(256n, 8)).toThrow();
    expect(() => toBinaryString(-1n, 8)).toThrow();
    expect(splitFields(F32, 0x40b80000n)).toEqual({
      sign: '0',
      exp: '10000001',
      frac: '01110000000000000000000',
    });
    expect(groupNibbles('010000001')).toBe('0100 0000 1');
    expect(toHex(0x1n, 32)).toBe('0x00000001');
  });
  it('parseBitString', () => {
    const ok = parseBitString(F32, '0 10000001 0111-0000_0000 0000 0000 000');
    expect(ok).toEqual({ ok: true, bits: 0x40b80000n });
    expect(parseBitString(F32, '  ')).toEqual({ ok: false, error: { kind: 'empty' } });
    expect(parseBitString(F32, '0102')).toEqual({
      ok: false,
      error: { kind: 'invalid-char', char: '2' },
    });
    expect(parseBitString(F32, '1'.repeat(31))).toEqual({
      ok: false,
      error: { kind: 'wrong-length', expected: 32, got: 31 },
    });
  });
  it('parseHex', () => {
    expect(parseHex(F32, '0x40B80000')).toEqual({ ok: true, bits: 0x40b80000n });
    expect(parseHex(F32, '40b8 0000')).toEqual({ ok: true, bits: 0x40b80000n });
    expect(parseHex(F32, '')).toEqual({ ok: false, error: { kind: 'empty' } });
    expect(parseHex(F32, '40G80000')).toEqual({
      ok: false,
      error: { kind: 'invalid-char', char: 'G' },
    });
    expect(parseHex(F32, '40B800')).toEqual({
      ok: false,
      error: { kind: 'wrong-length', expected: 8, got: 6 },
    });
  });
});

describe('rational', () => {
  it('arithmetic and helpers', () => {
    const a = R.rat(1n, 3n);
    const b = R.rat(-2n, 6n);
    expect(R.add(a, b)).toEqual(R.ZERO);
    expect(R.div(a, R.rat(2n))).toEqual(R.rat(1n, 6n));
    expect(() => R.div(a, R.ZERO)).toThrow();
    expect(() => R.rat(1n, 0n)).toThrow();
    expect(R.rat(1n, -2n)).toEqual({ num: -1n, den: 2n });
    expect(R.floor(R.rat(-7n, 2n))).toBe(-4n);
    expect(R.floor(R.rat(7n, 2n))).toBe(3n);
    expect(R.floorLog2(R.rat(1n, 3n))).toBe(-2);
    expect(R.floorLog2(R.rat(8n))).toBe(3);
    expect(R.floorLog2(R.rat(255n, 256n))).toBe(-1);
    expect(() => R.floorLog2(R.ZERO)).toThrow();
    expect(R.floorLog10(R.rat(999n))).toBe(2);
    expect(R.floorLog10(R.rat(1n, 1000n))).toBe(-3);
    expect(() => R.floorLog10(R.rat(-1n))).toThrow();
    expect(R.cmp(a, b)).toBe(1);
    expect(R.eq(a, R.rat(2n, 6n))).toBe(true);
    expect(R.scale2(a, -2)).toEqual(R.rat(1n, 12n));
    expect(R.neg(a)).toEqual(R.rat(-1n, 3n));
  });
});

describe('parseDecimal', () => {
  it('accepts valid forms', () => {
    const v = (s: string) => {
      const r = parseDecimal(s);
      if (!r.ok || r.kind !== 'finite') throw new Error(s);
      return (r.negative ? '-' : '') + formatRational(r.magnitude, { scientific: false });
    };
    expect(v('  .5 ')).toBe('0.5');
    expect(v('5.')).toBe('5');
    expect(v('+1.25E3')).toBe('1250');
    expect(v('-0')).toBe('-0');
    expect(v('1e-3')).toBe('0.001');
    expect(v('007')).toBe('7');
    expect(v('−2')).toBe('-2');
    expect(parseDecimal('-nan')).toEqual({ ok: true, kind: 'nan', negative: true });
    expect(parseDecimal('INFINITY')).toEqual({ ok: true, kind: 'inf', negative: false });
  });
  it('rejects every kind of bad input with the right error', () => {
    const k = (s: string) => {
      const r = parseDecimal(s);
      return r.ok ? 'ok' : r.error.kind;
    };
    expect(k('')).toBe('empty');
    expect(k('   ')).toBe('empty');
    expect(k('abc')).toBe('invalid');
    expect(k('1.2.3')).toBe('invalid');
    expect(k('.')).toBe('invalid');
    expect(k('e5')).toBe('invalid');
    expect(k('1e')).toBe('invalid');
    expect(k('0x10')).toBe('invalid');
    expect(k('1,5')).toBe('comma');
    expect(k('1'.repeat(201))).toBe('too-long');
    expect(k('1e100001')).toBe('exponent-range');
    expect(k('1e-100001')).toBe('exponent-range');
    expect(k('1e0000000000005')).toBe('ok');
    expect(k('1e1234567')).toBe('exponent-range');
    expect(k('1e100000')).toBe('ok');
  });
});

describe('decode', () => {
  it('classes and values', () => {
    expect(decode(F32, 0x7f800000n).value).toBeNull();
    expect(decode(F32, 0x80000000n)).toMatchObject({ cls: 'zero', sign: 1 });
    expect(unpackNormalized(F32, 1n)).toEqual({ sig: 1n << 23n, e: -149, shift: 23 });
    const sub = decodeWithSteps(F32, 1n);
    expect(stepOf(sub, 'significand').hidden).toBe(0);
    expect(stepOf(sub, 'exponent').result).toBe(-126);
    const inf = decodeWithSteps(F32, 0xff800000n);
    expect(inf.steps.map((s) => s.kind)).toEqual(['fields', 'classify', 'value']);
  });
});

describe('format-number', () => {
  it('formatRational', () => {
    expect(formatRational(R.rat(1n, 3n))).toBe('0.3333333333333333333333333333333333333333…');
    expect(rationalToDecimal(R.rat(2n, 3n), 5)).toBe('0.66666…');
    expect(formatRational(R.rat(-1n, 8n))).toBe('-0.125');
    expect(formatRational(R.rat(10n ** 21n))).toBe('1e+21');
    expect(formatRational(R.rat(123n, 10n ** 9n))).toBe('1.23e-7');
    expect(formatRational(R.rat(1n, 3n * 10n ** 8n), { maxSignificant: 3 })).toBe('3.33…e-9');
    expect(formatRational(R.rat(1000n))).toBe('1000');
    expect(formatRational(R.rat(123456n, 100n), { maxSignificant: 2 })).toBe('1200…');
    expect(formatRational(R.ZERO)).toBe('0');
  });
  it('exactDecimal of the smallest subnormal has every digit', () => {
    const s = exactDecimal(F32, 1n);
    expect(s.startsWith('1.40129846432481707092372958328991613128026194187651577')).toBe(true);
    expect(s.endsWith('e-45')).toBe(true);
  });
});

describe('fraction', () => {
  it('validation', () => {
    const k = (s: string) => {
      const r = fractionToBinary(s, 8);
      return r.ok ? 'ok' : r.error.kind;
    };
    expect(k('1')).toBe('out-of-range');
    expect(k('-0.5')).toBe('out-of-range');
    expect(k('inf')).toBe('out-of-range');
    expect(k('0,5')).toBe('comma');
    expect(k('-0')).toBe('ok');
    expect(k('0')).toBe('ok');
  });
  it('values and repeats', () => {
    expect(fractionValue('101')).toEqual(R.rat(5n, 8n));
    const third = convertFraction(R.rat(1n, 3n), 8);
    expect(third.bits).toBe('01010101');
    expect(third.repeat).toEqual({ start: 1, length: 2 });
    // order of 2 mod 5^9 is huge: no repeat found within the search limit
    const long = convertFraction(R.rat(123456789n, 10n ** 9n), 16);
    expect(long.repeat).toBeNull();
    expect(long.terminatesAt).toBeNull();
  });
});

describe('integer', () => {
  it('terms and conversions', () => {
    expect(uintTerms('101').map((t) => t.contribution)).toEqual([4, 0, 1]);
    expect(uintValue('11111111')).toBe(255);
    expect(uintToBits(10)).toBe('00001010');
    expect(() => uintToBits(256)).toThrow();
    expect(() => uintTerms('12')).toThrow();
    expect(parseUint(' 42 ')).toEqual({ ok: true, value: 42 });
    expect(parseUint('')).toEqual({ ok: false, error: 'empty' });
    expect(parseUint('4.2')).toEqual({ ok: false, error: 'invalid' });
    expect(parseUint('256')).toEqual({ ok: false, error: 'range' });
  });
});
