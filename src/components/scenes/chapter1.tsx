'use client';

import { motion } from 'motion/react';
import { type CSSProperties, useId, useMemo, useState } from 'react';
import { type Width, mask } from '@/lib/int/adder';
import { type IntAddScene as AddModel, buildIntAddFrames } from '@/lib/lesson/int-frames';
import { caption } from '@/content/lesson/captions';
import { UI } from '@/content/lesson/copy';
import { INT_ADD_EXAMPLES, type IntExample } from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import { UI_CH12 } from '@/content/lesson/ui-ch12';
import { ScenePlaceholder } from '@/components/lesson/scene-shell';
import { StepPlayer } from '@/components/player/step-player';
import { CarryArc } from '@/components/stage/carry-arc';
import { cn } from '@/lib/utils';

// Owner: addsub-ch12 (docs/PARALLEL.md).

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

const sceneTitle = (id: string): string =>
  sectionById('binary')?.scenes.find((s) => s.id === id)?.title ?? id;

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

/** Whole number 0 .. 2^width - 1 typed by the learner (null when it does not fit). */
function parseUnsigned(text: string, width: Width): number | null {
  const t = text.trim();
  if (!/^\d{1,3}$/.test(t)) return null;
  const n = Number(t);
  return n <= mask(width) ? n : null;
}

function IntInput({
  label,
  value,
  onChange,
  error,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  testId: string;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block pb-1 text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          'input num h-11 w-full bg-white/90 font-mono text-base',
          error && 'input-error',
        )}
        data-testid={testId}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="pt-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 1.1 add column by column                                                                   */
/* ------------------------------------------------------------------------------------------ */

/** Grid column of bit position i (0 = rightmost); column 1 is the row label, 2 the carry out. */
const colOf = (width: Width, i: number) => 2 + (width - i);

