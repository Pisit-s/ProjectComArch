import { describe, expect, it } from 'vitest';
import {
  R,
  decodeWithSteps,
  encodeDecimal,
  exactDecimal,
  formatRational,
  fractionToBinary,
  simulate,
  uintSteps,
  uintValue,
} from '@/lib/fp';
import { F32, enc, hasStep, hex, stepOf } from './helpers';

/** Inputs of the stage-1 golden vectors (docs/plans/stage1-floating-point.md appendix C). */
const ENCODE_EXAMPLES = [
  ['E1', '5.75'],
  ['E2', '-13.25'],
  ['E3', '0.1'],
  ['E4', '0.2'],
  ['E5', '0.3'],
  ['E6', '1'],
  ['E7', '0.15625'],
  ['E8', '3.4028235e38'],
  ['E9', '3.5e38'],
  ['E10', '1e-40'],
  ['E11', '1e-45'],
  ['E12', '7e-46'],
  ['E13', '1.00000017881393432617187499'],
  ['E14', '16777217'],
  ['E15', '-0'],
].map(([id, input]) => ({ id, input }));
const DECODE_EXAMPLES = [
  ['X1', '0.15625'],
  ['X2', '1e-45'],
  ['X3', '1.17549435e-38'],
  ['X4', '-0'],
  ['X5', 'Infinity'],
  ['X6', 'NaN'],
].map(([id, source]) => ({ id, source }));
const ADD_SUB_EXAMPLES: { id: string; op: '+' | '-'; a: string; b: string; label: string }[] = [
  { id: 'A1', op: '+', a: '0.5', b: '-0.4375', label: '0.5 + (-0.4375)' },
  { id: 'A2', op: '+', a: '0.1', b: '0.2', label: '0.1 + 0.2' },
  { id: 'A3', op: '+', a: '1', b: '1e-8', label: '1 + 1e-8' },
  { id: 'A4', op: '+', a: '16777216', b: '1', label: '16777216 + 1' },
  { id: 'A5', op: '+', a: '16777216', b: '3', label: '16777216 + 3' },
  { id: 'A6', op: '-', a: '1.0000001', b: '1', label: '1.0000001 - 1' },
];
const FRACTION_EXAMPLES: { id: string; input: string; bits: number }[] = [
  { id: 'F1', input: '0.375', bits: 8 },
  { id: 'F2', input: '0.625', bits: 8 },
  { id: 'F3', input: '0.1', bits: 16 },
  { id: 'F4', input: '0.1', bits: 23 },
  { id: 'F5', input: '0.1', bits: 8 },
];
const INTEGER_EXAMPLES = [
  { id: 'I1', bits: '00001010' },
  { id: 'I2', bits: '00001011' },
  { id: 'I3', bits: '11111111' },
];
const findExample = (id: string) => ADD_SUB_EXAMPLES.find((e) => e.id === id);

function run(id: string) {
  const ex = findExample(id);
  if (!ex) throw new Error(id);
  const s = simulate(F32, ex.op, ex.a, ex.b);
  if (!s.ok) throw new Error(`${id} did not parse`);
  return s.result;
}

