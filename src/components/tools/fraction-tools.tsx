'use client';

import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { type KeyboardEvent, useMemo, useRef, useState } from 'react';
import { BitCell } from '@/components/bits/bit-cell';
import { usePlayerMotion } from '@/components/player/player-speed';
import { StepPlayer } from '@/components/player/step-player';
import { Num, Pow } from '@/components/ui/num';
import { Box, Explain } from '@/components/viz/step-parts';
import {
  R,
  type Rational,
  convertFraction,
  formatRational,
  fractionToBinary,
  fractionValue,
} from '@/lib/fp';
import { cn } from '@/lib/utils';
import { OperandInput } from './operand-input';

const plain = (r: Rational) => formatRational(r, { scientific: false });

/** 0.101₂ = 0.5 + 0.125 = 0.625 */
export function BinaryFractionDemo({ bits = '101' }: { bits?: string }) {
  const ones = [...bits].map((b, i) => ({ k: i + 1, b })).filter((x) => x.b === '1');
  const steps = [
    { id: 'w', title: 'น้ำหนักหลังจุด' },
    ...ones.map((o) => ({ id: `k${o.k}`, title: `บิตที่ ${o.k} หลังจุด` })),
    { id: 'sum', title: 'ค่าฐานสิบ' },
  ];
  return (
    <StepPlayer
      steps={steps}
      label={`แปลง 0.${bits} ฐานสองเป็นฐานสิบ`}
      minHeight="11rem"
      testId="frac-demo"
      render={(i) => {
        const used = ones.slice(0, Math.max(0, Math.min(i, ones.length)));
        const sum = fractionValue(
          [...bits].map((b, j) => (used.some((u) => u.k === j + 1) ? b : '0')).join(''),
        );
        return (
          <div className="space-y-3">
            <Box>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="self-center font-mono text-2xl">0.</span>
                {[...bits].map((b, j) => {
                  const k = j + 1;
                  const active = ones[i - 1]?.k === k;
                  return (
                    <div key={k} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted">
                        <Pow exp={-k} />
                      </span>
                      <BitCell bit={b as '0' | '1'} field="frac" size="lg" changed={active} />
                      <span className="num font-mono text-xs text-muted">{plain(R.pow2(-k))}</span>
                    </div>
                  );
                })}
              </div>
              <p className="num mt-3 text-center font-mono text-lg">
                {used.length ? used.map((u) => plain(R.pow2(-u.k))).join(' + ') : '0'} ={' '}
                <b className="text-primary">{plain(sum)}</b>
              </p>
            </Box>
            <Explain>
              {i === 0 && <p>หลังจุดฐานสอง น้ำหนักลดลงทีละครึ่ง: 1/2, 1/4, 1/8, … (2 ยกกำลังลบ)</p>}
              {i > 0 && i <= ones.length && (
                <p>บิตนี้เป็น 1 จึงบวกน้ำหนัก {plain(R.pow2(-ones[i - 1].k))}</p>
              )}
              {i > ones.length && (
                <p>
                  0.{bits}
                  <sub>2</sub> = {plain(sum)}
                  <sub>10</sub>
                </p>
              )}
            </Explain>
          </div>
        );
      }}
    />
  );
}

const N16 = 16;

