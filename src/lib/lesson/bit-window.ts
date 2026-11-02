import { GRS, type FpScene } from './fp-frames';

/**
 * Which bit columns the bit track shows. Columns are bit positions of the fixed-point row value:
 * fracBits + 1 is the carry column (2^1), fracBits the hidden bit (2^0), then the significand,
 * and 2, 1, 0 are G, R, S. The same columns are used for every frame so nothing jumps.
 */
export type Column = number | 'gap';

export interface BitWindow {
  mode: 'compact' | 'tail' | 'full';
  columns: Column[];
  /** Significand columns folded into the "+ 0 more" chip (compact) or the gap (tail). */
  hidden: number;
}

const lowestSetBit = (v: bigint): number => {
  if (v === 0n) return Number.POSITIVE_INFINITY;
  let i = 0;
  while (((v >> BigInt(i)) & 1n) === 0n) i++;
  return i;
};

export function fullWindow(fracBits: number): BitWindow {
  const columns: Column[] = [];
  for (let c = fracBits + 1; c >= 0; c--) columns.push(c);
  return { mode: 'full', columns, hidden: 0 };
}

/** Tail when the scene rounds or shifts far (the interesting bits sit at the end). */
export function chooseWindow(scene: FpScene): BitWindow {
  const FRAC = scene.fracBits;
  const rounds = scene.frames.some((f) => f.decision && f.decision !== 'exact');
  if (rounds || scene.shift > 8) {
    // carry, hidden bit, first 2 significand bits ... last 6 significand bits, then G R S
    const columns: Column[] = [
      FRAC + 1,
      FRAC,
      FRAC - 1,
      FRAC - 2,
      'gap',
      8,
      7,
      6,
      5,
      4,
      3,
      2,
      1,
      0,
    ];
    return { mode: 'tail', columns, hidden: FRAC - GRS - 8 };
  }
  let low = FRAC; // always show at least the hidden bit
  for (const f of scene.frames) for (const r of f.rows) low = Math.min(low, lowestSetBit(r.value));
  const columns: Column[] = [];
  for (let c = FRAC + 1; c >= low; c--) columns.push(c);
  // significand columns between the last shown one and G
  const hidden = Math.max(0, Math.min(low, FRAC) - GRS);
  return { mode: 'compact', columns, hidden };
}
