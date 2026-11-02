'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useId, useMemo, useState } from 'react';
import { BINARY32 } from '@/lib/fp';
import {
  type CFrame,
  type PointScene as PointModel,
  binaryOf,
  buildCCodeFrames,
  buildPointScene,
} from '@/lib/lesson/sci-frames';
import { caption, detail } from '@/content/lesson/captions';
import { UI } from '@/content/lesson/copy';
import { C_CODE, POINT_EXAMPLES } from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import { C_SOURCE, UI_CH12 } from '@/content/lesson/ui-ch12';
import { StepPlayer } from '@/components/player/step-player';
import { CodeCard } from '@/components/stage/code-card';
import { ExponentTag } from '@/components/stage/exponent-tag';
import { cn } from '@/lib/utils';

// Owner: addsub-ch12 (docs/PARALLEL.md).

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

const sceneTitle = (id: string): string =>
  sectionById('float-in-c')?.scenes.find((s) => s.id === id)?.title ?? id;

function Chip({
  on,
  onClick,
  children,
  testId,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'btn h-9 min-h-9 shrink-0 rounded-full px-3 font-mono text-sm font-medium',
        on ? 'btn-primary' : 'bg-white/80 ring-1 ring-line',
      )}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

function Chips({ children }: { children: React.ReactNode }) {
  return (
    <div className="scroll-x -mx-4 flex gap-1.5 px-4 pb-1" aria-label={UI.examples} role="group">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 2.1 C code                                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** The small trapezoid used for the ALU in Chapter 1; the float adder is still a question mark here (Chapter 6). */
function Unit({ kind }: { kind: 'alu' | 'fpu' }) {
  const fpu = kind === 'fpu';
  return (
    <span className="relative inline-grid h-12 w-20 place-items-center" data-testid={`c-${kind}`}>
      <svg viewBox="0 0 80 48" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d="M2 4 L78 4 L66 44 L46 44 L40 37 L34 44 L14 44 Z"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeDasharray={fpu ? '5 4' : undefined}
          className={fpu ? 'fill-bit-grs/10 stroke-bit-grs' : 'fill-primary/10 stroke-primary'}
        />
      </svg>
      <span
        className={cn(
          'relative -mt-1 font-sans text-sm font-bold',
          fpu ? 'text-bit-grs-ink' : 'text-primary',
        )}
      >
        {fpu ? '?' : 'ALU'}
      </span>
    </span>
  );
}

function CStage({
  frames,
  index,
  lines,
}: {
  frames: CFrame[];
  index: number;
  lines: readonly string[];
}) {
  const f = frames[index];
  const teaser = lines === C_SOURCE.teaser;
  return (
    <div
      className="mx-auto flex max-w-xl flex-col gap-3"
      data-testid="c-code-stage"
      data-frame={f.id}
    >
      <CodeCard
        lines={lines}
        active={f.line}
        output={f.output}
        outputLabel={UI_CH12.output}
        shake={teaser && f.output !== ''}
        testId="c-code"
      />
      <div className="flex min-h-14 items-center justify-center gap-3">
        {f.unit && (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="flex items-center gap-3"
          >
            <ArrowRight className="h-5 w-5 text-muted" aria-hidden />
            <Unit kind={f.unit} />
            <ArrowRight className="h-5 w-5 text-muted" aria-hidden />
            <b className="num font-mono text-xl text-primary" data-testid="c-code-value">
              {f.value}
            </b>
          </motion.div>
        )}
        {teaser && f.unit === null && (
          <a
            href="#rounding"
            className="btn h-10 min-h-10 rounded-full bg-white/80 btn-ghost px-4 ring-1 ring-line"
            data-testid="c-code-teaser-link"
          >
            {UI_CH12.toChapter5}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

/** Scene 2.1: the same + in C goes to the ALU for int and to another unit for float. */
export function CCodeScene() {
  const [variant, setVariant] = useState<'main' | 'teaser'>('main');
  const [touched, setTouched] = useState(false);
  const frames = useMemo(() => {
    const { int, float, teaser } = C_CODE;
    const v = variant === 'main' ? float : teaser;
    return buildCCodeFrames(BINARY32, variant, int.a, int.b, v.a, v.b, v.decimals);
  }, [variant]);
  const lines = variant === 'main' ? C_SOURCE.main : C_SOURCE.teaser;
  const steps = frames.map((f) => ({
    id: f.id,
    title: f.id,
    caption: caption(f.captionKey),
    detail: f.unit === 'alu' ? detail('why.c.overflow') : undefined,
  }));
  return (
    <div className="space-y-3" data-testid="c-code">
      <Chips>
        {(['main', 'teaser'] as const).map((v) => (
          <Chip
            key={v}
            on={variant === v}
            onClick={() => (setTouched(true), setVariant(v))}
            testId="c-code-chip"
          >
            {v === 'main' ? C_SOURCE.mainChip : C_SOURCE.teaserChip}
          </Chip>
        ))}
      </Chips>
      <StepPlayer
        key={variant}
        steps={steps}
        label={sceneTitle('c-code')}
        poster={!touched}
        testId="c-code-player"
        minHeight="15rem"
        render={(i) => <CStage frames={frames} index={i} lines={lines} />}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 2.2 the point that moves                                                                   */
/* ------------------------------------------------------------------------------------------ */

function PointStage({ m, index }: { m: PointModel; index: number }) {
  const uid = useId();
  const f = m.frames[index];
  const digits = [...m.digits];
  const point = (
    <motion.span
      key="point"
      layoutId={`${uid}-point`}
      transition={SPRING}
      className={cn('px-0.5 font-bold text-primary', f.pointAt >= digits.length && 'opacity-0')}
      aria-hidden
    >
      .
    </motion.span>
  );
  return (
    <div
      className="flex flex-col items-center gap-4 py-4"
      data-testid="point-stage"
      data-frame={f.id}
    >
      <span
        className={cn(
          'rounded-full px-3 py-1 text-sm font-semibold ring-1',
          f.normalized ? 'bg-primary text-white ring-primary' : 'bg-white/80 text-muted ring-line',
        )}
        data-testid="point-badge"
      >
        {f.normalized ? UI_CH12.normalized : UI_CH12.notNormalized}
      </span>
      <p className="num flex items-baseline font-mono text-[clamp(1.8rem,9vw,3rem)]">
        <span className="sr-only" data-testid="point-value">
          {f.state.text}
        </span>
        <span className="flex items-baseline" aria-hidden>
          {digits.map((c, i) => (
            <span key={i} className="flex items-baseline">
              {i === f.pointAt && point}
              <span
                className={cn(
                  'transition-opacity',
                  i < m.lead && i < f.pointAt - 1 && 'opacity-25',
                  i === m.lead && f.normalized && 'text-primary',
                )}
              >
                {c}
              </span>
            </span>
          ))}
          {f.pointAt >= digits.length && point}
          {m.base === 2 && <sub className="ml-0.5 text-[0.4em] text-muted">2</sub>}
        </span>
        <ExponentTag
          exp={f.state.exp}
          base={m.base}
          className="ml-2 text-[0.75em]"
          testId="point-exp"
        />
      </p>
    </div>
  );
}

/** Scene 2.2: hop the point until one non-zero digit stays in front (slide w03c_mult page 13). */
export function PointScene() {
  const examples = useMemo(
    () => [
      ...POINT_EXAMPLES.map((p) => ({ ...p, base: 10 as const })),
      { ...binaryOf(BINARY32, '6.5'), base: 2 as const },
    ],
    [],
  );
  const [pick, setPick] = useState(0);
  const [touched, setTouched] = useState(false);
  const ex = examples[pick];
  const m = useMemo(() => buildPointScene(ex.text, ex.exp, ex.base), [ex]);
  const steps = m.frames.map((f) => ({
    id: f.id,
    title: f.id,
    caption: caption(f.captionKey, f.params),
  }));
  return (
    <div className="space-y-3" data-testid="point">
      <Chips>
        {examples.map((e, k) => (
          <Chip
            key={`${e.text}/${e.exp}`}
            on={k === pick}
            onClick={() => (setTouched(true), setPick(k))}
            testId="point-chip"
          >
            {e.base === 2 ? (
              <>
                {e.text}
                <sub className="text-[0.7em]">2</sub>
              </>
            ) : (
              <>
                {e.text} × 10<sup className="text-[0.7em]">{e.exp}</sup>
              </>
            )}
          </Chip>
        ))}
      </Chips>
      <StepPlayer
        key={pick}
        steps={steps}
        label={sceneTitle('point')}
        poster={!touched}
        testId="point-player"
        minHeight="11rem"
        render={(i) => <PointStage m={m} index={i} />}
      />
    </div>
  );
}
