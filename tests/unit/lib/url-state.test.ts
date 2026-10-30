import { describe, expect, it } from 'vitest';
import { LAB_DEFAULT, defaultHex, parseLabQuery, toLabQuery } from '@/lib/url-state';

const q = (s: string) => new URLSearchParams(s);

describe('lab url state', () => {
  it('round trips a calculator state', () => {
    const { state, invalid } = parseLabQuery(q('tab=calc&op=mul&a=0.1&b=3&step=round'));
    expect(invalid).toEqual([]);
    expect(state).toMatchObject({ tab: 'calc', op: '*', a: '0.1', b: '3', step: 'round' });
    expect(parseLabQuery(q(toLabQuery(state))).state).toEqual(state);
  });
  it('round trips a converter state', () => {
    const { state } = parseLabQuery(q('tab=conv&mode=decode&hex=0x40b80000'));
    expect(state).toMatchObject({ tab: 'conv', mode: 'decode', hex: '40B80000' });
    expect(toLabQuery(state)).toBe('tab=conv&mode=decode&hex=40B80000');
    expect(toLabQuery({ ...state, mode: 'encode', x: '-1e-8' })).toBe(
      'tab=conv&mode=encode&x=-1e-8',
    );
  });
  it('falls back to defaults for bad values', () => {
    const { state, invalid } = parseLabQuery(
      q('tab=x&op=pow&a=1,5&b=abc&mode=zz&hex=XYZ&step=<b>&x='),
    );
    expect(invalid).toEqual(['tab', 'op', 'a', 'b', 'x', 'mode', 'hex', 'step']);
    expect(state).toEqual(LAB_DEFAULT);
  });
  it('formats: binary16 / binary64 with matching hex length', () => {
    const h = parseLabQuery(q('fmt=b16&tab=conv&mode=decode&hex=2e66'));
    expect(h.invalid).toEqual([]);
    expect(h.state).toMatchObject({ fmt: 'b16', hex: '2E66' });
    expect(toLabQuery(h.state)).toBe('fmt=b16&tab=conv&mode=decode&hex=2E66');
    const d = parseLabQuery(q('fmt=b64&tab=conv&mode=decode&hex=3E200000'));
    expect(d.invalid).toEqual(['hex']);
    expect(d.state.hex).toBe(defaultHex('b64'));
    expect(defaultHex('b64')).toHaveLength(16);
    expect(parseLabQuery(q('fmt=b8')).invalid).toEqual(['fmt']);
    expect(toLabQuery(LAB_DEFAULT)).not.toContain('fmt=');
  });
  it('empty query is the default', () => {
    expect(parseLabQuery(q(''))).toEqual({ state: LAB_DEFAULT, invalid: [] });
  });
});
