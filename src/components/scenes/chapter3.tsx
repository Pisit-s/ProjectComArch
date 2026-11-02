'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { BINARY32, encodeBits } from '@/lib/fp';
import {
  type ZoneId,
  ZONES,
  buildSpecialView,
  doubleCompare,
  parseBitsInput,
  specialRange,
  zoneOf,
  zoneRange,
} from '@/lib/lesson/ch3-special';
import { exponentWindow } from '@/lib/lesson/window';
import {
  buildLayoutFrames,
  type LayoutFrame,
  type LayoutScene as Model,
} from '@/lib/lesson/encode-frames';
import { caption } from '@/content/lesson/captions';
import {
  BITPLAY_EXAMPLES,
  LAYOUT_DEFAULT,
  LAYOUT_EXAMPLES,
  SPECIAL_EXAMPLES,
} from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import { UI_CH34 } from '@/content/lesson/ui-ch34';
import { OperandInput } from '@/components/lesson/operand-input';
import { StepPlayer } from '@/components/player/step-player';
import { usePlayerMotion } from '@/components/player/player-speed';
import { ExampleChips } from '@/components/stage/ch34-chips';
import { Piece, Times } from '@/components/stage/ch34-formula';
import { Word32, type WordField } from '@/components/stage/ch34-word';
import { ExponentWindow } from '@/components/stage/exponent-window';
import { Register32 } from '@/components/stage/register32';
import { Num, minus } from '@/components/ui/num';
import { cn } from '@/lib/utils';

const sceneTitle = (id: string): string =>
  sectionById('ieee754').scenes.find((s) => s.id === id)?.title ?? id;

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

/** Scene 3.2: tap bits; the exponent picks a range [2^e, 2^(e+1)), the significand a spot in it. */
export function BitPlayScene() {
  const [bits, setBits] = useState(() => encodeBits(BINARY32, BITPLAY_EXAMPLES[4]) ?? 0n);
  const win = useMemo(() => exponentWindow(BINARY32, bits), [bits]);
  const view = useMemo(() => buildSpecialView(BINARY32, bits), [bits]);
  const live = win
    ? caption('bitplay.live', { lo: win.lo, hi: win.hi })
    : caption(view.zone === 'zone0' ? 'special.zone0' : 'special.zone255');
  // flip one bit of the word (index 0 = bit 31); every value shown is decoded by the engine
  const toggle = (i: number) => setBits((b) => b ^ (1n << BigInt(31 - i)));
  return (
    <div className="space-y-3" data-testid="bitplay">
      <ExampleChips
        items={BITPLAY_EXAMPLES}
        current={view.value}
        onPick={(t) => setBits(encodeBits(BINARY32, t) ?? 0n)}
        testId="bitplay"
      />
      <div className="glass-solid space-y-4 rounded-2xl p-3 ring-1 ring-foreground/10 sm:p-5">
        <p className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-muted">{UI_CH34.tapBits}</span>
          <span className="num font-mono">
            <span className="text-sm text-muted" data-testid="bitplay-hex">
              {view.hex}
            </span>{' '}
            ={' '}
            <b className="text-xl text-primary" data-testid="bitplay-value">
              <Num value={view.value} />
            </b>
          </span>
        </p>
        {win ? (
          <ExponentWindow win={win} testId="bitplay-window" />
        ) : (
          <div className="grid h-16 place-items-center rounded-xl bg-white/70 text-sm text-muted ring-1 ring-line">
            {UI_CH34.noRange}
          </div>
        )}
        <p className="min-h-12 text-base" aria-live="polite" data-testid="bitplay-caption">
          {live}
        </p>
        <Register32
          bits={bits}
          mode="edit"
          onToggle={toggle}
          showHex={false}
          name="bitplay-reg"
          className="bg-white/60"
        />
      </div>
    </div>
  );
}

const ZONE_FLEX: Record<ZoneId, number> = { zone0: 1, zoneNormal: 3, zone255: 1 };

