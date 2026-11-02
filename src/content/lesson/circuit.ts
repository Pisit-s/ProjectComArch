import type { BlockId, WireId } from '@/lib/lesson/circuit-map';
import type { VocabId } from './vocab';

/**
 * Layout of the floating-point adder (Chapter 5) following the team's bit-level drawing
 * (วงจร/fp_adder_bitlevel_1.svg, signals in FP-Adder-bit-level-signals-per-block.pdf),
 * rearranged for a 360 × 680 viewBox so it reads on a 390px phone.
 */
export type BlockKind = 'register' | 'alu' | 'mux' | 'box';
export type WireKind = 'exp' | 'sig' | 'sign' | 'ctl';

export interface CircuitBlock {
  id: BlockId;
  kind: BlockKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Term whose meaning is shown when the block is tapped. */
  vocab?: VocabId;
}

export interface CircuitWire {
  id: WireId;
  /** Block the wire leaves (none: an outside input such as `sub`) and the block it enters. */
  from: BlockId | null;
  to: BlockId;
  /** Signal name(s) on this wire, as in the bit-level drawing (e.g. "absD[4:0]"). */
  signal: string;
  kind: WireKind;
  points: [number, number][];
  dashed?: boolean;
  /** The wire starts on another wire (a branch): draw a junction dot there. */
  junction?: boolean;
  /** Move the value chip off a short wire so it never covers a block. */
  chipOffset?: [number, number];
  /** Exact spot of the value chip, picked by hand where no other wire runs. */
  chipAt?: [number, number];
}

export const CIRCUIT_VIEWBOX = { w: 360, h: 700 } as const;

export const BLOCKS: CircuitBlock[] = [
  { id: 'regA', kind: 'register', label: 'A', x: 5, y: 10, w: 170, h: 30 },
  { id: 'regB', kind: 'register', label: 'B', x: 185, y: 10, w: 170, h: 30 },
  {
    id: 'smallAlu',
    kind: 'alu',
    label: 'Small ALU',
    x: 130,
    y: 76,
    w: 90,
    h: 36,
    vocab: 'smallAlu',
  },
  { id: 'control', kind: 'box', label: 'Control', x: 112, y: 140, w: 140, h: 42, vocab: 'control' },
  { id: 'muxExp', kind: 'mux', label: 'MUX exp', x: 20, y: 262, w: 80, h: 30, vocab: 'mux' },
  { id: 'muxSmall', kind: 'mux', label: 'MUX small', x: 120, y: 262, w: 80, h: 30, vocab: 'mux' },
  { id: 'muxBig', kind: 'mux', label: 'MUX large', x: 240, y: 262, w: 80, h: 30, vocab: 'mux' },
  {
    id: 'shift',
    kind: 'box',
    label: 'Shift right',
    x: 115,
    y: 318,
    w: 90,
    h: 32,
    vocab: 'shifter',
  },
  { id: 'bigAlu', kind: 'alu', label: 'Big ALU', x: 150, y: 380, w: 160, h: 52, vocab: 'bigAlu' },
  { id: 'negate', kind: 'box', label: 'Negate if < 0', x: 165, y: 468, w: 130, h: 24 },
  {
    id: 'normalize',
    kind: 'box',
    label: 'Normalize',
    x: 165,
    y: 515,
    w: 130,
    h: 30,
    vocab: 'normalize',
  },
  { id: 'incdec', kind: 'box', label: 'Inc / Dec', x: 10, y: 575, w: 100, h: 35 },
  { id: 'round', kind: 'box', label: 'Round', x: 165, y: 575, w: 130, h: 30, vocab: 'roundingHw' },
  { id: 'regR', kind: 'register', label: 'ผลลัพธ์', x: 30, y: 660, w: 300, h: 30 },
];

type P = [number, number];
const w = (
  id: WireId,
  kind: WireKind,
  from: BlockId | null,
  to: BlockId,
  signal: string,
  points: P[],
  extra: Partial<CircuitWire> = {},
): CircuitWire => ({ id, kind, from, to, signal, points, ...extra });

