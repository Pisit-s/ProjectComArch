import { describe, expect, it } from 'vitest';
import { type PlayState, parsePlayQuery, toPlayQuery } from '@/lib/url-state';

const q = (s: string) => new URLSearchParams(s);
const DEFAULT: PlayState = { op: '+', a: '6.5', b: '3.75', step: null };

describe('playground url state', () => {
  it('round trips a state', () => {
    const { state, invalid, present } = parsePlayQuery(q('a=0.1&b=0.2&op=sub&step=round'), DEFAULT);
    expect(invalid).toEqual([]);
    expect(present).toBe(true);
    expect(state).toEqual({ op: '-', a: '0.1', b: '0.2', step: 'round' });
    expect(toPlayQuery(state)).toBe('a=0.1&b=0.2&op=sub&step=round');
    expect(parsePlayQuery(q(toPlayQuery(state)), DEFAULT).state).toEqual(state);
  });
  it('falls back to defaults for bad values (old lab links included)', () => {
    const { state, invalid } = parsePlayQuery(q('op=mul&a=1,5&b=abc&step=<b>'), DEFAULT);
    expect(invalid).toEqual(['op', 'a', 'b', 'step']);
    expect(state).toEqual(DEFAULT);
  });
  it('empty query is the default and not present', () => {
    expect(parsePlayQuery(q('tab=calc'), DEFAULT)).toEqual({
      state: DEFAULT,
      invalid: [],
      present: false,
    });
    expect(toPlayQuery(DEFAULT)).toBe('a=6.5&b=3.75&op=add');
  });
});
