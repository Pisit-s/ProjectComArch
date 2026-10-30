'use client';

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
} from 'react';
import { cn } from '@/lib/utils';
import { BeamRing } from '@/components/glass/beam-ring';
import { PlayerSpeedContext } from './player-speed';
import { SPEEDS, type Speed, usePlayer } from './use-player';

export interface PlayerStep {
  id: string;
  title: string;
  /** Flowchart box id this step belongs to. */
  flow?: string;
}

export interface FlowNode {
  id: string;
  label: string;
}

type Props = {
  steps: PlayerStep[];
  render: (index: number) => ReactNode;
  /** Accessible name of the player region. */
  label: string;
  flow?: FlowNode[];
  initialStep?: number;
  onStepChange?: (index: number) => void;
  autoPlay?: boolean;
  /** Reserved height of the scene area (avoids layout shift). */
  minHeight?: string;
  className?: string;
  testId?: string;
  /** Hide the step indicator (very short sequences). */
  compact?: boolean;
};

/**
 * Every multi-step process plays through this component (FR-07, PLAN.md 8.1): previous / next /
 * play / restart / speed, a clickable step indicator, keyboard (left/right, space, home) while focus
 * is inside, aria-live step names, an optional clickable flowchart, and reduced-motion support.
 * Each step renders its own complete state, so going back needs no replay.
 */
export function StepPlayer(props: Props) {
  // a new sequence (different steps) starts again from the first step
  const key = props.steps.map((s) => s.id).join('|');
  return <StepPlayerInner key={key} {...props} />;
}

