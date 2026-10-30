import {
  BINARY32,
  type FpResult,
  type Step,
  type StepKind,
  type StepOf,
  encodeBits,
} from '@/lib/fp';

export const F32 = BINARY32;

export function stepOf<K extends StepKind>(r: { steps: Step[] }, kind: K): StepOf<K> {
  const s = r.steps.find((x) => x.kind === kind);
  if (!s) throw new Error(`no ${kind} step in [${r.steps.map((x) => x.id).join(', ')}]`);
  return s as StepOf<K>;
}

export function hasStep(r: { steps: Step[] }, kind: StepKind): boolean {
  return r.steps.some((x) => x.kind === kind);
}

export function enc(text: string): bigint {
  const b = encodeBits(F32, text);
  if (b === null) throw new Error(`cannot parse ${text}`);
  return b;
}

export const hex = (r: FpResult | bigint): string =>
  '0x' + (typeof r === 'bigint' ? r : r.bits).toString(16).toUpperCase().padStart(8, '0');

// --- binary32 <-> JS number via DataView (oracle side only) ---
const view = new DataView(new ArrayBuffer(4));

export function f32FromBits(bits: bigint): number {
  view.setUint32(0, Number(bits));
  return view.getFloat32(0);
}

export function bitsFromF32(x: number): bigint {
  view.setFloat32(0, x);
  return BigInt(view.getUint32(0));
}