describe('C.1 encode', () => {
  const expected: Record<string, [string, string]> = {
    E1: ['0x40B80000', '5.75'],
    E2: ['0xC1540000', '-13.25'],
    E3: ['0x3DCCCCCD', '0.100000001490116119384765625'],
    E4: ['0x3E4CCCCD', '0.20000000298023223876953125'],
    E5: ['0x3E99999A', '0.300000011920928955078125'],
    E6: ['0x3F800000', '1'],
    E7: ['0x3E200000', '0.15625'],
    E8: ['0x7F7FFFFF', '340282346638528859811704183484516925440'],
    E9: ['0x7F800000', 'Infinity'],
    E10: ['0x000116C2', '9.999946101114759581525919'],
    E11: ['0x00000001', '1.401298464324817070923729'],
    E12: ['0x00000000', '0'],
    E13: ['0x3F800001', '1.00000011920928955078125'],
    E14: ['0x4B800000', '16777216'],
    E15: ['0x80000000', '-0'],
  };
  it('covers every example', () => {
    expect(ENCODE_EXAMPLES.map((e) => e.id)).toEqual(Object.keys(expected));
  });
  for (const ex of ENCODE_EXAMPLES) {
    it(`${ex.id} ${ex.input}`, () => {
      const r = encodeDecimal(F32, ex.input);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      const [bits, stored] = expected[ex.id];
      expect(hex(r)).toBe(bits);
      // E10/E11 are listed as truncated scientific notation, the rest in full plain digits
      if (ex.id === 'E10' || ex.id === 'E11') {
        expect(exactDecimal(F32, r.bits).startsWith(stored)).toBe(true);
      } else {
        expect(exactDecimal(F32, r.bits, { scientific: false })).toBe(stored);
      }
    });
  }

  it('E1 steps: 101.11 = 1.0111 x 2^2, E = 129', () => {
    const r = encodeDecimal(F32, '5.75');
    if (!r.ok) throw new Error();
    expect(stepOf(r, 'int-binary').binary).toBe('101');
    expect(stepOf(r, 'frac-binary').binary).toBe('11');
    expect(stepOf(r, 'frac-binary').terminated).toBe(true);
    expect(stepOf(r, 'point')).toMatchObject({ e: 2, direction: 'left', amount: 2 });
    expect(stepOf(r, 'exponent').result).toBe(129);
    expect(stepOf(r, 'round').decision).toBe('exact');
    expect(r.equal).toBe(true);
  });

  it('E2 steps: 1101.01 = 1.10101 x 2^3, E = 130', () => {
    const r = encodeDecimal(F32, '-13.25');
    if (!r.ok) throw new Error();
    expect(stepOf(r, 'sign').result).toBe(1);
    expect(stepOf(r, 'int-binary').binary).toBe('1101');
    expect(stepOf(r, 'point').e).toBe(3);
    expect(stepOf(r, 'exponent').result).toBe(130);
  });

  it('E3 0.1 rounds up and differs from the input', () => {
    const r = encodeDecimal(F32, '0.1');
    if (!r.ok) throw new Error();
    expect(stepOf(r, 'round').decision).toBe('up');
    expect(r.equal).toBe(false);
    expect(r.flags.inexact).toBe(true);
    expect(stepOf(r, 'frac-binary').terminated).toBe(false);
  });

  it('E9 overflow, E10 subnormal, E12 underflow to zero, E14 tie to even', () => {
    const e9 = encodeDecimal(F32, '3.5e38');
    const e10 = encodeDecimal(F32, '1e-40');
    const e12 = encodeDecimal(F32, '7e-46');
    const e14 = encodeDecimal(F32, '16777217');
    if (!e9.ok || !e10.ok || !e12.ok || !e14.ok) throw new Error();
    expect(stepOf(e9, 'range').outcome).toBe('overflow');
    expect(e9.flags.overflow).toBe(true);
    expect(stepOf(e10, 'range').outcome).toBe('underflow-subnormal');
    expect(stepOf(e10, 'point').subnormal).toBe(true);
    expect(stepOf(e12, 'range').outcome).toBe('underflow-zero');
    expect(e12.flags.underflow).toBe(true);
    expect(stepOf(e14, 'round').decision).toBe('tie-even-down');
  });
});

describe('C.2 decode', () => {
  const expected: Record<string, [string, string, string]> = {
    X1: ['0x3E200000', 'normal', '0.15625'],
    X2: ['0x00000001', 'subnormal', '1.401298464324817070923729'],
    X3: ['0x00800000', 'normal', '1.175494350822287507968736'],
    X4: ['0x80000000', 'zero', '-0'],
    X5: ['0x7F800000', 'infinity', 'Infinity'],
    X6: ['0x7FC00000', 'nan', 'NaN'],
  };
  for (const ex of DECODE_EXAMPLES) {
    it(`${ex.id} ${ex.source}`, () => {
      const bits = enc(ex.source);
      const [h, cls, value] = expected[ex.id];
      expect(hex(bits)).toBe(h);
      const d = decodeWithSteps(F32, bits);
      expect(d.cls).toBe(cls);
      expect(exactDecimal(F32, bits).startsWith(value)).toBe(true);
      expect(d.steps.at(-1)?.kind).toBe('value');
    });
  }
  it('X1 = 1.01 x 2^-3', () => {
    const d = decodeWithSteps(F32, enc('0.15625'));
    expect(stepOf(d, 'exponent').result).toBe(-3);
    expect(stepOf(d, 'significand').significand).toBe(0b101n << 21n);
  });
  it('X5 negative infinity', () => {
    expect(exactDecimal(F32, 0xff800000n)).toBe('-Infinity');
  });
});

