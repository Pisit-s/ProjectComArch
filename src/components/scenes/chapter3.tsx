'use client';

import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useMemo, useState } from 'react';
import { BINARY32 } from '@/lib/fp';
import { parseBitsInput } from '@/lib/lesson/ch3-special';
import {
  buildLayoutFrames,
  type LayoutFrame,
  type LayoutScene as Model,
} from '@/lib/lesson/encode-frames';
import { caption } from '@/content/lesson/captions';
import { UI } from '@/content/lesson/copy';
import { LAYOUT_DEFAULT, LAYOUT_EXAMPLES } from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import { UI_CH34 } from '@/content/lesson/ui-ch34';
import { ScenePlaceholder } from '@/components/lesson/scene-shell';
import { OperandInput } from '@/components/lesson/operand-input';
import { StepPlayer } from '@/components/player/step-player';
import { usePlayerMotion } from '@/components/player/player-speed';
import { Word32, type WordField } from '@/components/stage/ch34-word';
import { minus } from '@/components/ui/num';
import { cn } from '@/lib/utils';

const sceneTitle = (id: string): string =>
  sectionById('ieee754').scenes.find((s) => s.id === id)?.title ?? id;

/** Example chips under an input (inputs only; the scene computes nothing itself). */
export function ExampleChips({
  items,
  current,
  onPick,
  testId,
}: {
  items: string[];
  current: string;
  onPick: (v: string) => void;
  testId: string;
}) {
  return (
    <div className="scroll-x -mx-4 flex gap-1.5 px-4 pb-1" aria-label={UI.examples} role="group">
      {items.map((t) => {
        const on = t === current;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(t)}
            className={cn(
              'btn h-9 min-h-9 shrink-0 rounded-full px-3 font-mono text-sm font-medium',
              on ? 'btn-primary' : 'bg-white/80 ring-1 ring-line',
            )}
            data-testid={`${testId}-chip`}
          >
            {minus(t)}
          </button>
        );
      })}
    </div>
  );
}

/** One piece of the formula: its symbol, and the value plugged in once that frame comes. */
function Piece({
  tone,
  plugged,
  symbol,
  value,
  testId,
}: {
  tone: string;
  plugged: boolean;
  symbol: ReactNode;
  value: ReactNode;
  testId: string;
}) {
  const { d } = usePlayerMotion();
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center gap-1 rounded-xl bg-white/80 px-3 py-2 ring-2 transition-shadow',
        tone,
        plugged ? 'shadow-md' : 'ring-1',
      )}
      data-testid={testId}
      data-plugged={plugged ? '1' : '0'}
    >
      <span className="num font-mono text-sm whitespace-nowrap">{symbol}</span>
      <AnimatePresence initial={false}>
        {plugged && (
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: d(0.35) }}
            className="num font-mono text-base font-semibold whitespace-nowrap"
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

const Times = () => (
  <span className="self-center font-mono text-lg text-muted" aria-hidden>
    ×
  </span>
);

function LayoutFrameView({ m, f, focus }: { m: Model; f: LayoutFrame; focus: WordField | null }) {
  const p = m.plug;
  const { d } = usePlayerMotion();
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted">hex</span>
        <b className="num font-mono" data-testid="layout-hex">
          {m.hex}
        </b>
      </div>
      <Word32
        fill={m.fields}
        colored={{ sign: f.reveal.sign, exp: f.reveal.exp, sig: f.reveal.sig }}
        focus={focus}
        hiddenBit={f.plug.sig}
        testId="layout-word"
      />
      <AnimatePresence initial={false}>
        {f.reveal.formula && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.4) }}
            className="space-y-3"
          >
            <div className="flex flex-wrap items-stretch justify-center gap-2">
              <Piece
                tone="ring-bit-sign text-bit-sign-ink"
                plugged={f.plug.sign}
                symbol={
                  <>
                    (−1)<sup>s</sup>
                  </>
                }
                value={
                  <>
                    s = {p.s} → {p.s === '1' ? '−' : '+'}
                  </>
                }
                testId="layout-sign"
              />
              <Times />
              <Piece
                tone="ring-bit-frac text-bit-frac-ink"
                plugged={f.plug.sig}
                symbol="1.significand"
                value={
                  <>
                    {p.sigBin}
                    <sub>2</sub> = {p.sigDec}
                  </>
                }
                testId="layout-sig"
              />
              <Times />
              <Piece
                tone="ring-bit-exp text-bit-exp-ink"
                plugged={f.plug.exp}
                symbol={
                  <>
                    2<sup>(Exponent − 127)</sup>
                  </>
                }
                value={
                  <>
                    2
                    <sup>
                      (<span data-testid="layout-exp">{p.E}</span> − 127)
                    </sup>{' '}
                    = 2<sup>{minus(p.e)}</sup>
                    {p.pow.startsWith('2^') ? '' : ` = ${p.pow}`}
                  </>
                }
                testId="layout-exp-piece"
              />
            </div>
            <AnimatePresence initial={false}>
              {f.plug.value && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="num text-center font-mono text-xl"
                >
                  {p.s === '1' ? '−' : '+'}
                  {p.sigDec} ×{' '}
                  {p.pow.startsWith('2^') ? (
                    <>
                      2<sup>{minus(p.e)}</sup>
                    </>
                  ) : (
                    p.pow
                  )}{' '}
                  ={' '}
                  <b className="text-primary" data-testid="layout-value">
                    {minus(p.value)}
                  </b>
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FOCUS: Record<string, WordField | null> = { sign: 'sign', exp: 'exp', sig: 'sig' };
const PLUG_FOCUS: Record<string, WordField | null> = {
  'plug-sign': 'sign',
  'plug-exp': 'exp',
  'plug-sig': 'sig',
};

/** Scene 3.1: split 32 bits into Sign / Exponent / Significand and plug them into the formula. */
export function LayoutScene() {
  const [text, setText] = useState(LAYOUT_DEFAULT);
  const [touched, setTouched] = useState(false);
  const [last, setLast] = useState<Model | null>(null);
  const parsed = useMemo(() => {
    const r = parseBitsInput(BINARY32, text);
    if (!r.ok) return { model: null, error: r.error };
    const m = buildLayoutFrames(BINARY32, r.bits);
    return m ? { model: m, error: null } : { model: null, error: UI_CH34.normalOnly };
  }, [text]);
  if (parsed.model && parsed.model !== last) setLast(parsed.model);
  const m = parsed.model ?? last;
  const set = (v: string) => (setTouched(true), setText(v));

  return (
    <div className="space-y-3" data-testid="layout">
      <OperandInput
        label={UI_CH34.numberOrHex}
        value={text}
        onChange={set}
        error={parsed.error}
        testId="layout-input"
        className="max-w-xs"
      />
      <ExampleChips items={LAYOUT_EXAMPLES} current={text} onPick={set} testId="layout" />
      {m && (
        <StepPlayer
          key={m.hex}
          steps={m.frames.map((f) => ({
            id: f.id,
            title: f.id,
            caption: caption(f.captionKey, f.params),
          }))}
          label={sceneTitle('layout')}
          poster={!touched}
          testId="layout-player"
          minHeight="17rem"
          render={(i) => (
            <LayoutFrameView
              m={m}
              f={m.frames[i]}
              focus={FOCUS[m.frames[i].id] ?? PLUG_FOCUS[m.frames[i].id] ?? null}
            />
          )}
        />
      )}
    </div>
  );
}

export function BitPlayScene() {
  return <ScenePlaceholder minHeight="24rem" />;
}

export function SpecialScene() {
  return <ScenePlaceholder minHeight="22rem" />;
}
