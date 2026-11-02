import type { FpFrame } from './fp-frames';
import type { CaptionKey, Params } from './keys';

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
  'negate',
  'normalize',
  'incdec',
  'round',
  'regR',
] as const;
export type BlockId = (typeof BLOCK_IDS)[number];

export const WIRE_IDS = [
  'a-sign',
  'b-sign',
  'a-exp',
  'b-exp',
  'a-exp-mux',
  'b-exp-mux',
  'a-sig',
  'a-sig-big',
  'b-sig',
  'b-sig-small',
  'alu-ctl',
  'alu-shift',
  'alu-far',
  'sub-in',
  'ctl-mux-exp',
  'ctl-mux-small',
  'ctl-mux-big',
  'ctl-alu',
  'big-neg',
  'ctl-sign',
  'exp-incdec',
  'mux-shift',
  'shift-alu',
  'big-alu',
  'alu-negate',
  'negate-norm',
  'norm-incdec',
  'norm-round',
  'round-ovf',
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
        wires: ['a-exp', 'b-exp', 'a-sig', 'b-sig', 'a-sign', 'b-sign'],
        labels: { 'a-exp': p.EA, 'b-exp': p.EB, 'a-sig': p.sigA, 'b-sig': p.sigB },
      };
    case 'negate':
      return {
        active: ['control'],
        wires: ['sub-in', 'b-sign'],
        labels: { 'sub-in': 'sub = 1' },
      };
    case 'swap':
      return {
        active: ['control', 'muxSmall', 'muxBig'],
        wires: ['ctl-mux-small', 'ctl-mux-big', 'a-sig', 'a-sig-big', 'b-sig', 'b-sig-small'],
        labels: { 'ctl-mux-big': 'sel = 1' },
      };
    case 'compare': {
      // neg = 1 when B has the larger exponent (the Small ALU result is negative)
      const neg = Number(p.EA) < Number(p.EB) ? 1 : 0;
      return {
        active: ['smallAlu', 'control'],
        wires: ['a-exp', 'b-exp', 'alu-ctl', 'alu-shift'],
        labels: {
          'a-exp': p.EA,
          'b-exp': p.EB,
          'alu-ctl': `neg = ${neg}`,
          'alu-shift': `absD = ${p.d}`,
        },
      };
    }
    case 'align':
    case 'alignFast': {
      const moved = frame.rows[1]?.shifted ?? 0;
      return {
        // Control's sel picks the larger exponent and both significands; the shifter moves by absD
        active: ['control', 'muxExp', 'muxSmall', 'muxBig', 'shift'],
        wires: [
          'a-exp-mux',
          'b-exp-mux',
          'a-sig',
          'a-sig-big',
          'b-sig',
          'b-sig-small',
          'ctl-mux-exp',
          'ctl-mux-small',
          'ctl-mux-big',
          'alu-shift',
          'mux-shift',
        ],
        labels: { 'alu-shift': `>> ${moved}` },
      };
    }
    case 'add':
    case 'sub':
      return {
        active: ['bigAlu'],
        wires: ['shift-alu', 'big-alu', 'ctl-alu', 'alu-negate'],
        labels: {
          'alu-negate': p.sum,
          'ctl-alu': frame.stage === 'add' ? 'Binv = 0' : 'Binv = 1',
        },
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
        wires: ['negate-norm', 'exp-incdec', 'norm-incdec', 'norm-round'],
        labels: { 'norm-round': shiftLabel, 'norm-incdec': expLabel },
      };
    }
    case 'overflow':
    case 'underflow':
      return { active: ['normalize', 'incdec'], wires: ['norm-incdec'], labels: {} };
    case 'round':
      return {
        active: ['round'],
        wires: ['norm-round', 'round-out'],
        labels: { 'round-out': `GRS = ${p.g}${p.r}${p.s}` },
      };
    case 'roundCarry':
      return {
        active: ['round', 'incdec'],
        wires: ['round-ovf'],
        labels: { 'round-ovf': 'ovf = 1' },
      };
    case 'pack':
      return {
        active: ['regR'],
        wires: ['round-out', 'incdec-out', 'ctl-sign'],
        labels: { 'round-out': p.hex },
      };
    case 'special':
      return {
        active: ['control', 'regR'],
        wires: ['ctl-sign', 'incdec-out', 'round-out'],
        labels: {},
      };
  }
}

/** Caption of a frame when it is shown on the circuit (Chapter 6 uses its own wording). */
export function hwCaption(frame: FpFrame): { key: CaptionKey; params: Params } {
  const p = frame.params;
  switch (frame.stage) {
    case 'unpack':
      return { key: 'hw.unpack', params: {} };
    case 'negate':
      return { key: 'hw.negate', params: {} };
    case 'swap':
      return { key: 'hw.swap', params: {} };
    case 'compare':
      return { key: 'hw.compare', params: { EA: p.EA, EB: p.EB, diff: p.d } };
    case 'align':
    case 'alignFast':
      return { key: 'hw.align', params: { d: p.d } };
    case 'add':
      return { key: 'hw.add', params: {} };
    case 'sub':
      return { key: 'hw.sub', params: {} };
    case 'normalize': {
      const n = frame.normalize!;
      return { key: 'hw.normalize', params: { dir: n.direction, k: String(n.amount) } };
    }
    case 'overflow':
      return { key: 'fp.overflow', params: {} };
    case 'underflow':
      return { key: 'fp.underflow', params: {} };
    case 'round':
      return {
        key: 'hw.round',
        params: { grs: `${p.g}${p.r}${p.s}`, decision: frame.decision ?? 'exact' },
      };
    case 'roundCarry':
      return { key: 'fp.roundCarry', params: {} };
    case 'pack':
      return { key: 'hw.pack', params: { hex: p.hex } };
    case 'special':
      return { key: 'fp.special', params: { rule: p.rule } };
  }
}
