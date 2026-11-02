import type { CaptionKey, Params } from '@/lib/lesson/keys';

export type CaptionFn = (p: Params) => string;
export type CaptionTable = Partial<Record<CaptionKey, CaptionFn>>;

const SUP: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/** Typographic minus for a number that came from a model as text ("-5" → "−5"). */
export const neg = (s: string | undefined): string => (s ?? '').replace(/^-/, '−');

/** "10²" style power for captions (exponent comes from a model as text). */
export const pow = (base: number | string, e: string | number): string =>
  `${base}${[...String(e)].map((c) => SUP[c] ?? c).join('')}`;
