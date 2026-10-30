'use client';

import { motion } from 'motion/react';
import { type KeyboardEvent, useMemo, useRef, useState } from 'react';
import { BitCell } from '@/components/bits/bit-cell';
import { usePlayerMotion } from '@/components/player/player-speed';
import { StepPlayer } from '@/components/player/step-player';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Base, Pow } from '@/components/ui/num';
import { Box, Explain } from '@/components/viz/step-parts';
import { parseUint, uintMax, uintSteps, uintTerms, uintToBits, uintValue } from '@/lib/fp';
import { cn } from '@/lib/utils';
import { OperandInput } from './operand-input';

/** 345 = 3 x 100 + 4 x 10 + 5 x 1, one place at a time. */
export function PlaceValueDemo() {
  const digits = [
    { d: 3, w: 100, name: 'หลักร้อย' },
    { d: 4, w: 10, name: 'หลักสิบ' },
    { d: 5, w: 1, name: 'หลักหน่วย' },
  ];
  const steps = [
    { id: 'number', title: 'ตัวเลข 345' },
    { id: 'places', title: 'แยกลงช่องตามหลัก' },
    { id: 'weights', title: 'คูณค่าประจำหลัก' },
    { id: 'sum', title: 'รวมกัน' },
  ];
  return (
    <StepPlayer
      steps={steps}
      label="ค่าประจำหลักของ 345"
      minHeight="12rem"
      testId="place-value"
      render={(i) => <PlaceValueScene step={i} digits={digits} />}
    />
  );
}

function PlaceValueScene({
  step,
  digits,
}: {
  step: number;
  digits: { d: number; w: number; name: string }[];
}) {
  const { d } = usePlayerMotion();
  return (
    <div className="space-y-3">
      <Box>
        <div className="grid grid-cols-3 gap-2 text-center">
          {digits.map((x, i) => (
            <motion.div
              key={x.w}
              initial={{ y: step >= 1 ? -16 : 0, opacity: step >= 1 ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: d(0.15 * i), duration: d(0.3) }}
              className={cn('rounded-lg p-2', step >= 1 && 'bg-ice-100 ring-1 ring-line')}
            >
              {step >= 1 && <p className="text-xs text-muted">{x.name}</p>}
              <p className="num font-mono text-3xl font-bold">{x.d}</p>
              {step >= 2 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: d(0.2 + 0.15 * i) }}
                  className="num font-mono text-sm"
                >
                  × {x.w} = <b>{x.d * x.w}</b>
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
        {step >= 3 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.3) }}
            className="num mt-3 text-center font-mono text-lg"
          >
            300 + 40 + 5 = <b>345</b>
          </motion.p>
        )}
      </Box>
      <Explain>
        {step === 0 && <p>เลข 345 ที่เราเขียนกันทุกวัน แต่ละหลักมีความหมายไม่เท่ากัน</p>}
        {step === 1 && <p>ตำแหน่งของหลักบอกค่าประจำหลัก: หน่วย สิบ ร้อย</p>}
        {step === 2 && (
          <p>
            ค่าประจำหลักคือ 10 ยกกำลังตำแหน่ง: <Pow base="10" exp={2} />, <Pow base="10" exp={1} />,{' '}
            <Pow base="10" exp={0} /> เอาตัวเลขในหลักคูณกับค่าประจำหลัก
          </p>
        )}
        {step === 3 && (
          <p>
            รวมทุกหลักได้ค่าของตัวเลข ระบบนี้เรียกว่าระบบเลขฐานสิบ (Base 10) เพราะแต่ละหลักมีได้ 10
            แบบ (0–9)
          </p>
        )}
      </Explain>
    </div>
  );
}