export function FractionExplorer() {
  const [bits, setBits] = useState('1010000000000000');
  const [info, setInfo] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const value = fractionValue(bits);
  const pct = (Number(value.num) / Number(value.den)) * 100;
  const toggle = (i: number) => {
    setBits(bits.slice(0, i) + (bits[i] === '1' ? '0' : '1') + bits.slice(i + 1));
    setInfo(i);
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (next === null || next < 0 || next >= N16) return;
    e.preventDefault();
    setFocus(next);
    refs.current[next]?.focus();
  };
  const ones = [...bits].map((b, i) => ({ b, k: i + 1 })).filter((x) => x.b === '1');
  return (
    <div className="space-y-4" data-testid="frac-explorer">
      <div className="glass-solid rounded-xl p-3 ring-1 ring-foreground/10 sm:p-4">
        <div
          className="grid grid-cols-4 gap-2 min-[420px]:grid-cols-8 lg:grid-cols-16 lg:gap-1"
          role="group"
          aria-label="บิตหลังจุด 16 บิต"
        >
          {[...bits].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted">
                <Pow exp={-(i + 1)} />
              </span>
              <BitCell
                ref={(el) => {
                  refs.current[i] = el;
                }}
                bit={b as '0' | '1'}
                field="frac"
                size="lg"
                className="lg:w-full"
                tabIndex={i === focus ? 0 : -1}
                onFocus={() => setFocus(i)}
                onKeyDown={(e) => onKey(e, i)}
                onClick={() => toggle(i)}
                aria-pressed={b === '1'}
                aria-label={`บิตที่ ${i + 1} หลังจุด น้ำหนัก 1/${2 ** (i + 1)} ค่า ${b}`}
                data-testid={`frac-bit-${i}`}
              />
            </div>
          ))}
        </div>
        {info !== null && (
          <div
            className="mt-3 flex items-start gap-2 rounded-lg bg-ice-100 p-3 text-sm"
            role="status"
          >
            <p className="flex-1">
              บิตที่ {info + 1} หลังจุด น้ำหนัก <Pow exp={-(info + 1)} /> = 1/{2 ** (info + 1)} ={' '}
              <Num value={plain(R.pow2(-(info + 1)))} /> · ตอนนี้เป็น {bits[info]} จึงเพิ่มค่า{' '}
              <b>{bits[info] === '1' ? plain(R.pow2(-(info + 1))) : '0'}</b>
            </p>
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setInfo(null)}
              aria-label="ปิด"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
        <div className="mt-4 border-t border-line pt-3" aria-live="polite">
          <p className="num font-mono text-sm break-all" data-testid="frac-binary">
            0.{bits}
            <sub>2</sub>
          </p>
          <p className="mt-1 text-lg">
            ={' '}
            <b className="num font-mono text-2xl text-primary" data-testid="frac-decimal">
              {plain(value)}
            </b>
          </p>
          <p className="num mt-1 font-mono text-xs break-words text-muted">
            {ones.length ? ones.map((o) => plain(R.pow2(-o.k))).join(' + ') : '0'}
          </p>
        </div>
        <NumberLine pct={pct} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line btn-sm"
          onClick={() => setBits('0'.repeat(N16))}
        >
          ล้างเป็น 0
        </button>
        <button
          type="button"
          className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line btn-sm"
          onClick={() => setBits('1'.repeat(N16))}
        >
          เป็น 1 ทุกบิต
        </button>
        <button
          type="button"
          className="btn h-11 min-h-11 bg-white/80 btn-ghost ring-1 ring-line btn-sm"
          onClick={() => setBits(convertFraction(R.rat(1n, 10n), N16).bits.padEnd(N16, '0'))}
        >
          ใกล้ 0.1 ที่สุด (ตัดบิต)
        </button>
      </div>
      <p className="text-sm text-muted">
        16 บิตเก็บได้ละเอียดสุด <Pow exp={-16} /> = {plain(R.pow2(-16))} และค่ามากสุดคือ{' '}
        {plain(R.sub(R.ONE, R.pow2(-16)))} (ยังไม่ถึง 1)
      </p>
    </div>
  );
}

function NumberLine({ pct }: { pct: number }) {
  const { d } = usePlayerMotion();
  return (
    <div className="mt-4" aria-hidden>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-3.5 h-1 rounded-full bg-line" />
        <motion.div
          className="absolute top-3.5 left-0 h-1 rounded-full bg-bit-frac"
          animate={{ width: `${pct}%` }}
          transition={{ duration: d(0.35), ease: 'easeOut' }}
        />
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t} className="absolute top-2 h-4 w-px bg-muted/50" style={{ left: `${t}%` }} />
        ))}
        <motion.span
          className="absolute top-0.5 -ml-2 h-6 w-4 rounded-sm bg-primary shadow"
          animate={{ left: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        />
      </div>
      <div className="num flex justify-between font-mono text-xs text-muted">
        <span>0</span>
        <span>0.25</span>
        <span>0.5</span>
        <span>0.75</span>
        <span>1</span>
      </div>
    </div>
  );
}

const BIT_CHOICES = [8, 16, 23, 32] as const;

