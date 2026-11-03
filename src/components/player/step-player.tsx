'use client';

import {
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Pause,
  Play,
  Presentation,
  RotateCcw,
} from 'lucide-react';
import { LayoutGroup, MotionConfig, useReducedMotion } from 'motion/react';
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ZOOM_EVENT } from '@/components/layout/zoom-control';
import { StepBar } from '@/components/stage/step-bar';
import { UI } from '@/content/lesson/copy';
import { cn } from '@/lib/utils';
import { PlayerSpeedContext } from './player-speed';
import { SPEEDS, type Speed, usePlayer } from './use-player';

export interface PlayerStep {
  id: string;
  /** Short name, used as the label of the step dot. */
  title: string;
  /** One or two lines under the stage. */
  caption: string;
  /** Longer reason behind the "ทำไม?" button. */
  detail?: string;
  /** Which of the four add/sub steps this frame belongs to (0 = none). */
  bigStep?: 0 | 1 | 2 | 3 | 4;
}

type Props = {
  steps: PlayerStep[];
  render: (index: number) => ReactNode;
  /** Accessible name of the player region. */
  label: string;
  /** Show the four-step bar (align, add/sub, normalize, round) above the stage. */
  stepBar?: boolean;
  initialStep?: number;
  onStepChange?: (index: number) => void;
  /** Hero teaser only: play once by itself. */
  autoPlay?: boolean;
  /** Big play button over the stage until the first play (PLAN.md 4.4). */
  poster?: boolean;
  /** Reserved stage height (no layout shift). */
  minHeight?: string;
  className?: string;
  testId?: string;
  /** Extra controls under the player (example chips, inputs). */
  children?: ReactNode;
};

