'use client';

import { Maximize2, Minimize2 } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { BINARY32, type Op, simulate } from '@/lib/fp';
import { chooseWindow, fullWindow } from '@/lib/lesson/bit-window';
import { buildFpFrames, type FpFrame, type FpScene } from '@/lib/lesson/fp-frames';
import { caption, detail } from '@/content/lesson/captions';
import { UI } from '@/content/lesson/copy';
import type { FpExample } from '@/content/lesson/examples';
import { OperandInput } from '@/components/lesson/operand-input';
import { type PlayerStep, StepPlayer } from '@/components/player/step-player';
import { BitTrack } from '@/components/stage/bit-track';
import { MiniAlu } from '@/components/stage/mini-alu';
import { Register32 } from '@/components/stage/register32';
import { cn } from '@/lib/utils';

/** What the scene shows right now (for share links). */
export interface FpOpState {
  a: string;
  b: string;
  op: Op;
  /** Frame id of the current step. */
  step: string | null;
}

export interface FpSceneState {
  scene: FpScene | null;
  errorA: string | null;
  errorB: string | null;
}

/** Engine run + frames for the typed inputs; invalid input keeps the error kinds. */
export function useFpScene(a: string, op: Op, b: string): FpSceneState {
  return useMemo(() => {
    const sim = simulate(BINARY32, op, a, b);
    if (!sim.ok) {
      return { scene: null, errorA: sim.errorA?.kind ?? null, errorB: sim.errorB?.kind ?? null };
    }
    return { scene: buildFpFrames(BINARY32, sim), errorA: null, errorB: null };
  }, [a, op, b]);
}

export function fpSteps(scene: FpScene): PlayerStep[] {
  return scene.frames.map((f) => ({
    id: f.id,
    title: f.id,
    caption: caption(f.captionKey, f.params),
    detail: f.detailKey ? detail(f.detailKey) : undefined,
    bigStep: f.bigStep,
  }));
}

const isAlign = (f: FpFrame) => f.stage === 'align' || f.stage === 'alignFast';

/** Chips above the track: the one number this frame is about. */
function FrameChips({ frame }: { frame: FpFrame }) {
  const chip = (label: ReactNode, value: ReactNode, cls = 'text-ink') => (
    <span className="inline-flex items-baseline gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm ring-1 ring-line">
      <span className="text-muted">{label}</span>
      <b className={cn('num font-mono', cls)}>{value}</b>
    </span>
  );
  if (frame.stage === 'compare') return chip('d', frame.params.d, 'text-bit-exp-ink');
  if (frame.stage === 'normalize' && frame.normalize && frame.normalize.direction !== 'none') {
    return chip(
      frame.normalize.direction === 'right' ? '→' : '←',
      frame.normalize.amount,
      'text-primary',
    );
  }
  if (frame.grs) {
    return (
      <span className="flex flex-wrap gap-1.5" data-testid="grs-chips">
        {chip('LSB', frame.grs.lsb, 'text-bit-frac-ink')}
        {chip('G', frame.grs.g, 'text-bit-grs-ink')}
        {chip('R', frame.grs.r, 'text-bit-grs-ink')}
        {chip('S', frame.grs.s, 'text-bit-grs-ink')}
      </span>
    );
  }
  return null;
}

/** Result card of the last frame: register, hex, value (≈ when the stored value is rounded). */
function ResultCard({ scene, testId }: { scene: FpScene; testId: string }) {
  const r = scene.result;
  return (
    <div className="space-y-2" data-testid={`${testId}-result`}>
      <Register32 bits={r.bits} name={`${testId}-reg`} />
      <p className="num flex flex-wrap items-baseline gap-x-3 font-mono text-lg">
        <b data-testid={`${testId}-hex`}>{r.hex}</b>
        <span>
          {r.inexact && r.stored !== null ? '≈' : '='}{' '}
          <b data-testid={`${testId}-value`}>{r.value}</b>
        </span>
      </p>
    </div>
  );
}

/** Stage of one add / subtract frame (bits view). */
export function FpFrameView({
  scene,
  index,
  full,
  testId,
}: {
  scene: FpScene;
  index: number;
  full: boolean;
  testId: string;
}) {
  const f = scene.frames[index];
  if (f.stage === 'pack' || f.stage === 'special') {
    return (
      <div className="space-y-4">
        {f.stage === 'pack' && f.rows.length === 1 && scene.result.stored !== null && (
          <BitTrack
            rows={f.rows}
            fracBits={scene.fracBits}
            window={full ? fullWindow(scene.fracBits) : chooseWindow(scene)}
            testId={`${testId}-track`}
          />
        )}
        <ResultCard scene={scene} testId={testId} />
      </div>
    );
  }
  const moving = isAlign(f) ? f.rows.findIndex((r) => r.shifted > 0 && r.key !== 'R') : -1;
  return (
    <div className="space-y-3">
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        <FrameChips frame={f} />
        {f.stage === 'sub' && <MiniAlu binvert={1} carryIn={1} active className="w-36 sm:w-44" />}
      </div>
      <div className={cn(full && 'scroll-x -mx-1 px-1 pb-2')}>
        <BitTrack
          rows={f.rows}
          fracBits={scene.fracBits}
          window={full ? fullWindow(scene.fracBits) : chooseWindow(scene)}
          focusRow={moving >= 0 ? moving : undefined}
          bucket={isAlign(f)}
          lens={f.decision ? { row: 0, decision: f.decision } : undefined}
          className={cn(full ? 'w-max [--cell:1.15rem]' : 'mx-auto w-max max-w-full')}
          testId={`${testId}-track`}
        />
      </div>
    </div>
  );
}

