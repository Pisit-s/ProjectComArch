import { type FloatFormat, type SimulationOutcome, type StepOf, shortestDecimal } from '@/lib/fp';
import { type FpFrame, type FpScene, buildFpFrames } from './fp-frames';
import type { CaptionKey, Params } from './keys';
import { type RoundLine, buildRoundLine } from './round-line';

/** Scene 5.4: the rounding step on its own, five frames (PLAN.md 3.6). */
export type RoundingFrameId = 'bits' | 'line' | 'rule' | 'result' | 'compare';
export type RoundRule = 'exact' | 'down' | 'up' | 'tie';

export interface RoundingFrame {
  id: RoundingFrameId;
  captionKey: CaptionKey;
  params: Params;
}

export interface RoundingScene {
  fp: FpScene;
  /** The round frame of the add/sub scene (normalized row + rounded row, G R S, decision). */
  round: FpFrame;
  line: RoundLine;
  /** Shortest decimal of the two storable neighbours. */
  downShort: string;
  upShort: string;
  rule: RoundRule;
  frames: RoundingFrame[];
}

/** null when the operation has no rounding step (special values, exact zero). */
export function buildRoundingScene(
  fmt: FloatFormat,
  sim: Extract<SimulationOutcome, { ok: true }>,
): RoundingScene | null {
  const step = sim.result.steps.find((s): s is StepOf<'round'> => s.kind === 'round');
  const exact = sim.result.exact;
  if (!step || !exact) return null;
  const fp = buildFpFrames(fmt, sim);
  const round = fp.frames.find((f) => f.stage === 'round')!;
  const sign = round.rows[0].sign;
  const line = buildRoundLine(fmt, step, exact, sign);
  const rule: RoundRule =
    step.decision === 'exact'
      ? 'exact'
      : step.decision === 'down' || step.decision === 'up'
        ? step.decision
        : 'tie';
  const frames: RoundingFrame[] = [
    {
      id: 'bits',
      captionKey: 'round.overflowBits',
      params: { g: String(step.guard), r: String(step.round), s: String(step.sticky) },
    },
    { id: 'line', captionKey: 'round.line', params: {} },
    { id: 'rule', captionKey: 'round.rule', params: {} },
    { id: 'result', captionKey: 'round.result', params: { value: fp.result.value } },
  ];
  if (fp.result.typed !== null && fp.result.error !== null) {
    frames.push({
      id: 'compare',
      captionKey: 'round.compare',
      params: { typed: fp.result.typed, error: fp.result.error },
    });
  }
  return {
    fp,
    round,
    line,
    downShort: shortestDecimal(fmt, line.downBits),
    upShort: shortestDecimal(fmt, line.upBits),
    rule,
    frames,
  };
}
