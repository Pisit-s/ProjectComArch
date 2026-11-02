'use client';

import { ArrowDown, ArrowRight, ArrowUp, TriangleAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { BINARY32, encodeDecimal } from '@/lib/fp';
import { parseBitsInput } from '@/lib/lesson/ch3-special';
import {
  type DecodeFrame,
  type DecodeScene as DecodeModel,
  type EncodeFrame,
  type EncodeScene as Model,
  type NormalizeView,
  buildDecodeFrames,
  buildEncodeFrames,
} from '@/lib/lesson/encode-frames';
import { caption } from '@/content/lesson/captions';
import { DECODE_EXAMPLES, ENCODE_EXAMPLES } from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import { UI_CH34 } from '@/content/lesson/ui-ch34';
import { OperandInput } from '@/components/lesson/operand-input';
import { StepPlayer } from '@/components/player/step-player';
import { usePlayerMotion } from '@/components/player/player-speed';
import { ExampleChips } from '@/components/stage/ch34-chips';
import { Piece, Times } from '@/components/stage/ch34-formula';
import { Word32, type WordField } from '@/components/stage/ch34-word';
import { ExponentTag } from '@/components/stage/exponent-tag';
import { TimesTwo } from '@/components/stage/times-two';
import { Num, minus } from '@/components/ui/num';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

const sceneTitle = (id: string): string =>
  sectionById('ieee754').scenes.find((s) => s.id === id)?.title ?? id;

const Big = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn(
      'num text-center font-mono text-[clamp(1.4rem,7vw,2.2rem)] font-semibold',
      className,
    )}
  >
    {children}
  </div>
);

const Chip = ({ label, children, tone }: { label: string; children: ReactNode; tone: string }) => (
  <span className="inline-flex flex-col items-center gap-0.5 rounded-xl bg-white/80 px-4 py-2 ring-1 ring-line">
    <span className="text-xs text-muted">{label}</span>
    <b className={cn('num font-mono text-2xl', tone)}>{children}</b>
  </span>
);

/** Binary point hopping one place at a time; the × 2^e tag counts the hops. */
function PointHop({ n }: { n: NormalizeView }) {
  const { d, reduced } = usePlayerMotion();
  const [pos, setPos] = useState(reduced ? n.to : n.from);
  useEffect(() => {
    if (pos === n.to) return;
    const t = setTimeout(
      () => setPos((p) => p + (n.to > p ? 1 : -1)),
      Math.max(60, d(Math.min(0.3, 1.2 / Math.max(1, n.hops))) * 1000),
    );
    return () => clearTimeout(t);
  }, [pos, n.to, n.hops, d]);
  const done = pos === n.to;
  if (n.compact) {
    return (
      <div className="space-y-2 text-center" data-testid="encode-hop">
        <Big className="text-ink/60">{n.before}</Big>
        <ArrowDown className="mx-auto h-5 w-5 text-muted" aria-hidden />
        <Big>
          {n.after} <ExponentTag exp={n.e} />
        </Big>
      </div>
    );
  }
  const digits = [...n.digits];
  return (
    <div className="space-y-3" data-testid="encode-hop">
      <Big className="flex items-baseline justify-center">
        {digits.map((c, k) => (
          <span key={k} className="flex items-baseline">
            {k === pos && (
              <motion.span layoutId="enc-point" transition={SPRING} className="text-primary">
                .
              </motion.span>
            )}
            <span
              className={cn(
                'transition-opacity duration-300',
                done && k < n.lead && 'opacity-25',
                done && k === n.to - 1 && 'text-bit-frac-ink',
              )}
            >
              {c}
            </span>
          </span>
        ))}
        {pos >= digits.length && (
          <motion.span layoutId="enc-point" transition={SPRING} className="text-primary">
            .
          </motion.span>
        )}
        {n.more && <span className="text-muted">…</span>}
        <span className="ml-3 text-[0.75em]">
          <ExponentTag exp={done ? n.e : n.from - pos} />
        </span>
      </Big>
      {done && (n.lead > 0 || n.more) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="num text-center font-mono text-lg"
        >
          {n.after} <ExponentTag exp={n.e} />
        </motion.p>
      )}
    </div>
  );
}

const FOCUS: Partial<Record<EncodeFrame['stage'], WordField>> = {
  sign: 'sign',
  exp: 'exp',
  sig: 'sig',
};