/**
 * Stage-first player (PLAN.md 4.4): the picture is the main thing, a short caption sits under it,
 * and one row of controls drives it (previous / play / next / step dots / speed / restart /
 * presentation). Keyboard works while focus is inside; reduced motion cuts frames instantly.
 * Each frame renders its whole state, so the scene animates between frames both ways.
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
  stepBar = false,
  initialStep = 0,
  onStepChange,
  autoPlay = false,
  poster = true,
  minHeight = '14rem',
  className,
  testId = 'player',
  children,
}: Props) {
  const p = usePlayer(steps.length, initialStep, autoPlay);
  const reduced = useReducedMotion() ?? false;
  const captionId = useId();
  const dotsRef = useRef<HTMLOListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [presenting, setPresenting] = useState(false);
  const [started, setStarted] = useState(!poster || autoPlay || initialStep > 0);
  const [whyOpen, setWhyOpen] = useState(false);
  const step = steps[p.index];
  // the frame and the caption keep the biggest size they have had: stepping never makes the
  // picture or the controls jump
  const [frameRef, frameMin] = useGrowOnly<HTMLDivElement>(presenting);
  const [captionRef, captionMin] = useGrowOnly<HTMLDivElement>(presenting);
  // presenting: every frame is drawn once off screen, so the frame box starts at its final size
  const measureRef = useRef<HTMLDivElement>(null);
  const captionMeasureRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; c: number; gen: number } | null>(null);
  const measuring = presenting && box?.gen !== frameMin.gen;
  const boxW = presenting ? Math.max(box?.w ?? 0, frameMin.w) : 0;
  const boxH = Math.max(presenting ? (box?.h ?? 0) : 0, frameMin.h);

  const notify = useEffectEvent((i: number) => onStepChange?.(i));
  useEffect(() => {
    notify(p.index);
  }, [p.index]);

  // keep the current dot visible inside the scrolling dot strip (never scroll the page)
  useEffect(() => {
    const strip = dotsRef.current;
    const li = strip?.children[p.index] as HTMLElement | undefined;
    if (!strip || !li || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({ left: li.offsetLeft - strip.clientWidth / 2 + li.clientWidth / 2 });
  }, [p.index]);

  const begin = () => setStarted(true);
  const go = (i: number) => {
    begin();
    setWhyOpen(false);
    p.go(i);
  };
  const next = () => go(p.index + 1);
  const prev = () => go(p.index - 1);
  const restart = () => go(0);
  const toggle = () => {
    begin();
    setWhyOpen(false);
    p.togglePlay();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    const tag = t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return;
    // Esc leaves presentation mode even where fullscreen is not available (iOS Safari)
    if (e.key === 'Escape' && presenting) {
      e.preventDefault();
      setPresenting(false);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      restart();
    } else if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') {
      e.preventDefault();
      toggle();
    }
  };

  // Presentation mode: arrow keys / Space work anywhere on the page, Esc leaves.
  const onGlobalKey = useEffectEvent((e: globalThis.KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && sectionRef.current?.contains(t)) return;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (e.key === 'Escape') setPresenting(false);
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
    else if (e.key === 'Home') restart();
    else if (e.key === ' ') toggle();
    else return;
    e.preventDefault();
  });
  // layout effect: the big root font is in place before the frames are measured below
  useLayoutEffect(() => {
    if (!presenting) return;
    const root = document.documentElement;
    const prevFont = root.style.fontSize;
    const prevOverflow = document.body.style.overflow;
    root.style.fontSize = 'clamp(18px, 1.35vw, 32px)';
    document.body.style.overflow = 'hidden';
    sectionRef.current?.focus();
    root.requestFullscreen?.().catch(() => {});
    const onKey = (e: globalThis.KeyboardEvent) => onGlobalKey(e);
    const onFullscreen = () => {
      if (!document.fullscreenElement) setPresenting(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      root.style.fontSize = prevFont;
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [presenting]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!measuring || !el) return;
    const frames = Array.from(el.children) as HTMLElement[];
    const w = Math.max(...frames.map((c) => cssSize(c).w));
    // full-width parts (number lines, circuits) grow taller in the wider box: measure them there
    for (const c of frames) c.style.minWidth = `${w}px`;
    const h = Math.max(...frames.map((c) => cssSize(c).h));
    const captions = Array.from(captionMeasureRef.current?.children ?? []) as HTMLElement[];
    const c = Math.max(0, ...captions.map((x) => cssSize(x).h));
    setBox({ w, h, c, gen: frameMin.gen });
  }, [measuring, frameMin.gen]);

  const region = (
    <section
      ref={sectionRef}
      role="region"
      aria-label={label}
      aria-describedby={captionId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerEnter={autoPlay ? p.stop : undefined}
      onPointerDown={autoPlay ? p.stop : undefined}
      onFocusCapture={autoPlay ? p.stop : undefined}
      data-testid={testId}
      data-step={step?.id}
      data-step-index={p.index}
      data-presenting={presenting ? '1' : undefined}
      className={cn(
        'flex flex-col gap-3 rounded-2xl focus-visible:outline-2',
        className,
        // presenting: the whole player sits in the middle of the screen (safe: never cut off the top)
        presenting &&
          'fixed inset-0 z-[70] justify-center-safe overflow-y-auto rounded-none bg-ice-50 p-4 sm:p-8',
      )}
    >
      {stepBar && <StepBar active={step?.bigStep ?? 0} />}

      <div
        className={cn(
          'glass-solid relative overflow-hidden rounded-2xl p-3 ring-1 ring-foreground/10 sm:p-5',
          // presenting: the stage takes the rest of the screen, the frame sits in its middle
          presenting && 'flex flex-1 flex-col justify-center-safe',
        )}
        // presentation shows one scene at a time: no reserved height (it grows with the root font)
        style={{ minHeight: presenting ? undefined : minHeight }}
        data-stage
        data-testid={`${testId}-stage`}
      >
        {/* presenting: the frame is one block in the middle of the screen; its size only grows,
            so every step draws at the same place */}
        <div
          ref={frameRef}
          className={cn(presenting && 'mx-auto w-fit max-w-full')}
          style={{ minWidth: boxW || undefined, minHeight: boxH || undefined }}
          data-frame
          data-testid={`${testId}-frame`}
        >
          {render(p.index)}
        </div>
        {measuring && (
          <div
            ref={measureRef}
            className="invisible absolute inset-x-0 top-0 px-3 sm:px-5"
            aria-hidden
            inert
          >
            <MotionConfig reducedMotion="always">
              <PlayerSpeedContext.Provider value={{ speed: p.speed, reduced: true }}>
                {steps.map((s, i) => (
                  <LayoutGroup key={s.id} id={`${captionId}-m${i}`}>
                    <div className="w-fit max-w-full">{render(i)}</div>
                  </LayoutGroup>
                ))}
              </PlayerSpeedContext.Provider>
            </MotionConfig>
          </div>
        )}
        {!started && (
          <button
            type="button"
            onClick={toggle}
            className="absolute inset-0 grid place-items-center bg-white/55 transition-colors hover:bg-white/40 [@media(hover:none)]:bg-white/65"
            aria-label={`${UI.play} ${label}`}
            data-testid={`${testId}-poster`}
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-primary text-white shadow-xl ring-8 ring-primary/15">
              <Play className="ml-1 h-9 w-9" aria-hidden />
            </span>
          </button>
        )}
      </div>

      <div
        ref={captionRef}
        className="relative min-h-[3.25rem] px-1"
        style={{
          minHeight: presenting ? Math.max(box?.c ?? 0, captionMin.h) || undefined : undefined,
        }}
      >
        <p id={captionId} aria-live="polite" className={CAPTION} data-testid={`${testId}-caption`}>
          {step?.caption}
          {step?.detail && (
            <button
              type="button"
              onClick={() => setWhyOpen((o) => !o)}
              aria-expanded={whyOpen}
              className={cn(WHY, 'hover:bg-primary/15')}
              data-testid={`${testId}-why`}
            >
              {UI.why}
            </button>
          )}
        </p>
        {whyOpen && step?.detail && (
          <p
            className="mt-1 rounded-lg bg-ice-100 p-2.5 text-sm leading-relaxed text-ink/85"
            data-testid={`${testId}-detail`}
          >
            {step.detail}
          </p>
        )}
        {/* presenting: the longest caption sets the height, so the stage never changes size */}
        {measuring && (
          <div
            ref={captionMeasureRef}
            className="invisible absolute inset-x-0 top-0 px-1"
            aria-hidden
            inert
          >
            {steps.map((s) => (
              <p key={s.id} className={CAPTION}>
                {s.caption}
                {s.detail && <span className={WHY}>{UI.why}</span>}
              </p>
            ))}
          </div>
        )}
      </div>

      <Controls
        index={p.index}
        steps={steps}
        playing={p.playing}
        speed={p.speed}
        onPrev={prev}
        onNext={next}
        onToggle={toggle}
        onRestart={restart}
        onGo={go}
        onSpeed={p.setSpeed}
        presenting={presenting}
        onPresent={() => setPresenting((x) => !x)}
        dotsRef={dotsRef}
        testId={testId}
      />
      {children}
    </section>
  );

  return (
    <PlayerSpeedContext.Provider value={{ speed: p.speed, reduced }}>
      {presenting ? (
        <>
          <div
            className="glass grid min-h-40 place-items-center rounded-2xl bg-card p-4 text-muted ring-1 ring-foreground/10"
            aria-hidden
          >
            {UI.presenting}
          </div>
          {createPortal(region, document.body)}
        </>
      ) : (
        region
      )}
    </PlayerSpeedContext.Provider>
  );
}