export const WIRES: CircuitWire[] = [
  // signs go to Control
  w('a-sign', 'sign', 'regA', 'control', 'sA', [
    [13, 40],
    [13, 162],
    [112, 162],
  ]),
  w('b-sign', 'sign', 'regB', 'control', 'sB', [
    [193, 40],
    [193, 140],
  ]),
  // each exponent goes to the Small ALU and (branch) to the exponent MUX
  w(
    'a-exp',
    'exp',
    'regA',
    'smallAlu',
    'eA[7:0]',
    [
      [40, 40],
      [40, 60],
      [150, 60],
      [150, 76],
    ],
    { chipAt: [120, 60] },
  ),
  w(
    'b-exp',
    'exp',
    'regB',
    'smallAlu',
    'eB[7:0]',
    [
      [225, 40],
      [225, 60],
      [200, 60],
      [200, 76],
    ],
    { chipAt: [243, 50] },
  ),
  w(
    'a-exp-mux',
    'exp',
    'regA',
    'muxExp',
    'eA[7:0]',
    [
      [40, 60],
      [40, 262],
    ],
    { junction: true },
  ),
  w(
    'b-exp-mux',
    'exp',
    'regB',
    'muxExp',
    'eB[7:0]',
    [
      [225, 60],
      [262, 60],
      [262, 200],
      [80, 200],
      [80, 262],
    ],
    { junction: true },
  ),
  // each significand with its hidden 1 goes to both significand MUXes
  w(
    'a-sig',
    'sig',
    'regA',
    'muxSmall',
    'mA = {1, fA}',
    [
      [85, 40],
      [85, 215],
      [180, 215],
      [180, 262],
    ],
    { chipAt: [137, 215] },
  ),
  w(
    'a-sig-big',
    'sig',
    'regA',
    'muxBig',
    'mA = {1, fA}',
    [
      [180, 215],
      [260, 215],
      [260, 262],
    ],
    { junction: true },
  ),
  w(
    'b-sig',
    'sig',
    'regB',
    'muxBig',
    'mB = {1, fB}',
    [
      [300, 40],
      [300, 262],
    ],
    { chipAt: [300, 105] },
  ),
  w(
    'b-sig-small',
    'sig',
    'regB',
    'muxSmall',
    'mB = {1, fB}',
    [
      [300, 230],
      [140, 230],
      [140, 262],
    ],
    { junction: true },
  ),
  // Small ALU: who is larger goes to Control, how far to shift goes to the shifter
  w(
    'alu-ctl',
    'ctl',
    'smallAlu',
    'control',
    'neg',
    [
      [175, 112],
      [175, 140],
    ],
    { chipAt: [145, 126] },
  ),
  w(
    'alu-shift',
    'exp',
    'smallAlu',
    'shift',
    'absD[4:0]',
    [
      [136, 94],
      [96, 94],
      [96, 330],
      [115, 330],
    ],
    { chipAt: [106, 94] },
  ),
  w('alu-far', 'ctl', 'smallAlu', 'shift', 'far', [
    [141, 108],
    [104, 108],
    [104, 342],
    [115, 342],
  ]),
  // Control
  w(
    'sub-in',
    'ctl',
    null,
    'control',
    'sub',
    [
      [358, 150],
      [252, 150],
    ],
    { chipAt: [330, 150] },
  ),
  w('ctl-mux-exp', 'ctl', 'control', 'muxExp', 'sel', [
    [170, 182],
    [170, 247],
    [60, 247],
    [60, 262],
  ]),
  w('ctl-mux-small', 'ctl', 'control', 'muxSmall', 'sel', [
    [170, 182],
    [170, 247],
    [160, 247],
    [160, 262],
  ]),
  w(
    'ctl-mux-big',
    'ctl',
    'control',
    'muxBig',
    'sel',
    [
      [170, 182],
      [170, 247],
      [280, 247],
      [280, 262],
    ],
    { chipAt: [220, 247] },
  ),
  w(
    'ctl-alu',
    'ctl',
    'control',
    'bigAlu',
    'Binv, CarryIn',
    [
      [252, 178],
      [335, 178],
      [335, 405],
      [302, 405],
    ],
    { chipAt: [318, 405] },
  ),
  w('big-neg', 'ctl', 'bigAlu', 'control', 'bigNeg', [
    [305, 420],
    [348, 420],
    [348, 168],
    [252, 168],
  ]),
  w('ctl-sign', 'sign', 'control', 'regR', 'signR', [
    [112, 175],
    [5, 175],
    [5, 645],
    [45, 645],
    [45, 660],
  ]),
  // data path
  w('exp-incdec', 'exp', 'muxExp', 'incdec', 'E0[7:0]', [
    [60, 292],
    [60, 575],
  ]),
  w('mux-shift', 'sig', 'muxSmall', 'shift', 'mSmall', [
    [160, 292],
    [160, 318],
  ]),
  w('shift-alu', 'sig', 'shift', 'bigAlu', 'Q = {Y, G, R, S}', [
    [160, 350],
    [160, 365],
    [190, 365],
    [190, 380],
  ]),
  w('big-alu', 'sig', 'muxBig', 'bigAlu', 'P = {X, 000}', [
    [280, 292],
    [280, 365],
    [270, 365],
    [270, 380],
  ]),
  w(
    'alu-negate',
    'sig',
    'bigAlu',
    'negate',
    'T[27:0]',
    [
      [230, 432],
      [230, 468],
    ],
    { chipAt: [272, 450] },
  ),
  w(
    'negate-norm',
    'sig',
    'negate',
    'normalize',
    'Z, G2 R2 S2',
    [
      [230, 492],
      [230, 515],
    ],
    { chipOffset: [40, 0] },
  ),
  w('norm-incdec', 'exp', 'normalize', 'incdec', 'dir, cnt', [
    [165, 530],
    [85, 530],
    [85, 575],
  ]),
  w(
    'norm-round',
    'sig',
    'normalize',
    'round',
    'M, G3 R3 S3',
    [
      [230, 545],
      [230, 575],
    ],
    { chipAt: [270, 560] },
  ),
  w(
    'round-ovf',
    'ctl',
    'round',
    'incdec',
    'ovf',
    [
      [165, 595],
      [110, 595],
    ],
    { chipAt: [137, 583] },
  ),
  w('incdec-out', 'exp', 'incdec', 'regR', 'E[7:0]', [
    [60, 610],
    [60, 635],
    [105, 635],
    [105, 660],
  ]),
  w(
    'round-out',
    'sig',
    'round',
    'regR',
    'F[22:0]',
    [
      [230, 605],
      [230, 660],
    ],
    { chipAt: [230, 632] },
  ),
];