describe('C.3 add/sub', () => {
  const expected: Record<string, string> = {
    A1: '0x3D800000',
    A2: '0x3E99999A',
    A3: '0x3F800000',
    A4: '0x4B800000',
    A5: '0x4B800002',
    A6: '0x34000000',
  };
  for (const ex of ADD_SUB_EXAMPLES) {
    it(`${ex.id} ${ex.label}`, () => expect(hex(run(ex.id))).toBe(expected[ex.id]));
  }
  it('A1: d = 1, normalize left 3, exact', () => {
    const r = run('A1');
    expect(stepOf(r, 'align').shift).toBe(1);
    expect(stepOf(r, 'normalize')).toMatchObject({ direction: 'left', amount: 3 });
    expect(stepOf(r, 'round').decision).toBe('exact');
  });
  it('A2: d = 1, G=1 R=1 S=0 up, exact sum', () => {
    const r = run('A2');
    expect(stepOf(r, 'align').shift).toBe(1);
    expect(stepOf(r, 'round')).toMatchObject({ guard: 1, round: 1, sticky: 0, decision: 'up' });
    expect(formatRational(r.exact!)).toBe('0.300000004470348358154296875');
  });
  it('A3: d = 27, only sticky survives, rounds down', () => {
    const r = run('A3');
    expect(stepOf(r, 'align')).toMatchObject({ shift: 27, sticky: 1 });
    expect(stepOf(r, 'round')).toMatchObject({ guard: 0, round: 0, sticky: 1, decision: 'down' });
  });
  it('A4: d = 24, tie with even LSB rounds down', () => {
    const r = run('A4');
    expect(stepOf(r, 'align').shift).toBe(24);
    expect(stepOf(r, 'round')).toMatchObject({
      guard: 1,
      round: 0,
      sticky: 0,
      decision: 'tie-even-down',
    });
  });
  it('A5: d = 23, tie with odd LSB rounds up', () => {
    const r = run('A5');
    expect(stepOf(r, 'align').shift).toBe(23);
    expect(stepOf(r, 'round')).toMatchObject({
      guard: 1,
      round: 0,
      sticky: 0,
      decision: 'tie-even-up',
    });
  });
  it('A6: d = 0, cancellation, normalize left 23, exact', () => {
    const r = run('A6');
    expect(hasStep(r, 'negate')).toBe(true);
    expect(stepOf(r, 'align').shift).toBe(0);
    expect(stepOf(r, 'normalize')).toMatchObject({ direction: 'left', amount: 23 });
    expect(stepOf(r, 'round').decision).toBe('exact');
  });
});

describe('C.5 chapters 1-2', () => {
  it('I1-I3', () => {
    const want: Record<string, number> = { I1: 10, I2: 11, I3: 255 };
    for (const ex of INTEGER_EXAMPLES) expect(uintValue(ex.bits)).toBe(want[ex.id]);
    const steps = uintSteps('00001011');
    expect(steps.map((s) => s.current?.weight ?? 0)).toEqual([0, 8, 2, 1]);
    expect(steps.at(-1)?.sum).toBe(11);
  });

  const want: Record<
    string,
    { bits?: string; approx: string; error: string; repeat?: [number, number] }
  > = {
    F1: { bits: '011', approx: '0.375', error: '0' },
    F2: { bits: '101', approx: '0.625', error: '0' },
    F3: {
      bits: '0001100110011001',
      approx: '0.0999908447265625',
      error: '0.0000091552734375',
      repeat: [2, 4],
    },
    F4: { approx: '0.099999904632568359375', error: '0.000000095367431640625' },
    F5: { bits: '00011001', approx: '0.09765625', error: '0.00234375' },
  };
  for (const ex of FRACTION_EXAMPLES) {
    it(`${ex.id} ${ex.input} at ${ex.bits} bits`, () => {
      const r = fractionToBinary(ex.input, ex.bits);
      if (!r.ok) throw new Error();
      const w = want[ex.id];
      if (w.bits) expect(r.bits).toBe(w.bits);
      expect(formatRational(r.approx, { scientific: false })).toBe(w.approx);
      expect(formatRational(r.error, { scientific: false })).toBe(w.error);
      if (w.repeat) expect(r.repeat).toEqual({ start: w.repeat[0], length: w.repeat[1] });
      expect(r.terminated).toBe(w.error === '0');
    });
  }
  it('F1 terminates at 3 bits', () => {
    const r = fractionToBinary('0.375', 8);
    if (!r.ok) throw new Error();
    expect(r.terminatesAt).toBe(3);
    expect(r.repeat).toBeNull();
    expect(R.isZero(r.error)).toBe(true);
  });
});
