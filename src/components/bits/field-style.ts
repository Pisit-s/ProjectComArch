export type FieldKind =
  | 'sign'
  | 'exp'
  | 'frac'
  | 'hidden'
  | 'grs'
  | 'plain'
  // MIPS instruction fields (PLAN.md 6.1)
  | 'mips-op'
  | 'mips-rs'
  | 'mips-rt'
  | 'mips-rd'
  | 'mips-const'
  | 'mips-funct'
  // register roles in multiply / divide (PLAN.md 6.1)
  | 'md-operand'
  | 'md-step'
  | 'md-acc'
  | 'md-alu'
  | 'md-test';

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
  'mips-op': {
    on: 'bg-mips-op/14',
    off: 'bg-mips-op/6',
    border: 'border-mips-op',
    text: 'text-mips-op-ink',
    chip: 'bg-mips-op',
    label: 'opcode',
    short: 'op',
  },
  'mips-rs': {
    on: 'bg-mips-rs/14',
    off: 'bg-mips-rs/6',
    border: 'border-mips-rs',
    text: 'text-mips-rs-ink',
    chip: 'bg-mips-rs',
    label: 'rs',
    short: 'rs',
  },
  'mips-rt': {
    on: 'bg-mips-rt/14',
    off: 'bg-mips-rt/6',
    border: 'border-mips-rt',
    text: 'text-mips-rt-ink',
    chip: 'bg-mips-rt',
    label: 'rt',
    short: 'rt',
  },
  'mips-rd': {
    on: 'bg-mips-rd/14',
    off: 'bg-mips-rd/6',
    border: 'border-mips-rd',
    text: 'text-mips-rd-ink',
    chip: 'bg-mips-rd',
    label: 'rd',
    short: 'rd',
  },
  'mips-const': {
    on: 'bg-mips-const/14',
    off: 'bg-mips-const/6',
    border: 'border-mips-const',
    text: 'text-mips-const-ink',
    chip: 'bg-mips-const',
    label: 'shamt / immediate / address',
    short: 'imm',
  },
  'mips-funct': {
    on: 'bg-mips-funct/14',
    off: 'bg-mips-funct/6',
    border: 'border-mips-funct',
    text: 'text-mips-funct-ink',
    chip: 'bg-mips-funct',
    label: 'funct',
    short: 'fn',
  },
  'md-operand': {
    on: 'bg-md-operand/14',
    off: 'bg-md-operand/6',
    border: 'border-md-operand',
    text: 'text-md-operand-ink',
    chip: 'bg-md-operand',
    label: 'Multiplicand / Divisor',
    short: 'M',
  },
  'md-step': {
    on: 'bg-md-step/14',
    off: 'bg-md-step/6',
    border: 'border-md-step',
    text: 'text-md-step-ink',
    chip: 'bg-md-step',
    label: 'Multiplier / Quotient',
    short: 'Q',
  },
  'md-acc': {
    on: 'bg-md-acc/14',
    off: 'bg-md-acc/6',
    border: 'border-md-acc',
    text: 'text-md-acc-ink',
    chip: 'bg-md-acc',
    label: 'Product / Remainder',
    short: 'P',
  },
  'md-alu': {
    on: 'bg-md-alu/14',
    off: 'bg-md-alu/6',
    border: 'border-md-alu',
    text: 'text-md-alu-ink',
    chip: 'bg-md-alu',
    label: 'ALU',
    short: 'ALU',
  },
  'md-test': {
    on: 'bg-md-test/14',
    off: 'bg-md-test/6',
    border: 'border-md-test',
    text: 'text-md-test-ink',
    chip: 'bg-md-test',
    label: 'Control test',
    short: 'T',
  },
};
