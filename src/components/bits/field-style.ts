export type FieldKind = 'sign' | 'exp' | 'frac' | 'hidden' | 'grs' | 'plain';

/** One colour set per field, the same in every chapter (FR-08, docs/plans/stage1-floating-point.md 9.4). */
export const FIELD_STYLE: Record<
  FieldKind,
  {
    on: string;
    off: string;
    border: string;
    text: string;
    chip: string;
    label: string;
    short: string;
  }
> = {
  sign: {
    on: 'bg-bit-sign/14',
    off: 'bg-bit-sign/6',
    border: 'border-bit-sign',
    text: 'text-bit-sign-ink',
    chip: 'bg-bit-sign',
    label: 'Sign',
    short: 'S',
  },
  exp: {
    on: 'bg-bit-exp/14',
    off: 'bg-bit-exp/6',
    border: 'border-bit-exp',
    text: 'text-bit-exp-ink',
    chip: 'bg-bit-exp',
    label: 'Exponent',
    short: 'E',
  },
  frac: {
    on: 'bg-bit-frac/14',
    off: 'bg-bit-frac/6',
    border: 'border-bit-frac',
    text: 'text-bit-frac-ink',
    chip: 'bg-bit-frac',
    label: 'Fraction',
    short: 'F',
  },
  hidden: {
    on: 'bg-bit-frac/14',
    off: 'bg-bit-frac/6',
    border: 'border-bit-frac border-dashed',
    text: 'text-bit-frac-ink',
    chip: 'bg-bit-frac',
    label: 'Hidden bit',
    short: 'h',
  },
  grs: {
    on: 'bg-bit-grs/14',
    off: 'bg-bit-grs/6',
    border: 'border-bit-grs',
    text: 'text-bit-grs-ink',
    chip: 'bg-bit-grs',
    label: 'Guard / Round / Sticky',
    short: 'GRS',
  },
  plain: {
    on: 'bg-primary/12',
    off: 'bg-ice-100',
    border: 'border-primary/60',
    text: 'text-ink',
    chip: 'bg-primary',
    label: 'บิต',
    short: 'b',
  },
};