function AddStage({ m, index }: { m: AddModel; index: number }) {
  const uid = useId();
  const f = m.frames[index];
  const W = m.width;
  const last = index === m.frames.length - 1;
  const cols = Array.from({ length: W }, (_, k) => W - 1 - k); // left to right
  const grid: CSSProperties = {
    gridTemplateColumns: `auto repeat(${W + 1}, var(--c)) auto`,
    ['--c' as string]: 'clamp(1.45rem, 6.4vw, 2.4rem)',
    ['--g' as string]: '0.2rem',
    columnGap: 'var(--g)',
  };
  const bit = (s: string, i: number) => s[W - 1 - i];
  const label = (text: string, row: number, cls = 'text-muted') => (
    <span
      style={{ gridRow: row, gridColumn: 1 }}
      className={cn('pr-1.5 text-right font-sans text-xs font-semibold', cls)}
    >
      {text}
    </span>
  );
  const dec = (text: string | number, row: number, testId?: string) => (
    <span
      style={{ gridRow: row, gridColumn: W + 3 }}
      className="pl-2 text-left text-[0.75em] text-muted"
      data-testid={testId}
    >
      = {text}
    </span>
  );
  // carry produced by the active column (arc from column i to i + 1)
  const arcFrom = f.active !== null && f.carries[f.active + 1] === 1 ? f.active : null;

  return (
    <div
      className="num mx-auto grid w-max items-center gap-y-1.5 font-mono text-[clamp(1.05rem,4.6vw,1.6rem)]"
      style={grid}
      data-testid="int-add-stage"
      data-frame={f.id}
    >
      {/* active column highlight */}
      {f.active !== null && (
        <motion.span
          layoutId={`${uid}-col`}
          transition={SPRING}
          style={{ gridRow: '1 / 6', gridColumn: colOf(W, f.active) }}
          className="h-full rounded-lg bg-primary/10 ring-2 ring-primary/60"
          aria-hidden
        />
      )}

      {/* row 1: carries */}
      {label(UI_CH12.carry, 1, 'text-carry-ink')}
      <span
        style={{ gridRow: 1, gridColumn: 2 }}
        className="grid h-[var(--c)] place-items-center rounded-md border-2 border-dashed border-carry/60"
        title={UI_CH12.carryOut}
        data-testid="int-add-carry-out"
      >
        {f.carries[W] !== null && (
          <motion.span
            key={`co${f.carries[W]}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('text-[0.8em]', f.carries[W] ? 'font-bold text-carry-ink' : 'text-muted')}
          >
            {f.carries[W]}
          </motion.span>
        )}
      </span>
      {cols.map((i) => (
        <span
          key={`c${i}`}
          style={{ gridRow: 1, gridColumn: colOf(W, i) }}
          className="relative grid h-[var(--c)] place-items-center text-[0.8em]"
        >
          {i > 0 && f.carries[i] !== null && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={f.carries[i] ? 'font-bold text-carry-ink' : 'text-muted'}
            >
              {f.carries[i]}
            </motion.span>
          )}
        </span>
      ))}
      {arcFrom !== null && (
        <span
          key={`arc${arcFrom}`}
          style={{
            gridRow: 1,
            gridColumn: `${colOf(W, arcFrom + 1)} / span 2`,
            top: 'calc(var(--c) * -0.42)',
            height: 'calc(var(--c) * 0.5)',
          }}
          className="pointer-events-none relative self-start"
          aria-hidden
        >
          <span
            className="absolute inset-y-0"
            style={{ left: 'calc(var(--c) * 0.5 - 0.3rem)', right: 'calc(var(--c) * 0.5 - 0.3rem)' }}
          >
            <CarryArc className="h-full w-full" testId="int-add-arc" />
          </span>
        </span>
      )}

      {/* rows 2-3: A and B */}
      {label('A', 2)}
      {label('B', 3)}
      {cols.map((i) => (
        <span
          key={`a${i}`}
          style={{ gridRow: 2, gridColumn: colOf(W, i) }}
          className={cn('text-center', f.active === i && 'font-bold text-primary')}
        >
          {bit(m.aBits, i)}
        </span>
      ))}
      {cols.map((i) => (
        <span
          key={`b${i}`}
          style={{ gridRow: 3, gridColumn: colOf(W, i) }}
          className={cn('text-center', f.active === i && 'font-bold text-primary')}
        >
          {bit(m.bBits, i)}
        </span>
      ))}
      {dec(m.a, 2)}
      {dec(m.b, 3)}

      {/* row 4: the full adder of the active column */}
      <span
        style={{ gridRow: 4, gridColumn: `3 / span ${W}` }}
        className="h-px self-center bg-ink/60"
        aria-hidden
      />
      {f.active !== null && (
        <motion.span
          layoutId={`${uid}-fa`}
          transition={SPRING}
          style={{ gridRow: 4, gridColumn: colOf(W, f.active) }}
          className="z-10 grid h-6 place-items-center rounded-md bg-primary font-sans text-[0.6rem] font-bold text-white"
          aria-hidden
        >
          FA
        </motion.span>
      )}

      {/* row 5: sum */}
      {label(UI_CH12.sum, 5, 'text-primary')}
      {cols.map((i) => (
        <span
          key={`s${i}`}
          style={{ gridRow: 5, gridColumn: colOf(W, i) }}
          className="grid h-[var(--c)] place-items-center rounded-md bg-ice-100 ring-1 ring-sky-200"
        >
          {f.sums[i] !== null && (
            <motion.span
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className="font-semibold text-ink"
            >
              {f.sums[i]}
            </motion.span>
          )}
        </span>
      ))}
      {last && dec(f.params.dec, 5, 'int-add-dec')}
      <span className="sr-only" data-testid="int-add-sum">
        {last ? f.params.bits : ''}
      </span>
    </div>
  );
}

/** Scene 1.1: ripple-carry addition, one column at a time (slide w03c page 3). */
export function IntAddScene() {
  const first = INT_ADD_EXAMPLES[0];
  const [width, setWidth] = useState<Width>(first.width);
  const [a, setA] = useState(String(first.a));
  const [b, setB] = useState(String(first.b));
  const [touched, setTouched] = useState(false);
  const va = parseUnsigned(a, width);
  const vb = parseUnsigned(b, width);
  const [last, setLast] = useState<AddModel | null>(null);
  const model = useMemo(
    () => (va !== null && vb !== null ? buildIntAddFrames(width, va, vb) : null),
    [width, va, vb],
  );
  // keep the last good scene while the input is being edited
  if (model && model !== last) setLast(model);
  const m = model ?? last;
  const err = UI_CH12.range(mask(width));

  const pick = (ex: IntExample) => {
    setTouched(true);
    setWidth(ex.width);
    setA(String(ex.a));
    setB(String(ex.b));
  };

  const steps = m
    ? m.frames.map((f) => ({
        id: f.id,
        title: f.id,
        caption: caption(f.captionKey, f.params),
      }))
    : [];

  return (
    <div className="space-y-3" data-testid="int-add">
      <div className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
        <IntInput
          label={UI.inputA}
          value={a}
          onChange={(v) => (setTouched(true), setA(v))}
          error={va === null ? err : null}
          testId="int-add-a"
        />
        <IntInput
          label={UI.inputB}
          value={b}
          onChange={(v) => (setTouched(true), setB(v))}
          error={vb === null ? err : null}
          testId="int-add-b"
        />
        <div>
          <span className="block pb-1 text-sm font-semibold text-ink">{UI_CH12.width}</span>
          <div className="join" role="group" aria-label={UI_CH12.width}>
            {([4, 8] as const).map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={width === w}
                onClick={() => (setTouched(true), setWidth(w))}
                className={cn(
                  'btn join-item h-11 min-h-11 px-3 font-mono',
                  width === w ? 'btn-primary' : 'bg-white/80',
                )}
                data-testid={`int-add-w${w}`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Chips>
        {INT_ADD_EXAMPLES.map((ex) => (
          <Chip
            key={`${ex.a}+${ex.b}/${ex.width}`}
            on={String(ex.a) === a && String(ex.b) === b && ex.width === width}
            onClick={() => pick(ex)}
            testId="int-add-chip"
          >
            {ex.a} + {ex.b}
            <span className="font-sans text-xs opacity-75">
              {ex.width === 4 ? UI_CH12.bits4 : UI_CH12.bits8}
            </span>
          </Chip>
        ))}
      </Chips>
      {m && (
        <StepPlayer
          key={`${m.width}|${m.a}|${m.b}`}
          steps={steps}
          label={sceneTitle('int-add')}
          poster={!touched}
          testId="int-add-player"
          minHeight="14rem"
          render={(i) => <AddStage m={m} index={i} />}
        />
      )}
    </div>
  );
}

export function IntSubScene() {
  return <ScenePlaceholder minHeight="24rem" />;
}

export function OverflowScene() {
  return <ScenePlaceholder minHeight="26rem" />;
}

export function ShiftScene() {
  return <ScenePlaceholder minHeight="16rem" />;
}
