import { type FloatFormat, bias, emin } from '@/lib/fp';
import type { CaptionKey } from './keys';

/**
 * Scene 3.1: the format only (no number is read or written here). Six frames reveal the three
 * fields one by one, the hidden bit, then the formula that ties them together.
 */
export type FormatField = 'sign' | 'exp' | 'sig';

export interface FormatFrame {
  id: 'bits' | 'sign' | 'exp' | 'sig' | 'hidden' | 'formula';
  captionKey: CaptionKey;
  /** Fields already explained (coloured). */
  shown: Record<FormatField, boolean>;
  focus: FormatField | null;
  hidden: boolean;
  formula: boolean;
  /** Show the real exponent → stored Exponent ruler. */
  ruler: boolean;
}

export interface FormatScene {
  frames: FormatFrame[];
  bias: number;
  /** Real exponent e and the Exponent field that stores it (e + bias), smallest to largest normal. */
  ruler: { real: number; stored: number }[];
}

const none = { sign: false, exp: false, sig: false };

export function buildFormatFrames(fmt: FloatFormat): FormatScene {
  const b = bias(fmt);
  const lo = emin(fmt);
  // the ends of the normal range, zero, and 2 (the exponent of 6.5, the running example)
  const ruler = [lo, 0, 2, b].map((real) => ({ real, stored: real + b }));
  const f = (
    id: FormatFrame['id'],
    captionKey: CaptionKey,
    shown: Record<FormatField, boolean>,
    extra: Partial<FormatFrame> = {},
  ): FormatFrame => ({
    id,
    captionKey,
    shown,
    focus: null,
    hidden: false,
    formula: false,
    ruler: false,
    ...extra,
  });
  return {
    bias: b,
    ruler,
    frames: [
      f('bits', 'layout.bits', none),
      f('sign', 'layout.sign', { ...none, sign: true }, { focus: 'sign' }),
      f('exp', 'layout.exp', { sign: true, exp: true, sig: false }, { focus: 'exp', ruler: true }),
      f('sig', 'layout.sig', { sign: true, exp: true, sig: true }, { focus: 'sig' }),
      f('hidden', 'layout.hidden', { sign: true, exp: true, sig: true }, { hidden: true }),
      f(
        'formula',
        'layout.formula',
        { sign: true, exp: true, sig: true },
        { hidden: true, formula: true },
      ),
    ],
  };
}