function RegisterStage({ m, f }: { m: Model; f: EncodeFrame }) {
  const p = f.params;
  let side: ReactNode = null;
  if (f.stage === 'sign') {
    side = (
      <Chip label="Sign" tone="text-bit-sign-ink">
        {p.s}
      </Chip>
    );
  } else if (f.stage === 'exp') {
    side = (
      <p className="num text-center font-mono text-lg">
        {minus(p.e)} + 127 = <b className="text-bit-exp-ink">{p.E}</b>{' '}
        <ArrowRight className="inline h-4 w-4 text-muted" aria-hidden />{' '}
        <b className="text-bit-exp-ink">{p.Ebits}</b>
        <sub>2</sub>
      </p>
    );
  } else if (f.stage === 'sig' && m.normalize) {
    const [one, rest] = m.normalize.after.split('.');
    side = (
      <p className="num text-center font-mono text-lg">
        <span className="text-ink/40">{one}.</span>
        <b className="text-bit-frac-ink">{rest}</b>
      </p>
    );
  } else if (f.stage === 'round') {
    const up = p.decision === 'up' || p.decision === 'tie-even-up';
    side = (
      <div className="flex flex-col items-center gap-2">
        <span className="flex gap-1.5">
          {(['g', 'r', 's'] as const).map((k) => (
            <span
              key={k}
              className="num rounded-full bg-white/80 px-3 py-1 font-mono text-sm ring-1 ring-line"
            >
              <span className="text-muted">{k.toUpperCase()} </span>
              <b className="text-bit-grs-ink">{p[k]}</b>
            </span>
          ))}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-bit-grs-ink text-white">
            {up ? (
              <ArrowUp className="h-4 w-4" aria-hidden />
            ) : (
              <ArrowDown className="h-4 w-4" aria-hidden />
            )}
          </span>
        </span>
        <p className="text-center text-sm">
          <span className="text-muted">{UI_CH34.stored} </span>
          <b className="num font-mono break-all">{minus(m.storedExact)}</b>
        </p>
      </div>
    );
  } else if (f.stage === 'hex') {
    side = (
      <div className="space-y-2">
        <ol className="mx-auto grid w-max grid-cols-4 gap-x-2 gap-y-2 sm:grid-cols-8">
          {m.nibbles.map((nb, k) => (
            <motion.li
              key={k}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: k * 0.06 }}
              className="flex flex-col items-center rounded-lg bg-white/80 px-1.5 py-1 ring-1 ring-line"
            >
              <span className="num font-mono text-xs text-muted">{nb.bits}</span>
              <b className="num font-mono text-xl text-primary">{nb.hex}</b>
            </motion.li>
          ))}
        </ol>
        <Big>
          <span data-testid="encode-hex">{m.hex}</span>
        </Big>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Word32
        fill={f.register}
        focus={FOCUS[f.stage] ?? null}
        hiddenBit={f.stage === 'hidden'}
        testId="encode-word"
      />
      {side}
    </div>
  );
}

function EncodeFrameView({ m, f }: { m: Model; f: EncodeFrame }) {
  const p = f.params;
  switch (f.stage) {
    case 'split':
      return (
        <div className="flex items-center justify-center gap-3 pt-6">
          <motion.div initial={{ x: 24 }} animate={{ x: 0 }} transition={SPRING}>
            <Chip label={UI_CH34.intPart} tone="text-ink">
              {p.int}
            </Chip>
          </motion.div>
          <span className="font-mono text-2xl text-muted">+</span>
          <motion.div initial={{ x: -24 }} animate={{ x: 0 }} transition={SPRING}>
            <Chip label={UI_CH34.fracPart} tone="text-bit-frac-ink">
              {p.frac}
            </Chip>
          </motion.div>
        </div>
      );
    case 'int':
      return (
        <div className="space-y-4 pt-2">
          {m.intTerms.length > 0 && (
            <ol className="flex justify-center gap-1.5" data-testid="encode-places">
              {m.intTerms.map((t, k) => (
                <motion.li
                  key={k}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: k * 0.08 }}
                  className={cn(
                    'flex min-w-11 flex-col items-center rounded-lg px-2 py-1 ring-1',
                    t.bit ? 'bg-primary/10 ring-primary' : 'bg-white/60 ring-line',
                  )}
                >
                  <span className="num font-mono text-xs text-muted">{t.weight}</span>
                  <b
                    className={cn('num font-mono text-xl', t.bit ? 'text-primary' : 'text-ink/40')}
                  >
                    {t.bit}
                  </b>
                </motion.li>
              ))}
            </ol>
          )}
          <Big>
            {p.int} = {p.intBin}
            <sub className="text-[0.5em] text-muted">2</sub>
          </Big>
        </div>
      );
    case 'times2':
    case 'loop':
      return (
        <TimesTwo
          intBin={m.intBin}
          rows={f.rows}
          loop={
            f.stage === 'loop' ? { start: Number(p.start), length: Number(p.length) } : undefined
          }
          testId="encode-times2"
        />
      );
    case 'join':
      return (
        <div className="pt-8">
          <Big>
            {p.bin}
            <sub className="text-[0.5em] text-muted">2</sub>
          </Big>
        </div>
      );
    case 'normalize':
      return m.normalize ? <PointHop n={m.normalize} /> : null;
    default:
      return <RegisterStage m={m} f={f} />;
  }
}