/** 1011₂ = 8 + 2 + 1 = 11, adding one 1-bit per step. */
export function BinaryToDecimalDemo({ bits = '1011' }: { bits?: string }) {
  const data = useMemo(() => uintSteps(bits), [bits]);
  const terms = uintTerms(bits);
  const steps = data.map((s, i) => ({
    id: `s${i}`,
    title: s.current ? `บิตน้ำหนัก ${s.current.weight}` : 'เขียนน้ำหนักใต้แต่ละบิต',
  }));
  steps.push({ id: 'done', title: 'ค่าฐานสิบ' });
  return (
    <StepPlayer
      steps={steps}
      label={`แปลง ${bits} ฐานสองเป็นฐานสิบ`}
      minHeight="11rem"
      testId="b2d"
      render={(i) => {
        const s = data[Math.min(i, data.length - 1)];
        const done = i >= data.length;
        return (
          <div className="space-y-3">
            <Box>
              <div className="flex flex-wrap justify-center gap-2">
                {terms.map((t) => {
                  const active = s.current?.position === t.position;
                  const used = s.terms.some((x) => x.position === t.position);
                  return (
                    <div key={t.position} className="flex flex-col items-center gap-1">
                      <span className="num font-mono text-xs text-muted">
                        <Pow exp={t.position} /> = {t.weight}
                      </span>
                      <BitCell bit={t.bit} field="plain" size="lg" changed={active} />
                      <span
                        className={cn(
                          'num font-mono text-sm',
                          used ? 'font-bold text-primary' : 'text-muted/60',
                        )}
                      >
                        {t.bit ? `+${t.weight}` : '0'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="num mt-3 text-center font-mono text-lg">
                {s.terms.length === 0 ? '0' : s.terms.map((t) => t.weight).join(' + ')} ={' '}
                <b className="text-primary">
                  <AnimatedNumber value={s.sum} />
                </b>
              </p>
            </Box>
            <Explain>
              {i === 0 && (
                <p>ใต้แต่ละบิตเขียนน้ำหนัก (2 ยกกำลังตำแหน่ง นับจากขวาสุดเป็นตำแหน่งที่ 0)</p>
              )}
              {s.current && !done && (
                <p>
                  บิตตำแหน่ง {s.current.position} เป็น 1 จึงบวกน้ำหนัก {s.current.weight} เข้าไป
                  (บิตที่เป็น 0 ไม่เพิ่มค่า)
                </p>
              )}
              {done && (
                <p>
                  <Base>{bits}</Base> = <b>{s.sum}</b>
                  <sub>10</sub> · คือผลรวมน้ำหนักของบิตที่เป็น 1 ทุกตัว
                </p>
              )}
            </Explain>
          </div>
        );
      }}
    />
  );
}

const PRESETS = [0, 10, 128, 255];

/** 8-bit unsigned explorer: toggle bits, see weights, contributions and the decimal value at once. */
export function IntegerExplorer() {
  const [bits, setBits] = useState('00001011');
  const [text, setText] = useState('11');
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focus, setFocus] = useState(0);
  const terms = uintTerms(bits);
  const value = uintValue(bits);

  const setAll = (b: string) => {
    setBits(b);
    setText(String(uintValue(b)));
    setError(null);
  };
  const toggle = (i: number) =>
    setAll(bits.slice(0, i) + (bits[i] === '1' ? '0' : '1') + bits.slice(i + 1));

  const onKey = (e: KeyboardEvent, i: number) => {
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (next === null || next < 0 || next > 7) return;
    e.preventDefault();
    setFocus(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="space-y-4" data-testid="int-explorer">
      <div className="glass-solid rounded-xl p-3 ring-1 ring-foreground/10 sm:p-4">
        <div
          className="grid grid-cols-4 gap-2 min-[420px]:grid-cols-8"
          role="group"
          aria-label="บิตทั้ง 8 บิต"
        >
          {terms.map((t, i) => (
            <div key={t.position} className="flex flex-col items-center gap-1">
              <span className="num font-mono text-xs text-muted">
                <Pow exp={t.position} />
              </span>
              <span className="num font-mono text-xs text-muted">{t.weight}</span>
              <BitCell
                ref={(el) => {
                  refs.current[i] = el;
                }}
                bit={t.bit}
                field="plain"
                size="lg"
                tabIndex={i === focus ? 0 : -1}
                onFocus={() => setFocus(i)}
                onKeyDown={(e) => onKey(e, i)}
                onClick={() => toggle(i)}
                aria-pressed={t.bit === 1}
                aria-label={`บิตตำแหน่ง ${t.position} น้ำหนัก ${t.weight} ค่า ${t.bit}`}
                data-testid={`int-bit-${i}`}
              />
              <span
                className={cn(
                  'num font-mono text-sm',
                  t.bit ? 'font-bold text-primary' : 'text-muted/60',
                )}
                aria-label={`เพิ่มค่า ${t.contribution}`}
              >
                +{t.contribution}
              </span>
            </div>
          ))}
        </div>
        <div
          className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-3"
          aria-live="polite"
        >
          <span className="num font-mono text-lg" data-testid="int-binary">
            {bits}
            <sub>2</sub>
          </span>
          <span className="text-lg">
            ={' '}
            <b className="num font-mono text-3xl text-primary" data-testid="int-decimal">
              <AnimatedNumber value={value} duration={0.3} />
            </b>
            <sub>10</sub>
          </span>
        </div>
        <p className="num mt-1 font-mono text-sm break-words text-muted">
          {terms
            .filter((t) => t.bit)
            .map((t) => t.weight)
            .join(' + ') || '0'}{' '}
          = {value}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1 text-sm font-semibold">ค่าตั้งต้น</p>
          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className="btn h-11 min-h-11 min-w-12 bg-white/80 btn-ghost font-mono ring-1 ring-line btn-sm"
                onClick={() => setAll(uintToBits(p))}
                data-testid={`int-preset-${p}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <OperandInput
          label="หรือพิมพ์ฐานสิบ (0–255)"
          value={text}
          inputMode="decimal"
          className="w-48"
          onChange={(v) => {
            setText(v);
            const r = parseUint(v);
            if (r.ok) {
              setBits(uintToBits(r.value));
              setError(null);
            } else
              setError(
                r.error === 'range' ? 'uint-range' : r.error === 'empty' ? 'empty' : 'uint-invalid',
              );
          }}
          error={error}
          testId="int-input"
        />
      </div>
      <p className="text-sm text-muted">
        8 บิตมีได้ <Pow exp={8} /> = 256 แบบ ค่าน้อยสุด 0 (ทุกบิตเป็น 0) ค่ามากสุด {uintMax()}{' '}
        (ทุกบิตเป็น 1)
      </p>
    </div>
  );
}
