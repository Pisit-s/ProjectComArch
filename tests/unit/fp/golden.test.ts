import { describe, expect, it } from 'vitest';
import {
  ADD_SUB_EXAMPLES,
  DECODE_EXAMPLES,
  DIV_EXAMPLES,
  ENCODE_EXAMPLES,
  FRACTION_EXAMPLES,
  INTEGER_EXAMPLES,
  MUL_EXAMPLES,
  findExample,
} from '@/content/examples';
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

describe('C.4 mul/div', () => {
  const expected: Record<string, string> = {
    M1: '0x40700000',
    M2: '0xBE600000',
    M3: '0x418F0000',
    M4: '0x3E99999A',
    M5: '0x7F800000',
    M6: '0x00000000',
    M7: '0x000116C2',
    M8: '0xC1100000',
    M9: '0x3C23D70B',
    M10: '0x80000000',
    M11: '0x7FC00000',
    D1: '0x40400000',
    D2: '0x3F400000',
    D3: '0x3EAAAAAB',
    D4: '0x7F800000',
    D5: '0x7FC00000',
    D6: '0x3F2AAAAB',
    D7: '0x3DCCCCCD',
    D8: '0xC1000000',
    D9: '0x7F800000',
    D10: '0x000116C2',
    D11: '0x00000000',
    D12: '0xFF800000',
    D13: '0x00000000',
  };
  for (const ex of [...MUL_EXAMPLES, ...DIV_EXAMPLES]) {
    it(`${ex.id} ${ex.label}`, () => expect(hex(run(ex.id))).toBe(expected[ex.id]));
  }

  it('M1: E = 127 + 128 - 127 = 128, no normalize, 2 partial products', () => {
    const r = run('M1');
    expect(stepOf(r, 'exponent')).toMatchObject({ ea: 127, eb: 128, result: 128 });
    expect(stepOf(r, 'normalize').direction).toBe('none');
    expect(stepOf(r, 'sig-mul').rows).toHaveLength(2);
  });
  it('M2: sign 0 xor 1, E = 126 + 125 - 127 = 124', () => {
    const r = run('M2');
    expect(stepOf(r, 'sign')).toMatchObject({ a: 0, b: 1, result: 1 });
    expect(stepOf(r, 'exponent')).toMatchObject({ ea: 126, eb: 125, result: 124 });
  });
  it('M3: E 130 -> 131, product 10.001111 shifts right, 3 partial products', () => {
    const r = run('M3');
    expect(stepOf(r, 'exponent').result).toBe(130);
    const mulStep = stepOf(r, 'sig-mul');
    expect(mulStep.rows).toHaveLength(3);
    expect(mulStep.rows.reduce((s, x) => s + x.value, 0n)).toBe(mulStep.product);
    // multiplier is 1.011 (2.75) as in the requirement's worked example
    expect(mulStep.multiplier).toBe(0b1011n << 20n);
    expect(stepOf(r, 'normalize')).toMatchObject({ direction: 'right', amount: 1, expAfter: 131 });
    expect(stepOf(r, 'round')).toMatchObject({ guard: 0, round: 0, sticky: 0 });
  });
  it('M4: E 124 -> 125, G=1 R=1 S=0 up', () => {
    const r = run('M4');
    expect(stepOf(r, 'exponent').result).toBe(124);
    expect(stepOf(r, 'normalize')).toMatchObject({ direction: 'right', expAfter: 125 });
    expect(stepOf(r, 'round')).toMatchObject({ guard: 1, round: 1, sticky: 0, decision: 'up' });
    expect(formatRational(r.exact!)).toBe('0.300000004470348358154296875');
  });
  it('M5: E = 257 -> 258 overflow', () => {
    const r = run('M5');
    expect(stepOf(r, 'exponent').result).toBe(257);
    expect(stepOf(r, 'normalize').expAfter).toBe(258);
    expect(stepOf(r, 'range').outcome).toBe('overflow');
    expect(r.flags).toMatchObject({ overflow: true, inexact: true });
  });
  it('M6: E = 27 + 27 - 127 = -73, underflow to zero', () => {
    const r = run('M6');
    expect(stepOf(r, 'exponent')).toMatchObject({ ea: 27, eb: 27, result: -73 });
    expect(stepOf(r, 'range').outcome).toBe('underflow-zero');
    expect(r.flags.underflow).toBe(true);
  });
  it('M7: denormalize 7 bits, G = 0 rounds down', () => {
    const r = run('M7');
    expect(stepOf(r, 'range')).toMatchObject({ outcome: 'underflow-subnormal', denormShift: 7 });
    expect(stepOf(r, 'round').guard).toBe(0);
    expect(stepOf(r, 'round').decision).toBe('down');
  });
  it('M8: 1.1 x 1.1 = 10.01 shifts right', () => {
    const r = run('M8');
    expect(stepOf(r, 'sign').result).toBe(1);
    expect(stepOf(r, 'normalize').direction).toBe('right');
  });
  it('M9: 13 partial products, G=1 R=0 S=1 up', () => {
    const r = run('M9');
    expect(stepOf(r, 'sig-mul').rows).toHaveLength(13);
    expect(stepOf(r, 'round')).toMatchObject({ guard: 1, round: 0, sticky: 1, decision: 'up' });
    expect(exactDecimal(F32, r.bits)).toBe('0.010000000707805156707763671875');
  });
  it('M10, M11: special rules', () => {
    expect(stepOf(run('M10'), 'special').rule).toBe('zero-times');
    const m11 = run('M11');
    expect(stepOf(m11, 'special').rule).toBe('zero-times-inf');
    expect(m11.flags.invalid).toBe(true);
  });
  it('D1: E = 129 - 128 + 127 = 128, remainder 0', () => {
    const r = run('D1');
    expect(stepOf(r, 'exponent')).toMatchObject({ ea: 129, eb: 128, result: 128 });
    expect(stepOf(r, 'sig-div').remainder).toBe(0n);
    expect(stepOf(r, 'normalize').direction).toBe('none');
  });
  it('D2: E 127 -> 126, quotient 0.11 shifts left', () => {
    const r = run('D2');
    expect(stepOf(r, 'exponent').result).toBe(127);
    expect(stepOf(r, 'normalize')).toMatchObject({ direction: 'left', amount: 1, expAfter: 126 });
  });
  it('D3: E 126 -> 125, Q = 0.1010..., G=1 R=0 S=1 up', () => {
    const r = run('D3');
    expect(stepOf(r, 'exponent').result).toBe(126);
    const d = stepOf(r, 'sig-div');
    expect(d.rows).toHaveLength(27);
    expect(d.quotient.toString(2).padStart(27, '0')).toBe('0' + '10'.repeat(13));
    expect(d.remainder).not.toBe(0n);
    expect(stepOf(r, 'normalize')).toMatchObject({ direction: 'left', expAfter: 125 });
    expect(stepOf(r, 'round')).toMatchObject({ guard: 1, round: 0, sticky: 1, decision: 'up' });
    expect(exactDecimal(F32, r.bits)).toBe('0.3333333432674407958984375');
  });
  it('D4, D5, D12: special rules and flags', () => {
    expect(run('D4').flags.divideByZero).toBe(true);
    expect(run('D5').flags.invalid).toBe(true);
    expect(stepOf(run('D12'), 'special').rule).toBe('div-zero');
  });
  it('D6: G=1 R=0 S=1 up', () => {
    expect(stepOf(run('D6'), 'round')).toMatchObject({
      guard: 1,
      round: 0,
      sticky: 1,
      decision: 'up',
    });
  });
  it('D7: E = 127 - 130 + 127 = 124 -> 123, G=1 R=1 S=1', () => {
    const r = run('D7');
    expect(stepOf(r, 'exponent').result).toBe(124);
    expect(stepOf(r, 'normalize').expAfter).toBe(123);
    expect(stepOf(r, 'round')).toMatchObject({ guard: 1, round: 1, sticky: 1, decision: 'up' });
  });
  it('D8: sign 1, E = 129 - 126 + 127 = 130, remainder 0', () => {
    const r = run('D8');
    expect(stepOf(r, 'sign').result).toBe(1);
    expect(stepOf(r, 'exponent')).toMatchObject({ ea: 129, eb: 126, result: 130 });
    expect(stepOf(r, 'sig-div').remainder).toBe(0n);
  });
  it('D9: E = 254 - 123 + 127 = 258 overflow', () => {
    const r = run('D9');
    expect(stepOf(r, 'exponent').result).toBe(258);
    expect(stepOf(r, 'range').outcome).toBe('overflow');
  });
  it('D10: E = 27 - 160 + 127 = -6, denormalize 7 bits', () => {
    const r = run('D10');
    expect(stepOf(r, 'exponent')).toMatchObject({ ea: 27, eb: 160, result: -6 });
    expect(stepOf(r, 'range')).toMatchObject({ outcome: 'underflow-subnormal', denormShift: 7 });
  });
  it('D11: subnormal dividend 0x006CE3EE, result 0', () => {
    expect(hex(enc('1e-38'))).toBe('0x006CE3EE');
    const r = run('D11');
    expect(stepOf(r, 'decode').cls).toBe('subnormal');
    expect(stepOf(r, 'range').outcome).toBe('underflow-zero');
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