/**
 * Scenes 5.2 / 5.3 (and the playground): type A and B or pick a chip, then step through
 * unpack → align → add/sub → normalize → round → pack. Everything drawn comes from the engine.
 */
export function FpOpScene({
  initial,
  examples,
  testId,
  label,
  extra,
  initialStep = null,
  fromLink = false,
  stepsOf = fpSteps,
  renderFrame,
  showFull = true,
  minHeight = '15rem',
}: {
  initial: FpExample;
  examples: FpExample[];
  testId: string;
  label: string;
  /** Extra panel under the player (e.g. the rounding comparison). */
  extra?: (scene: FpScene, state: FpOpState) => ReactNode;
  /** Frame id to open first (from a shared link). */
  initialStep?: string | null;
  /** Shown only when the input came from a link (opened at a step, no poster). */
  fromLink?: boolean;
  /** Steps and drawing of another view of the same frames (the circuit). */
  stepsOf?: (scene: FpScene) => PlayerStep[];
  renderFrame?: (scene: FpScene, index: number, full: boolean) => ReactNode;
  /** Show the "all 24 bits" toggle (bits view only). */
  showFull?: boolean;
  minHeight?: string;
}) {
  const [a, setA] = useState(initial.a);
  const [b, setB] = useState(initial.b);
  const [op, setOp] = useState<Op>(initial.op);
  const [touched, setTouched] = useState(fromLink);
  const [stepIndex, setStepIndex] = useState(0);
  // a shared link opens at its step once; any edit starts from the first step again
  const [linkStep, setLinkStep] = useState(initialStep);
  const touch = () => {
    setTouched(true);
    setLinkStep(null);
  };
  const [full, setFull] = useState(false);
  const [last, setLast] = useState<FpScene | null>(null);
  const state = useFpScene(a, op, b);
  // keep showing the last good scene while the input is being edited
  if (state.scene && state.scene !== last) setLast(state.scene);
  const scene = state.scene ?? last;

  const pick = (ex: FpExample) => {
    touch();
    setA(ex.a);
    setB(ex.b);
    setOp(ex.op);
  };

  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <OperandInput
          label={UI.inputA}
          value={a}
          onChange={(v) => (touch(), setA(v))}
          error={state.errorA}
          inputMode="decimal"
          testId={`${testId}-a`}
        />
        <div className="join mt-8" role="group">
          {(['+', '-'] as const).map((o) => (
            <button
              key={o}
              type="button"
              className={cn(
                'btn join-item h-11 min-h-11 w-11 font-mono text-lg',
                op === o ? 'btn-primary' : 'bg-white/80',
              )}
              aria-pressed={op === o}
              aria-label={o === '+' ? UI.opAdd : UI.opSub}
              onClick={() => (touch(), setOp(o))}
              data-testid={`${testId}-op-${o === '+' ? 'add' : 'sub'}`}
            >
              {o === '+' ? '+' : '−'}
            </button>
          ))}
        </div>
        <OperandInput
          label={UI.inputB}
          value={b}
          onChange={(v) => (touch(), setB(v))}
          error={state.errorB}
          inputMode="decimal"
          testId={`${testId}-b`}
        />
      </div>
      <div className="scroll-x -mx-4 flex gap-1.5 px-4 pb-1" aria-label={UI.examples} role="group">
        {examples.map((ex) => {
          const on = ex.a === a && ex.b === b && ex.op === op;
          return (
            <button
              key={`${ex.a}${ex.op}${ex.b}`}
              type="button"
              className={cn(
                'btn h-9 min-h-9 shrink-0 rounded-full px-3 font-mono text-sm font-medium',
                on ? 'btn-primary' : 'bg-white/80 ring-1 ring-line',
              )}
              aria-pressed={on}
              onClick={() => pick(ex)}
              data-testid={`${testId}-chip`}
            >
              {ex.a} {ex.op === '+' ? '+' : '−'} {ex.b}
            </button>
          );
        })}
      </div>
      {scene && (
        <StepPlayer
          key={`${scene.result.hex}|${scene.frames.length}|${a}${op}${b}`}
          steps={stepsOf(scene)}
          label={label}
          stepBar
          poster={!touched}
          initialStep={Math.max(
            0,
            scene.frames.findIndex((f) => f.id === linkStep),
          )}
          onStepChange={setStepIndex}
          testId={`${testId}-player`}
          minHeight={minHeight}
          render={(i) =>
            renderFrame ? (
              renderFrame(scene, i, full)
            ) : (
              <FpFrameView scene={scene} index={i} full={full} testId={testId} />
            )
          }
        >
          {showFull && (
            <button
              type="button"
              className="btn h-9 min-h-9 gap-1.5 btn-ghost btn-sm"
              onClick={() => setFull((v) => !v)}
              aria-pressed={full}
              data-testid={`${testId}-full`}
            >
              {full ? (
                <Minimize2 className="h-4 w-4" aria-hidden />
              ) : (
                <Maximize2 className="h-4 w-4" aria-hidden />
              )}
              {full ? UI.showLess : UI.showAll}
            </button>
          )}
        </StepPlayer>
      )}
      {scene && extra?.(scene, { a, b, op, step: scene.frames[stepIndex]?.id ?? null })}
    </div>
  );
}