/** Scene 4.1: decimal → binary → normalize → fields → hex, every value from the engine. */
export function EncodeScene() {
  const [text, setText] = useState(ENCODE_EXAMPLES[0]);
  const [touched, setTouched] = useState(false);
  const [last, setLast] = useState<Model | null>(null);
  const parsed = useMemo(() => {
    const r = encodeDecimal(BINARY32, text);
    return r.ok
      ? { model: buildEncodeFrames(BINARY32, r), error: null }
      : { model: null, error: r.error.kind };
  }, [text]);
  if (parsed.model && parsed.model !== last) setLast(parsed.model);
  const m = parsed.model ?? last;
  const set = (v: string) => (setTouched(true), setText(v));

  return (
    <div className="space-y-3" data-testid="encode">
      <OperandInput
        label={UI_CH34.number}
        value={text}
        onChange={set}
        error={parsed.error}
        inputMode="decimal"
        testId="encode-input"
        className="max-w-xs"
      />
      <ExampleChips items={ENCODE_EXAMPLES} current={text} onPick={set} testId="encode" />
      {m?.inexact && (
        <div
          role="status"
          className="alert alert-soft py-2 text-sm alert-warning"
          data-testid="encode-warning"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
          <span className="break-all">{caption('enc.inexact', { stored: m.storedExact })}</span>
        </div>
      )}
      {m && (
        <StepPlayer
          key={`${m.hex}|${text}`}
          steps={m.frames.map((f) => ({
            id: f.id,
            title: f.id,
            caption: caption(f.captionKey, f.params),
          }))}
          label={sceneTitle('encode')}
          poster={!touched}
          testId="encode-player"
          minHeight="18rem"
          render={(i) => <EncodeFrameView m={m} f={m.frames[i]} />}
        />
      )}
    </div>
  );
}

const DEC_FOCUS: Record<DecodeFrame['focus'], WordField | null> = {
  fields: null,
  exp: 'exp',
  sig: 'sig',
  value: null,
};

function DecodeFrameView({ m, index }: { m: DecodeModel; index: number }) {
  const f = m.frames[index];
  const seen = new Set(m.frames.slice(0, index + 1).map((x) => x.focus));
  const exp = m.frames.find((x) => x.focus === 'exp')?.params;
  const sig = m.frames.find((x) => x.focus === 'sig')?.params;
  const neg = m.fields.sign === '1';
  return (
    <div className="space-y-4">
      <Word32
        fill={m.fields}
        focus={DEC_FOCUS[f.focus]}
        hiddenBit={seen.has('sig')}
        testId="decode-word"
      />
      <div className="flex flex-wrap items-stretch justify-center gap-2">
        <Piece
          tone="ring-bit-sign text-bit-sign-ink"
          plugged
          symbol={
            <>
              (−1)<sup>s</sup>
            </>
          }
          value={
            <>
              s = {m.fields.sign} → {neg ? '−' : '+'}
            </>
          }
          testId="decode-sign"
        />
        {sig && (
          <>
            <Times />
            <Piece
              tone="ring-bit-frac text-bit-frac-ink"
              plugged={seen.has('sig')}
              symbol="1.significand"
              value={
                <>
                  {sig.sig}
                  <sub>2</sub>
                </>
              }
              testId="decode-sig"
            />
          </>
        )}
        {exp && (
          <>
            <Times />
            <Piece
              tone="ring-bit-exp text-bit-exp-ink"
              plugged={seen.has('exp')}
              symbol={
                <>
                  2<sup>(Exponent − 127)</sup>
                </>
              }
              value={
                <>
                  2<sup>({exp.E} − 127)</sup> = 2<sup>{minus(exp.e)}</sup>
                </>
              }
              testId="decode-exp"
            />
          </>
        )}
      </div>
      {f.focus === 'value' && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          className="num text-center font-mono text-xl break-all sm:text-2xl"
        >
          <span className="text-muted">= </span>
          <b className="text-primary" data-testid="decode-value">
            <Num value={m.value} />
          </b>
        </motion.p>
      )}
    </div>
  );
}

/** Scene 4.2: hex back to a value (P&H 0xC0A00000 = −5). */
export function DecodeScene() {
  const [text, setText] = useState(DECODE_EXAMPLES[0]);
  const [touched, setTouched] = useState(false);
  const [last, setLast] = useState<DecodeModel | null>(null);
  const parsed = useMemo(() => {
    const r = parseBitsInput(BINARY32, text, true);
    return r.ok
      ? { model: buildDecodeFrames(BINARY32, r.bits), error: null }
      : { model: null, error: r.error };
  }, [text]);
  if (parsed.model && parsed.model !== last) setLast(parsed.model);
  const m = parsed.model ?? last;
  const set = (v: string) => (setTouched(true), setText(v));

  return (
    <div className="space-y-3" data-testid="decode">
      <OperandInput
        label={UI_CH34.hex}
        value={text}
        onChange={set}
        error={parsed.error}
        testId="decode-input"
        className="max-w-xs"
      />
      <ExampleChips items={DECODE_EXAMPLES} current={text} onPick={set} testId="decode" />
      {m && (
        <StepPlayer
          key={m.hex}
          steps={m.frames.map((f) => ({
            id: f.id,
            title: f.id,
            caption: caption(f.captionKey, f.params),
          }))}
          label={sceneTitle('decode')}
          poster={!touched}
          testId="decode-player"
          minHeight="14rem"
          render={(i) => <DecodeFrameView m={m} index={i} />}
        />
      )}
    </div>
  );
}