const CAPTION = 'text-[1.05rem] leading-relaxed font-medium text-ink';
const WHY =
  'ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 align-middle text-sm font-semibold text-secondary';

/** Border-box size in CSS pixels (page zoom left out), rounded up so a minimum never cuts. */
function cssSize(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return { w: Math.ceil(parseFloat(cs.width)), h: Math.ceil(parseFloat(cs.height)) };
}

/**
 * Remembers the biggest size an element has had (it never shrinks back between steps).
 * Starts again when presentation mode toggles, the window width changes or the page zoom changes.
 */
function useGrowOnly<T extends HTMLElement>(mode: boolean) {
  const ref = useRef<T>(null);
  const [gen, setGen] = useState(0);
  const [min, setMin] = useState({ w: 0, h: 0, mode, gen });
  if (min.mode !== mode || min.gen !== gen) setMin({ w: 0, h: 0, mode, gen });

  useEffect(() => {
    let width = window.innerWidth;
    const onResize = () => {
      // phones fire resize when the address bar slides; only a new width counts
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      setGen((g) => g + 1);
    };
    const onZoom = () => setGen((g) => g + 1);
    window.addEventListener('resize', onResize);
    window.addEventListener(ZOOM_EVENT, onZoom);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener(ZOOM_EVENT, onZoom);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { w, h } = cssSize(el);
      setMin((m) => (w > m.w || h > m.h ? { ...m, w: Math.max(m.w, w), h: Math.max(m.h, h) } : m));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, gen]);

  return [ref, min] as const;
}