function StepPlayerInner({
  steps,
  render,
  label,
  flow,
  initialStep = 0,
  onStepChange,
  autoPlay = false,
  minHeight = '14rem',
  className,
  testId = 'player',
  compact = false,
}: Props) {
  const p = usePlayer(steps.length, initialStep, autoPlay);
  const reduced = useReducedMotion() ?? false;
  const titleId = useId();
  const stripRef = useRef<HTMLOListElement>(null);
  const step = steps[p.index];

  const notify = useEffectEvent((i: number) => onStepChange?.(i));
  useEffect(() => {
    notify(p.index);
  }, [p.index]);

  // keep the current step visible inside the horizontally scrolling indicator (never scroll the page)
  useEffect(() => {
    const strip = stripRef.current;
    const li = strip?.children[p.index] as HTMLElement | undefined;
    if (!strip || !li) return;
    const left = li.offsetLeft - strip.clientWidth / 2 + li.clientWidth / 2;
    strip.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
  }, [p.index, reduced]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    const tag = t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      p.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      p.prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      p.restart();
    } else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') {
      e.preventDefault();
      p.togglePlay();
    }
  };

  const activeFlow = step?.flow;
  const present = new Set(steps.map((s) => s.flow));
  const jumpToFlow = (id: string) => {
    const i = steps.findIndex((s) => s.flow === id);
    if (i >= 0) p.go(i);
  };
  const dur = reduced ? 0 : 0.28 / p.speed;

  return (
    <PlayerSpeedContext.Provider value={{ speed: p.speed, reduced }}>
      <section
        role="region"
        aria-label={label}
        aria-describedby={titleId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerEnter={autoPlay ? p.stop : undefined}
        onPointerDown={autoPlay ? p.stop : undefined}
        onFocusCapture={autoPlay ? p.stop : undefined}
        data-testid={testId}
        data-step={step?.id}
        data-step-index={p.index}
        className={cn(
          'glass rounded-2xl bg-card p-3 ring-1 ring-foreground/10 focus-visible:outline-2 sm:p-4',
          className,
        )}
      >
        <div className={cn(flow && 'lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-4')}>
          {flow && (
            <Flowchart
              nodes={flow}
              active={activeFlow}
              present={present}
              onJump={jumpToFlow}
              testId={`${testId}-flow`}
            />
          )}
          <div className="min-w-0">
            {!compact && (
              <ol
                ref={stripRef}
                className="scroll-x steps mb-2 w-full pb-1 text-xs"
                aria-label="ขั้นตอนทั้งหมด"
              >
                {steps.map((s, i) => (
                  <li
                    key={s.id}
                    className={cn('step min-w-[4.75rem]', i <= p.index && 'step-primary')}
                    data-content={i + 1}
                  >
                    <button
                      type="button"
                      onClick={() => p.go(i)}
                      aria-current={i === p.index ? 'step' : undefined}
                      aria-label={`ไปขั้นที่ ${i + 1}: ${s.title}`}
                      className={cn(
                        'line-clamp-2 rounded px-1 leading-snug',
                        i === p.index ? 'font-semibold text-ink' : 'text-muted hover:text-ink',
                      )}
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ol>
            )}

            <h3
              id={titleId}
              className="flex items-baseline gap-2 font-display text-lg font-semibold"
            >
              <span className="num font-mono text-sm text-primary">
                {p.index + 1}/{steps.length}
              </span>
              <span data-testid={`${testId}-title`}>{step?.title}</span>
            </h3>
            <p className="sr-only" aria-live="polite">
              ขั้นที่ {p.index + 1} จาก {steps.length}: {step?.title}
            </p>

            <div className="relative mt-2" style={{ minHeight }}>
              <AnimatePresence mode="wait" initial={false} custom={p.direction}>
                <motion.div
                  key={step?.id}
                  custom={p.direction}
                  initial={{ opacity: 0, x: reduced ? 0 : 24 * p.direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduced ? 0 : -16 * p.direction }}
                  transition={{ duration: dur, ease: 'easeOut' }}
                >
                  {render(p.index)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Controls
          index={p.index}
          count={steps.length}
          playing={p.playing}
          speed={p.speed}
          onPrev={p.prev}
          onNext={p.next}
          onToggle={p.togglePlay}
          onRestart={p.restart}
          onSpeed={(s) => {
            p.setSpeed(s);
          }}
          testId={testId}
        />
      </section>
    </PlayerSpeedContext.Provider>
  );
}

function Controls({
  index,
  count,
  playing,
  speed,
  onPrev,
  onNext,
  onToggle,
  onRestart,
  onSpeed,
  testId,
}: {
  index: number;
  count: number;
  playing: boolean;
  speed: Speed;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
  onRestart: () => void;
  onSpeed: (s: Speed) => void;
  testId: string;
}) {
  return (
    <div className="glass-raised sticky bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-10 mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-white/85 p-2 ring-1 ring-foreground/10 [@media(hover:none)]:bg-white/95">
      <div className="join">
        <button
          type="button"
          className="btn join-item h-11 min-h-11 w-11 btn-ghost px-0"
          onClick={onPrev}
          disabled={index === 0}
          aria-label="ขั้นก่อนหน้า"
          data-testid={`${testId}-prev`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          className={cn(
            'btn join-item h-11 min-h-11 w-12 px-0 btn-primary',
            'swap',
            playing && 'swap-active',
          )}
          onClick={onToggle}
          aria-label={playing ? 'หยุด' : 'เล่นอัตโนมัติ'}
          aria-pressed={playing}
          data-testid={`${testId}-play`}
        >
          <Pause className="h-5 w-5 swap-on" aria-hidden />
          <Play className="h-5 w-5 swap-off" aria-hidden />
        </button>
        <button
          type="button"
          className="btn join-item h-11 min-h-11 w-11 btn-ghost px-0"
          onClick={onNext}
          disabled={index === count - 1}
          aria-label="ขั้นถัดไป"
          data-testid={`${testId}-next`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <button
        type="button"
        className="btn btn-circle h-11 min-h-11 w-11 btn-ghost"
        onClick={onRestart}
        aria-label="เริ่มใหม่"
        data-testid={`${testId}-restart`}
      >
        <RotateCcw className="h-5 w-5" aria-hidden />
      </button>
      <label className="flex items-center gap-1.5 text-sm text-muted">
        <span className="sr-only sm:not-sr-only">ความเร็ว</span>
        <select
          className="select h-11 min-h-11 w-[5.25rem] bg-white select-sm"
          value={speed}
          onChange={(e) => onSpeed(Number(e.target.value) as Speed)}
          aria-label="ความเร็วในการเล่น"
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </label>
      <span className="num ml-auto font-mono text-sm text-muted" data-testid={`${testId}-counter`}>
        ขั้นที่ {index + 1}/{count}
      </span>
      <span className="hidden w-full items-center gap-1 text-xs text-muted lg:flex">
        <kbd className="kbd kbd-xs">←</kbd>
        <kbd className="kbd kbd-xs">→</kbd> เปลี่ยนขั้น
        <kbd className="ml-2 kbd kbd-xs">Space</kbd> เล่น/หยุด
        <kbd className="ml-2 kbd kbd-xs">Home</kbd> เริ่มใหม่
        <span className="ml-1">(คลิกในกรอบนี้ก่อน)</span>
      </span>
    </div>
  );
}

function Flowchart({
  nodes,
  active,
  present,
  onJump,
  testId,
}: {
  nodes: FlowNode[];
  active?: string;
  present: Set<string | undefined>;
  onJump: (id: string) => void;
  testId: string;
}) {
  return (
    <nav aria-label="Flowchart ของขั้นตอน" className="mb-3 lg:mb-0" data-testid={testId}>
      <ol className="scroll-x flex gap-1.5 pb-1 lg:flex-col lg:gap-0 lg:overflow-visible">
        {nodes.map((n, i) => {
          const isActive = n.id === active;
          const enabled = present.has(n.id);
          return (
            <li key={n.id} className="flex shrink-0 items-center lg:flex-col lg:items-stretch">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onJump(n.id)}
                aria-current={isActive ? 'step' : undefined}
                data-flow={n.id}
                className={cn(
                  'relative min-h-11 rounded-lg px-3 py-2 text-left text-sm leading-snug ring-1 transition-colors lg:w-full',
                  isActive
                    ? 'bg-primary font-semibold text-white ring-primary'
                    : enabled
                      ? 'bg-white/80 text-ink ring-line hover:bg-ice-100'
                      : 'bg-white/40 text-muted ring-line/50',
                )}
              >
                {isActive && <BeamRing duration={3} from="#ffffff" to="#38b6ff" />}
                {n.label}
              </button>
              {i < nodes.length - 1 && (
                <span
                  aria-hidden
                  className="mx-0.5 text-line lg:mx-auto lg:my-0.5 lg:h-3 lg:w-px lg:bg-line"
                >
                  <span className="lg:hidden">›</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