/** Float against double: bar widths follow the bit counts (pixel layout only). */
function DoubleCompare() {
  const c = doubleCompare();
  const row = (name: string, e: string, f: string, b: string, total: number) => (
    <div className="space-y-1">
      <p className="flex justify-between text-xs">
        <b>{name}</b>
        {total < 100 && (
          <span className="num font-mono text-muted">
            1 + {e} + {f} · {UI_CH34.bias} {b}
          </span>
        )}
      </p>
      <div className="flex h-5 overflow-hidden rounded-md" style={{ width: `${total}%` }}>
        <span className="bg-bit-sign" style={{ flex: 1 }} />
        <span className="bg-bit-exp" style={{ flex: Number(e) }} />
        <span className="bg-bit-frac" style={{ flex: Number(f) }} />
      </div>
    </div>
  );
  return (
    <div
      className="space-y-2 rounded-xl bg-white/70 p-3 ring-1 ring-line"
      data-testid="double-compare"
    >
      {row(UI_CH34.float, c.e32, c.f32, c.b32, 50)}
      {row(UI_CH34.double, c.e64, c.f64, c.b64, 100)}
      <p className="text-sm">{caption('double.compare', c)}</p>
    </div>
  );
}

/** Scene 3.3: the three exponent zones and the bit patterns of the slides. */
export function SpecialScene() {
  const [hex, setHex] = useState(SPECIAL_EXAMPLES[3]);
  const v = useMemo(() => buildSpecialView(BINARY32, BigInt('0x' + hex)), [hex]);
  const range = useMemo(() => specialRange(BINARY32), []);
  const zoneHexes = SPECIAL_EXAMPLES.filter((h) => zoneOf(BINARY32, BigInt('0x' + h)) === v.zone);
  return (
    <div className="space-y-3" data-testid="special">
      <div className="flex gap-1.5" role="group" aria-label={UI_CH34.zones}>
        {ZONES.map((z) => {
          const on = z.id === v.zone;
          return (
            <button
              key={z.id}
              type="button"
              aria-pressed={on}
              onClick={() =>
                setHex(
                  SPECIAL_EXAMPLES.find((h) => zoneOf(BINARY32, BigInt('0x' + h)) === z.id) ?? hex,
                )
              }
              style={{ flex: ZONE_FLEX[z.id] }}
              className={cn(
                'btn h-auto min-h-14 min-w-0 flex-col gap-0 rounded-xl px-2 py-1.5',
                on ? 'btn-primary' : 'bg-white/80 ring-1 ring-line',
              )}
              data-testid={`special-${z.id}`}
            >
              <span className={cn('text-xs font-normal', on ? 'text-white/85' : 'text-muted')}>
                Exponent
              </span>
              <span className="num font-mono text-base">{zoneRange(BINARY32, z.id)}</span>
            </button>
          );
        })}
      </div>
      <p className="min-h-6 text-base" aria-live="polite" data-testid="special-caption">
        {caption(ZONES.find((z) => z.id === v.zone)!.captionKey)}
      </p>
      <ExampleChips
        items={zoneHexes.map((h) => `0x${h}`)}
        current={v.hex}
        onPick={(t) => setHex(t.slice(2))}
        testId="special"
      />
      <div className="glass-solid space-y-3 rounded-2xl p-3 ring-1 ring-foreground/10 sm:p-5">
        <Register32 bits={v.bits} name="special-reg" className="bg-white/60" />
        <p className="num flex flex-wrap items-baseline justify-between gap-2 font-mono">
          <span className="text-sm text-muted">
            Exponent = <b className="text-bit-exp-ink">{v.E}</b>
          </span>
          <b className="text-xl text-primary" data-testid="special-value">
            <Num value={v.value} />
          </b>
        </p>
        {v.zone === 'zoneNormal' && (
          <p className="text-sm text-muted" data-testid="special-range">
            {caption('special.range', range)}
          </p>
        )}
      </div>
      <DoubleCompare />
    </div>
  );
}