function Controls({
  index,
  steps,
  playing,
  speed,
  onPrev,
  onNext,
  onToggle,
  onRestart,
  onGo,
  onSpeed,
  presenting,
  onPresent,
  dotsRef,
  testId,
}: {
  index: number;
  steps: PlayerStep[];
  playing: boolean;
  speed: Speed;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
  onRestart: () => void;
  onGo: (i: number) => void;
  onSpeed: (s: Speed) => void;
  presenting: boolean;
  onPresent: () => void;
  dotsRef: React.RefObject<HTMLOListElement | null>;
  testId: string;
}) {
  const count = steps.length;
  return (
    <div className="glass flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 [@media(hover:none)]:bg-white/95">
      <div className="flex items-center">
        <button
          type="button"
          className="btn btn-circle h-11 min-h-11 w-11 btn-ghost"
          onClick={onPrev}
          disabled={index === 0}
          aria-label={UI.prev}
          data-testid={`${testId}-prev`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          className="btn btn-circle h-11 min-h-11 w-11 btn-primary"
          onClick={onToggle}
          aria-label={playing ? UI.pause : UI.play}
          aria-pressed={playing}
          data-testid={`${testId}-play`}
        >
          {playing ? (
            <Pause className="h-5 w-5" aria-hidden />
          ) : (
            <Play className="ml-0.5 h-5 w-5" aria-hidden />
          )}
        </button>
        <button
          type="button"
          className="btn btn-circle h-11 min-h-11 w-11 btn-ghost"
          onClick={onNext}
          disabled={index === count - 1}
          aria-label={UI.next}
          data-testid={`${testId}-next`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <ol
        ref={dotsRef}
        className="scroll-x flex min-w-0 flex-1 items-center gap-1 py-1"
        aria-label={UI.stepOf}
        data-testid={`${testId}-dots`}
      >
        {steps.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onGo(i)}
              aria-current={i === index ? 'step' : undefined}
              aria-label={`${UI.stepOf} ${i + 1}: ${s.title}`}
              className="grid h-8 min-w-5 place-items-center px-0.5"
            >
              <span
                className={cn(
                  'block h-2.5 rounded-full transition-all',
                  i === index
                    ? 'w-7 bg-primary'
                    : i < index
                      ? 'w-2.5 bg-primary/45'
                      : 'w-2.5 bg-line',
                )}
              />
            </button>
          </li>
        ))}
      </ol>

      <div className="ml-auto flex items-center gap-1">
        <label className="flex items-center">
          <span className="sr-only">{UI.speed}</span>
          <select
            className="select h-11 min-h-11 w-[4.5rem] select-ghost text-sm select-sm"
            value={speed}
            onChange={(e) => onSpeed(Number(e.target.value) as Speed)}
            aria-label={UI.speed}
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-circle h-11 min-h-11 w-11 btn-ghost"
          onClick={onRestart}
          aria-label={UI.restart}
          data-testid={`${testId}-restart`}
        >
          <RotateCcw className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          className={cn(
            'btn btn-circle h-11 min-h-11 w-11',
            presenting ? 'btn-primary' : 'btn-ghost',
          )}
          onClick={onPresent}
          aria-pressed={presenting}
          aria-label={presenting ? UI.exitPresent : UI.present}
          data-testid={`${testId}-present`}
        >
          {presenting ? (
            <Minimize2 className="h-5 w-5" aria-hidden />
          ) : (
            <Presentation className="h-5 w-5" aria-hidden />
          )}
        </button>
        <span className="num px-1 font-mono text-xs text-muted" data-testid={`${testId}-counter`}>
          {index + 1}/{count}
        </span>
      </div>
    </div>
  );
}
