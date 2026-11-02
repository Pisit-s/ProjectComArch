import type { BlockId, WireId } from '@/lib/lesson/circuit-map';
import type { VocabId } from './vocab';

/**
 * Layout of the floating-point adder (Chapter 6), drawn for a 360 × 600 viewBox so it reads on a
 * 390px phone. Arranged top to bottom in the order of P&H 3.5; our own drawing, not the figure.
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
  /** Block the wire leaves and the block it enters (values shown when a block is tapped). */
  from: BlockId;
  to: BlockId;
  kind: WireKind;
  points: [number, number][];
  dashed?: boolean;
  /** The wire starts on another wire (a branch): draw a junction dot there. */
  junction?: boolean;
  /** Move the value chip off a short wire so it never covers a block. */
  chipOffset?: [number, number];
}

export const CIRCUIT_VIEWBOX = { w: 360, h: 610 } as const;

/*
 * Data flows top to bottom. Every MUX has two data inputs (from A and from B) and a dashed select
 * line from Control; Control reads the exponent difference and both signs, then drives the three
 * MUX selects, the shift amount and add/subtract of the Big ALU.
 */
export const BLOCKS: CircuitBlock[] = [
  { id: 'regA', kind: 'register', label: 'A', x: 10, y: 10, w: 160, h: 30 },
  { id: 'regB', kind: 'register', label: 'B', x: 190, y: 10, w: 160, h: 30 },
  {
    id: 'smallAlu',
    kind: 'alu',
    label: 'Small ALU',
    x: 20,
    y: 76,
    w: 80,
    h: 40,
    vocab: 'smallAlu',
  },
  { id: 'control', kind: 'box', label: 'Control', x: 150, y: 80, w: 90, h: 32, vocab: 'control' },
  { id: 'muxExp', kind: 'mux', label: 'MUX', x: 20, y: 196, w: 80, h: 24, vocab: 'mux' },
  { id: 'muxSmall', kind: 'mux', label: 'MUX', x: 150, y: 196, w: 80, h: 24, vocab: 'mux' },
  { id: 'muxBig', kind: 'mux', label: 'MUX', x: 262, y: 196, w: 80, h: 24, vocab: 'mux' },
  {
    id: 'shift',
    kind: 'box',
    label: 'Shift right',
    x: 145,
    y: 250,
    w: 90,
    h: 32,
    vocab: 'shifter',
  },
  { id: 'bigAlu', kind: 'alu', label: 'Big ALU', x: 200, y: 310, w: 140, h: 60, vocab: 'bigAlu' },
  { id: 'incdec', kind: 'box', label: 'Inc / Dec', x: 20, y: 410, w: 90, h: 32 },
  {
    id: 'normalize',
    kind: 'box',
    label: 'Normalize',
    x: 200,
    y: 410,
    w: 140,
    h: 32,
    vocab: 'normalize',
  },
  { id: 'round', kind: 'box', label: 'Round', x: 200, y: 480, w: 140, h: 32, vocab: 'roundingHw' },
  { id: 'regR', kind: 'register', label: 'ผลลัพธ์', x: 60, y: 570, w: 240, h: 30 },
];

type P = [number, number];
const w = (
  id: WireId,
  kind: WireKind,
  from: BlockId,
  to: BlockId,
  points: P[],
  extra: Partial<CircuitWire> = {},
): CircuitWire => ({ id, kind, from, to, points, ...extra });

export const WIRES: CircuitWire[] = [
  // exponents: each one goes to the Small ALU and to the exponent MUX
  w('a-exp', 'exp', 'regA', 'smallAlu', [
    [40, 40],
    [40, 76],
  ]),
  w('b-exp', 'exp', 'regB', 'smallAlu', [
    [230, 40],
    [230, 60],
    [80, 60],
    [80, 76],
  ]),
  w('a-exp-mux', 'exp', 'regA', 'muxExp', [
    [60, 40],
    [60, 50],
    [8, 50],
    [8, 180],
    [36, 180],
    [36, 196],
  ]),
  w(
    'b-exp-mux',
    'exp',
    'regB',
    'muxExp',
    [
      [104, 60],
      [104, 146],
      [84, 146],
      [84, 196],
    ],
    { junction: true },
  ),
  // signs and the exponent difference go to Control
  w('a-sign', 'sign', 'regA', 'control', [
    [18, 40],
    [18, 70],
    [170, 70],
    [170, 80],
  ]),
  w('b-sign', 'sign', 'regB', 'control', [
    [198, 40],
    [198, 80],
  ]),
  w(
    'alu-ctl',
    'ctl',
    'smallAlu',
    'control',
    [
      [96, 96],
      [150, 96],
    ],
    { chipOffset: [0, 14] },
  ),
  // significands: each one goes to both significand MUXes
  w('a-sig', 'sig', 'regA', 'muxSmall', [
    [122, 40],
    [122, 158],
    [166, 158],
    [166, 196],
  ]),
  w('a-sig-big', 'sig', 'regA', 'muxBig', [
    [134, 40],
    [134, 172],
    [278, 172],
    [278, 196],
  ]),
  w('b-sig', 'sig', 'regB', 'muxBig', [
    [326, 40],
    [326, 196],
  ]),
  w('b-sig-small', 'sig', 'regB', 'muxSmall', [
    [290, 40],
    [290, 158],
    [214, 158],
    [214, 196],
  ]),
  // Control drives the MUX selects, the shift amount and add / subtract
  w('ctl-mux-exp', 'ctl', 'control', 'muxExp', [
    [160, 112],
    [160, 134],
    [60, 134],
    [60, 196],
  ]),
  w('ctl-mux-small', 'ctl', 'control', 'muxSmall', [
    [190, 112],
    [190, 196],
  ]),
  w('ctl-mux-big', 'ctl', 'control', 'muxBig', [
    [230, 112],
    [230, 126],
    [302, 126],
    [302, 196],
  ]),
  w('ctl-shift', 'ctl', 'control', 'shift', [
    [240, 96],
    [252, 96],
    [252, 266],
    [235, 266],
  ]),
  w(
    'ctl-alu',
    'ctl',
    'control',
    'bigAlu',
    [
      [240, 106],
      [352, 106],
      [352, 340],
      [330, 340],
    ],
    { chipOffset: [-10, 0] },
  ),
  // data path
  w('mux-shift', 'sig', 'muxSmall', 'shift', [
    [190, 220],
    [190, 250],
  ]),
  w('shift-alu', 'sig', 'shift', 'bigAlu', [
    [190, 282],
    [190, 296],
    [235, 296],
    [235, 310],
  ]),
  w('big-alu', 'sig', 'muxBig', 'bigAlu', [
    [302, 220],
    [302, 310],
  ]),
  w('alu-norm', 'sig', 'bigAlu', 'normalize', [
    [270, 370],
    [270, 410],
  ]),
  w('exp-incdec', 'exp', 'muxExp', 'incdec', [
    [60, 220],
    [60, 410],
  ]),
  w('norm-round', 'sig', 'normalize', 'round', [
    [270, 442],
    [270, 480],
  ]),
  w(
    'round-back',
    'sig',
    'round',
    'normalize',
    [
      [340, 496],
      [352, 496],
      [352, 426],
      [340, 426],
    ],
    {
      dashed: true,
    },
  ),
  w('incdec-out', 'exp', 'incdec', 'regR', [
    [65, 442],
    [65, 550],
    [120, 550],
    [120, 570],
  ]),
  w('round-out', 'sig', 'round', 'regR', [
    [270, 512],
    [270, 550],
    [228, 550],
    [228, 570],
  ]),
];
