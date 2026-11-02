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
  kind: WireKind;
  points: [number, number][];
  dashed?: boolean;
}

export const CIRCUIT_VIEWBOX = { w: 360, h: 600 } as const;

export const BLOCKS: CircuitBlock[] = [
  { id: 'regA', kind: 'register', label: 'A', x: 10, y: 10, w: 160, h: 30 },
  { id: 'regB', kind: 'register', label: 'B', x: 190, y: 10, w: 160, h: 30 },
  {
    id: 'smallAlu',
    kind: 'alu',
    label: 'Small ALU',
    x: 20,
    y: 80,
    w: 90,
    h: 50,
    vocab: 'smallAlu',
  },
  { id: 'control', kind: 'box', label: 'Control', x: 140, y: 84, w: 90, h: 32, vocab: 'control' },
  { id: 'muxExp', kind: 'mux', label: 'MUX', x: 40, y: 170, w: 70, h: 26, vocab: 'mux' },
  { id: 'muxSmall', kind: 'mux', label: 'MUX', x: 150, y: 170, w: 80, h: 26, vocab: 'mux' },
  { id: 'muxBig', kind: 'mux', label: 'MUX', x: 262, y: 170, w: 80, h: 26, vocab: 'mux' },
  {
    id: 'shift',
    kind: 'box',
    label: 'Shift right',
    x: 145,
    y: 220,
    w: 90,
    h: 32,
    vocab: 'shifter',
  },
  { id: 'bigAlu', kind: 'alu', label: 'Big ALU', x: 200, y: 290, w: 140, h: 60, vocab: 'bigAlu' },
  { id: 'incdec', kind: 'box', label: 'Inc / Dec', x: 20, y: 390, w: 90, h: 32 },
  {
    id: 'normalize',
    kind: 'box',
    label: 'Normalize',
    x: 200,
    y: 390,
    w: 140,
    h: 32,
    vocab: 'normalize',
  },
  { id: 'round', kind: 'box', label: 'Round', x: 200, y: 470, w: 140, h: 32, vocab: 'roundingHw' },
  { id: 'regR', kind: 'register', label: 'ผลลัพธ์', x: 60, y: 560, w: 240, h: 30 },
];

export const WIRES: CircuitWire[] = [
  {
    id: 'a-exp',
    kind: 'exp',
    points: [
      [50, 40],
      [50, 62],
      [42, 62],
      [42, 80],
    ],
  },
  {
    id: 'b-exp',
    kind: 'exp',
    points: [
      [230, 40],
      [230, 62],
      [87, 62],
      [87, 80],
    ],
  },
  {
    id: 'a-sig',
    kind: 'sig',
    points: [
      [122, 40],
      [122, 150],
    ],
  },
  {
    id: 'b-sig',
    kind: 'sig',
    points: [
      [302, 40],
      [302, 150],
    ],
  },
  {
    id: 'b-sign',
    kind: 'sign',
    points: [
      [198, 40],
      [198, 84],
    ],
  },
  {
    id: 'alu-ctl',
    kind: 'ctl',
    points: [
      [106, 100],
      [140, 100],
    ],
  },
  {
    id: 'exp-mux',
    kind: 'exp',
    points: [
      [65, 130],
      [65, 170],
    ],
  },
  {
    id: 'sig-small',
    kind: 'sig',
    points: [
      [122, 150],
      [190, 150],
      [190, 170],
    ],
  },
  {
    id: 'sig-big',
    kind: 'sig',
    points: [
      [302, 150],
      [302, 170],
    ],
  },
  {
    id: 'mux-shift',
    kind: 'sig',
    points: [
      [190, 196],
      [190, 220],
    ],
  },
  {
    id: 'shift-alu',
    kind: 'sig',
    points: [
      [190, 252],
      [190, 270],
      [235, 270],
      [235, 290],
    ],
  },
  {
    id: 'big-alu',
    kind: 'sig',
    points: [
      [305, 196],
      [305, 290],
    ],
  },
  {
    id: 'alu-norm',
    kind: 'sig',
    points: [
      [270, 350],
      [270, 390],
    ],
  },
  {
    id: 'exp-incdec',
    kind: 'exp',
    points: [
      [75, 196],
      [75, 390],
    ],
  },
  {
    id: 'norm-round',
    kind: 'sig',
    points: [
      [270, 422],
      [270, 470],
    ],
  },
  {
    id: 'round-back',
    kind: 'sig',
    dashed: true,
    points: [
      [340, 486],
      [354, 486],
      [354, 406],
      [340, 406],
    ],
  },
  {
    id: 'incdec-out',
    kind: 'exp',
    points: [
      [65, 422],
      [65, 530],
      [120, 530],
      [120, 560],
    ],
  },
  {
    id: 'round-out',
    kind: 'sig',
    points: [
      [270, 502],
      [270, 530],
      [228, 530],
      [228, 560],
    ],
  },
];
