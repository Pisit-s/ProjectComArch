'use client';

import { ArrowDown, ArrowUp, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { useStageDuration, useStageSpring } from '@/components/player/player-speed';
import { useMemo, useState } from 'react';
import { BINARY32, simulate } from '@/lib/fp';
import { chooseWindow } from '@/lib/lesson/bit-window';
import { buildFunFact } from '@/lib/lesson/fun-fact';
import { buildRoundingScene, type RoundingScene as Model } from '@/lib/lesson/rounding-frames';
import { caption, detail } from '@/content/lesson/captions';
import { ROUND_RULES, UI } from '@/content/lesson/copy';
import {
  FP_EXAMPLES,
  MAIN,
  ROUND_EXAMPLES,
  SUB_EXAMPLES,
  SUB_MAIN,
  type FpExample,
} from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import { StepPlayer } from '@/components/player/step-player';
import { BitTrack } from '@/components/stage/bit-track';
import { RoundLine } from '@/components/stage/round-line';
import { cn } from '@/lib/utils';
import { FpOpScene } from './fp-op-scene';

const sceneTitle = (id: string): string =>
  sectionById('fp-add')?.scenes.find((s) => s.id === id)?.title ?? id;

/** Scene 5.2: addition, default 6.5 + 3.75. */
export function FpAddScene() {
  return (
    <FpOpScene
      initial={MAIN}
      examples={FP_EXAMPLES}
      testId="fp-add"
      label={sceneTitle('fp-add-bits')}
    />
  );
}

/** Scene 5.3: subtraction, default 0.5 − 0.4375. */
export function FpSubScene() {
  return (
    <FpOpScene
      initial={SUB_MAIN}
      examples={SUB_EXAMPLES}
      testId="fp-sub"
      label={sceneTitle('fp-sub')}
    />
  );
}

function roundingOf(ex: FpExample): Model {
  const sim = simulate(BINARY32, ex.op, ex.a, ex.b);
  if (!sim.ok) throw new Error('bad example');
  const m = buildRoundingScene(BINARY32, sim);
  if (!m) throw new Error('example has no rounding step');
  return m;
}

function RoundingFrameView({ m, id }: { m: Model; id: string }) {
  const win = chooseWindow(m.fp);
  const fb = m.fp.fracBits;
  const values = (
    <dl className="num grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-sm">
      <dt className="font-sans text-muted">{UI.roundDown}</dt>
      <dd className={cn(m.line.chosen === 'down' && id !== 'line' && 'font-bold text-primary')}>
        {m.downShort}
      </dd>
      <dt className="font-sans text-bit-grs-ink">{UI.exactValue}</dt>
      <dd className="break-all">{m.line.exact}</dd>
      <dt className="font-sans text-muted">{UI.roundUp}</dt>
      <dd className={cn(m.line.chosen === 'up' && id !== 'line' && 'font-bold text-primary')}>
        {m.upShort}
      </dd>
    </dl>
  );
  if (id === 'bits') {
    return <BitTrack rows={[m.round.rows[0]]} fracBits={fb} window={win} testId="rounding-track" />;
  }
  if (id === 'line' || id === 'result') {
    return (
      <div className="space-y-3">
        <RoundLine
          line={m.line}
          stage={id === 'line' ? 2 : 3}
          downLabel={UI.roundDown}
          upLabel={UI.roundUp}
        />
        {values}
      </div>
    );
  }
  if (id === 'rule') {
    return (
      <div className="space-y-3">
        <BitTrack
          rows={[m.round.rows[0]]}
          fracBits={fb}
          window={win}
          lens={m.round.decision ? { row: 0, decision: m.round.decision } : undefined}
          testId="rounding-track"
        />
        <ul className="space-y-1.5" data-testid="round-rules">
          {ROUND_RULES.map((r) => (
            <li
              key={r.id}
              data-active={r.id === m.rule ? 'true' : 'false'}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ring-1',
                r.id === m.rule
                  ? 'bg-primary text-white ring-primary'
                  : 'bg-white/70 text-ink/70 ring-line',
              )}
            >
              <span className="num font-mono">{r.when}</span>
              <span className="flex items-center gap-1.5 font-semibold">
                {r.id === 'down' ? (
                  <ArrowDown className="h-4 w-4" aria-hidden />
                ) : r.id === 'up' ? (
                  <ArrowUp className="h-4 w-4" aria-hidden />
                ) : (
                  <Scale className="h-4 w-4" aria-hidden />
                )}
                {r.then}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  // compare: what was typed against what is stored
  return (
    <dl
      className="num grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 font-mono"
      data-testid="round-compare"
    >
      <dt className="font-sans text-sm text-muted">{UI.typed}</dt>
      <dd>{m.fp.result.typed}</dd>
      <dt className="font-sans text-sm text-muted">{UI.stored}</dt>
      <dd className="font-semibold break-all text-primary" data-testid="rounding-stored">
        {m.fp.result.stored}
      </dd>
      <dt className="font-sans text-sm text-muted">{UI.diff}</dt>
      <dd className="break-all text-bit-grs-ink">{m.fp.result.error}</dd>
      <dt className="font-sans text-sm text-muted">hex</dt>
      <dd data-testid="rounding-hex">{m.fp.result.hex}</dd>
    </dl>
  );
}

/** Scene 5.4: why 0.1 + 0.2 is not exactly 0.3. */
export function RoundingScene() {
  const [ex, setEx] = useState<FpExample>(ROUND_EXAMPLES[0]);
  const [touched, setTouched] = useState(false);
  const m = useMemo(() => roundingOf(ex), [ex]);
  const steps = m.frames.map((f) => ({
    id: f.id,
    title: f.id,
    caption: caption(f.captionKey, f.params),
    // why 3 bits are enough (first look at G R S), why ties go to even (the rule table)
    detail: f.id === 'bits' ? detail('why.grs') : f.id === 'rule' ? detail('why.even') : undefined,
    bigStep: 4 as const,
  }));
  return (
    <div className="space-y-3" data-testid="rounding">
      <div className="scroll-x -mx-4 flex gap-1.5 px-4 pb-1" aria-label={UI.examples} role="group">
        {ROUND_EXAMPLES.map((e) => {
          const on = e === ex;
          return (
            <button
              key={`${e.a}${e.op}${e.b}`}
              type="button"
              aria-pressed={on}
              onClick={() => (setTouched(true), setEx(e))}
              className={cn(
                'btn h-9 min-h-9 shrink-0 rounded-full px-3 font-mono text-sm font-medium',
                on ? 'btn-primary' : 'bg-white/80 ring-1 ring-line',
              )}
              data-testid="rounding-chip"
            >
              {e.a} {e.op === '+' ? '+' : '−'} {e.b}
            </button>
          );
        })}
      </div>
      <StepPlayer
        key={`${ex.a}${ex.op}${ex.b}`}
        steps={steps}
        label={sceneTitle('rounding')}
        stepBar
        poster={!touched}
        testId="rounding-player"
        minHeight="15rem"
        render={(i) => <RoundingFrameView m={m} id={m.frames[i].id} />}
      />
    </div>
  );
}

/** Ticks are the doubles x, x + ulp, x + 2 ulp; x + 20 snaps to the tick the engine rounded to. */
function SpacingLine({ f, label }: { f: ReturnType<typeof buildFunFact>; label: string }) {
  const spring = useStageSpring(0.5);
  const delay = useStageDuration(0.6);
  // pixel placement only: where x + 20 sits between the ticks
  const at = Math.min(2, 20 / Number(f.ulp));
  // y − x is the offset of the tick that x + 20 became
  const snap = Math.max(0, f.offsets.indexOf(f.yMinusX));
  return (
    <svg viewBox="0 0 320 90" className="w-full" role="img" aria-label={label}>
      <line x1={20} x2={300} y1={40} y2={40} className="stroke-line" strokeWidth={3} />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <line
            x1={40 + k * 120}
            x2={40 + k * 120}
            y1={28}
            y2={52}
            strokeWidth={3}
            className={k === 1 ? 'stroke-primary' : 'stroke-ink'}
          />
          <text
            x={40 + k * 120}
            y={72}
            textAnchor="middle"
            className="fill-muted font-mono text-[11px]"
          >
            {k === 0 ? 'x' : `x + ${f.offsets[k]}`}
          </text>
        </g>
      ))}
      {/* x + 20 is not a double: it snaps to the nearest tick, x + ulp */}
      <motion.circle
        cy={40}
        r={6}
        initial={{ cx: 40 + at * 120 }}
        animate={{ cx: 40 + snap * 120 }}
        transition={{ ...spring, delay: delay }}
        className="fill-bit-grs"
      />
      <circle
        cx={40 + at * 120}
        cy={40}
        r={5}
        className="fill-none stroke-bit-grs"
        strokeDasharray="2 2"
      />
      <text
        x={40 + at * 120}
        y={18}
        textAnchor="middle"
        className="fill-bit-grs-ink font-mono text-[11px]"
      >
        x + 20
      </text>
    </svg>
  );
}

/** Scene 5.5: the double example of the slides, computed by the engine. */
export function FunFactScene() {
  const f = useMemo(() => buildFunFact(), []);
  const steps = [
    {
      id: 'spacing',
      title: 'spacing',
      caption: caption('slide.funfact1', { r: f.yMinusX, ulp: f.ulp }),
    },
    {
      id: 'order',
      title: 'order',
      caption: caption('slide.funfact2', { r1: f.leftFirst, r2: f.rightFirst }),
    },
  ];
  return (
    <StepPlayer
      steps={steps}
      label={sceneTitle('slide-fun-fact')}
      testId="fun-fact"
      minHeight="11rem"
      render={(i) =>
        i === 0 ? (
          <SpacingLine f={f} label={steps[0].caption} />
        ) : (
          <dl
            className="num grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 font-mono"
            data-testid="fun-fact-order"
          >
            <dt>y − x</dt>
            <dd className="font-bold text-primary">{f.yMinusX}</dd>
            <dt>(−x + x) + 20</dt>
            <dd className="font-bold text-primary">{f.leftFirst}</dd>
            <dt>−x + (x + 20)</dt>
            <dd className="font-bold text-primary">{f.rightFirst}</dd>
          </dl>
        )
      }
    />
  );
}
