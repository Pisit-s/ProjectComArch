import type { FpFrame } from './fp-frames';

/**
 * Chapter 6: which boxes and wires of the floating-point adder are active in each frame of the
 * add / subtract scenes, and the value shown on a wire. The drawing (positions) lives in
 * src/content/lesson/circuit.ts and must use these ids (a test checks that).
 */
export const BLOCK_IDS = [
  'regA',
  'regB',
  'smallAlu',
  'control',
  'muxExp',
  'muxSmall',
  'muxBig',
  'shift',
  'bigAlu',
  'normalize',
  'incdec',
  'round',
  'regR',
] as const;
export type BlockId = (typeof BLOCK_IDS)[number];

export const WIRE_IDS = [
  'a-exp',
  'b-exp',
  'a-sig',
  'b-sig',
  'b-sign',
  'alu-ctl',
  'exp-mux',
  'sig-small',
  'sig-big',
  'mux-shift',
  'shift-alu',
  'big-alu',
  'alu-norm',
  'exp-incdec',
  'norm-round',
  'round-back',
  'incdec-out',
  'round-out',
] as const;
export type WireId = (typeof WIRE_IDS)[number];

export interface CircuitState {
  active: BlockId[];
  wires: WireId[];
  labels: Partial<Record<WireId, string>>;
}

export function circuitState(frame: FpFrame): CircuitState {
  const p = frame.params;
  switch (frame.stage) {
    case 'unpack':
      return {
        active: ['regA', 'regB'],
        wires: ['a-exp', 'b-exp', 'a-sig', 'b-sig'],
        labels: { 'a-exp': p.EA, 'b-exp': p.EB, 'a-sig': p.sigA, 'b-sig': p.sigB },
      };
    case 'negate':
      return { active: ['control', 'regB'], wires: ['b-sign'], labels: { 'b-sign': 'op = −' } };
    case 'swap':
      return {
        active: ['control', 'muxSmall', 'muxBig'],
        wires: ['sig-small', 'sig-big'],
        labels: {},
      };
    case 'compare':
      return {
        active: ['smallAlu', 'control'],
        wires: ['a-exp', 'b-exp', 'alu-ctl'],
        labels: { 'a-exp': p.EA, 'b-exp': p.EB, 'alu-ctl': `d = ${p.d}` },
      };
    case 'align':
    case 'alignFast': {
      const moved = frame.rows[1]?.shifted ?? 0;
      return {
        active: ['muxExp', 'muxSmall', 'muxBig', 'shift'],
        wires: ['exp-mux', 'sig-small', 'sig-big', 'mux-shift', 'shift-alu'],
        labels: { 'shift-alu': `>> ${moved}` },
      };
    }
    case 'add':
    case 'sub':
      return {
        active: ['bigAlu'],
        wires: ['shift-alu', 'big-alu', 'alu-norm'],
        labels: { 'alu-norm': p.sum },
      };
    case 'normalize': {
      const n = frame.normalize!;
      const shiftLabel =
        n.direction === 'right'
          ? `>> ${n.amount}`
          : n.direction === 'left'
            ? `<< ${n.amount}`
            : '>> 0';
      const expLabel =
        n.direction === 'right' ? `+${n.amount}` : n.direction === 'left' ? `−${n.amount}` : '+0';
      return {
        active: ['normalize', 'incdec'],
        wires: ['alu-norm', 'exp-incdec', 'norm-round'],
        labels: { 'norm-round': shiftLabel, 'exp-incdec': expLabel },
      };
    }
    case 'overflow':
    case 'underflow':
      return { active: ['normalize', 'incdec'], wires: ['exp-incdec'], labels: {} };
    case 'round':
      return {
        active: ['round'],
        wires: ['norm-round', 'round-out'],
        labels: { 'round-out': `GRS = ${p.g}${p.r}${p.s}` },
      };
    case 'roundCarry':
      return { active: ['round', 'normalize'], wires: ['round-back'], labels: {} };
    case 'pack':
      return {
        active: ['regR'],
        wires: ['round-out', 'incdec-out'],
        labels: { 'round-out': p.hex },
      };
    case 'special':
      return { active: ['control', 'regR'], wires: ['incdec-out'], labels: {} };
  }
}