/** Decimal fraction -> binary by repeated doubling (StepPlayer, one row per step). */
export function FractionConverter() {
  const [text, setText] = useState('0.1');
  const [n, setN] = useState<(typeof BIT_CHOICES)[number]>(16);
  const res = useMemo(() => fractionToBinary(text, n), [text, n]);

  return (
    <div className="space-y-4" data-testid="frac-converter">
      <div className="glass rounded-2xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
        <div className="flex flex-wrap items-start gap-3">
          <OperandInput
            label="เศษส่วนฐานสิบ (0 ≤ x < 1)"
            value={text}
            onChange={setText}
            error={res.ok ? null : res.error.kind}
            testId="fc-input"
            className="w-56"
            inputMode="decimal"
          />
          <fieldset className="fieldset">
            <legend className="fieldset-legend pb-1 text-sm font-semibold text-ink">
              จำนวนบิต
            </legend>
            <div className="join">
              {BIT_CHOICES.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={cn(
                    'btn join-item h-11 min-h-11',
                    n === b ? 'btn-primary' : 'bg-white/80 btn-ghost',
                  )}
                  onClick={() => setN(b)}
                  aria-pressed={n === b}
                  data-testid={`fc-bits-${b}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['0.1', '0.375', '0.625', '0.2', '0.7'].map((v) => (
            <button
              key={v}
              type="button"
              className="btn h-11 min-h-11 bg-white/80 btn-ghost font-mono ring-1 ring-line btn-sm"
              onClick={() => setText(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {res.ok && <ConversionPlayer res={res} />}
      {res.ok && <ConversionResult res={res} />}
    </div>
  );
}

type Conv = ReturnType<typeof convertFraction>;

function ConversionPlayer({ res }: { res: Conv }) {
  const steps = [
    { id: 'start', title: 'เริ่มต้น' },
    ...res.rows.map((_, i) => ({ id: `r${i}`, title: `บิตที่ ${i + 1}` })),
    { id: 'end', title: res.terminated ? 'จบพอดี' : 'ครบจำนวนบิต' },
  ];
  return (
    <StepPlayer
      steps={steps}
      label="ขั้นตอนการแปลงเศษส่วนด้วยการคูณ 2"
      minHeight="16rem"
      testId="fc-player"
      render={(i) => <ConversionScene res={res} upto={i} />}
    />
  );
}

function ConversionScene({ res, upto }: { res: Conv; upto: number }) {
  const { d } = usePlayerMotion();
  const shown = res.rows.slice(0, Math.min(upto, res.rows.length));
  const end = upto > res.rows.length;
  const recent = shown.slice(-6);
  const offset = shown.length - recent.length;
  return (
    <div className="space-y-3">
      <Box>
        <div className="flex flex-wrap gap-1" aria-label="บิตที่ได้" data-testid="fc-slots">
          <span className="self-end font-mono text-xl">0.</span>
          {Array.from({ length: res.nBits }, (_, k) => {
            const row = shown[k];
            return (
              <span
                key={k}
                className={cn(
                  'grid h-8 w-6 place-items-center rounded border-b-2 font-mono text-sm',
                  row
                    ? 'border-bit-frac bg-bit-frac/10 font-bold text-bit-frac-ink'
                    : 'border-line text-transparent',
                  k >= res.rows.length && 'hidden',
                )}
              >
                {row ? (
                  <motion.span
                    key={`b${k}`}
                    initial={{ y: -14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: d(0.3) }}
                  >
                    {row.bit}
                  </motion.span>
                ) : (
                  '0'
                )}
              </span>
            );
          })}
        </div>
        {upto === 0 && (
          <p className="mt-3 text-sm">
            เริ่มจาก <b className="num font-mono">{plain(res.input)}</b> แล้วคูณ 2 ไปทีละรอบ
          </p>
        )}
        {shown.length > 0 && (
          <table className="table mt-3 w-auto table-sm">
            <thead>
              <tr className="text-xs">
                <th>รอบ</th>
                <th>เศษ × 2</th>
                <th>ได้บิต</th>
              </tr>
            </thead>
            <tbody className="num font-mono text-sm">
              {offset > 0 && (
                <tr>
                  <td colSpan={3} className="text-xs text-muted">
                    … อีก {offset} รอบก่อนหน้า
                  </td>
                </tr>
              )}
              {recent.map((r, j) => {
                const k = offset + j;
                const last = k === shown.length - 1 && !end;
                return (
                  <motion.tr
                    key={k}
                    initial={last ? { opacity: 0, x: -8 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: d(0.25) }}
                    className={cn(last && 'bg-primary/8')}
                  >
                    <td className="text-muted">{k + 1}</td>
                    <td>
                      {plain(r.value)} × 2 = {plain(r.doubled)}
                    </td>
                    <td className="font-bold text-primary">{r.bit}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Box>
      <Explain>
        {upto === 0 && (
          <p>
            ทุกรอบคูณด้วย 2 แล้วดูส่วนจำนวนเต็ม: ได้ 1 แปลว่าบิตนั้นเป็น 1 แล้วเอาแค่ส่วนเศษไปคูณต่อ
          </p>
        )}
        {upto > 0 && !end && (
          <p>
            ได้ {plain(shown[shown.length - 1].doubled)} ส่วนจำนวนเต็มคือ{' '}
            {shown[shown.length - 1].bit} จึงได้บิตที่ {shown.length} ={' '}
            {shown[shown.length - 1].bit}
          </p>
        )}
        {end &&
          (res.terminated ? (
            <p>เศษกลายเป็น 0 แล้ว แปลงได้พอดี {res.rows.length} บิต</p>
          ) : (
            <p>ครบ {res.nBits} บิตแล้วแต่เศษยังไม่เป็น 0 จึงต้องหยุดและได้แค่ค่าประมาณ</p>
          ))}
      </Explain>
    </div>
  );
}

function ConversionResult({ res }: { res: Conv }) {
  const { repeat, bits } = res;
  return (
    <section
      className="glass-raised rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
      aria-live="polite"
      data-testid="fc-result"
    >
      <h3 className="font-display text-lg font-semibold">ผลการแปลง ({res.nBits} บิต)</h3>
      <p className="num mt-2 font-mono text-lg break-all">
        0.
        <span data-testid="fc-bits">
          {[...bits].map((b, i) => {
            const inRepeat = repeat && i + 1 >= repeat.start;
            const cycle = inRepeat ? Math.floor((i + 1 - repeat.start) / repeat.length) : -1;
            return (
              <span
                key={i}
                className={cn(
                  inRepeat && 'border-t-2 border-bit-grs',
                  cycle % 2 === 1 && 'bg-bit-grs/12',
                )}
              >
                {b}
              </span>
            );
          })}
        </span>
        {!res.terminated && '…'}
        <sub>2</sub>
      </p>
      {repeat && (
        <p className="mt-1 text-sm" data-testid="fc-repeat">
          เป็นทศนิยมฐานสองซ้ำไม่รู้จบ: ชุด{' '}
          <b className="num border-t-2 border-bit-grs font-mono">{bitsOfRepeat(res)}</b> ยาว{' '}
          {repeat.length} บิต ซ้ำตั้งแต่บิตที่ {repeat.start} (ขีดเส้นด้านบนคือส่วนที่ซ้ำ)
        </p>
      )}
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">ค่าที่ป้อน</dt>
          <dd className="num font-mono">{plain(res.input)}</dd>
        </div>
        <div>
          <dt className="text-muted">ค่าประมาณจาก {res.nBits} บิต</dt>
          <dd className="num font-mono font-semibold" data-testid="fc-approx">
            {plain(res.approx)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">ผลต่าง</dt>
          <dd className="num font-mono" data-testid="fc-error">
            {plain(res.error)}
          </dd>
        </div>
      </dl>
      {!res.terminated && (
        <p className="mt-2 text-sm text-muted">
          ที่นี่ตัดบิตที่เกินทิ้งไปเลย ส่วน IEEE 754 จะปัดเศษให้ใกล้ที่สุด ซึ่งจะได้เรียนในบทที่ 3
        </p>
      )}
    </section>
  );
}

function bitsOfRepeat(res: Conv): string {
  const r = res.repeat!;
  // the cycle may be longer than the bits shown: rebuild it from a long enough expansion
  const long = convertFraction(res.input, r.start - 1 + r.length);
  return long.bits.slice(r.start - 1, r.start - 1 + r.length);
}
