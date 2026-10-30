'use client';

import { Info, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FieldLegend } from '@/components/bits/field-legend';
import { Register } from '@/components/bits/register';
import { StepPlayer } from '@/components/player/step-player';
import { Num } from '@/components/ui/num';
import { StepView } from '@/components/viz/step-view';
import { DECODE_EXAMPLES, ENCODE_EXAMPLES, ENCODER_PICKS } from '@/content/examples';
import { CLASS_TEXT, FLOWS, toPlayerSteps } from '@/content/step-text';
import { fmt } from '@/lib/display';
import {
  BINARY32,
  type BitParseError,
  decodeWithSteps,
  encodeBits,
  encodeDecimal,
  exactDecimal,
  parseBitString,
  parseHex,
  shortestDecimal,
  toBinaryString,
  toHex,
} from '@/lib/fp';
import { cn } from '@/lib/utils';
import { OperandInput } from './operand-input';

const F = BINARY32;
const MAX_FINITE = encodeBits(F, '3.4028235e38')!;

export type ConverterMode = 'encode' | 'decode';

export function Ieee754Converter({
  initialMode = 'encode',
  initialInput = '5.75',
  initialBits,
  onChange,
  testId = 'conv',
}: {
  initialMode?: ConverterMode;
  initialInput?: string;
  initialBits?: bigint;
  onChange?: (s: { mode: ConverterMode; value: string }) => void;
  testId?: string;
}) {
  const [mode, setMode] = useState<ConverterMode>(initialMode);
  const [encodeText, setEncodeText] = useState(initialInput);
  const [bits, setBits] = useState<bigint>(initialBits ?? encodeBits(F, '0.15625')!);
  const report = (m: ConverterMode, value: string) => onChange?.({ mode: m, value });

  return (
    <div className="space-y-4" data-testid={testId}>
      <div
        role="tablist"
        aria-label="โหมดของเครื่องมือ"
        className="glass tabs tabs-box w-fit bg-card"
      >
        {(
          [
            ['encode', 'ฐานสิบ → IEEE 754'],
            ['decode', 'IEEE 754 → ฐานสิบ'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={cn('tab h-11', mode === m && 'tab-active')}
            onClick={() => {
              setMode(m);
              report(m, m === 'encode' ? encodeText : toHex(bits, 32).slice(2));
            }}
            data-testid={`${testId}-tab-${m}`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === 'encode' ? (
        <EncodePanel
          text={encodeText}
          onText={(t) => {
            setEncodeText(t);
            report('encode', t);
          }}
          testId={testId}
        />
      ) : (
        <DecodePanel
          bits={bits}
          onBits={(b) => {
            setBits(b);
            report('decode', toHex(b, 32).slice(2));
          }}
          testId={testId}
        />
      )}
      <p className="text-sm text-muted">
        ข้อจำกัด: เครื่องมือนี้ใช้ Single Precision (32 บิต) และปัดแบบ round to nearest, ties to
        even เท่านั้น · รับทศนิยม, scientific notation (เช่น 1.5e-7), inf และ nan · ไม่เกิน 200
        ตัวอักษร
      </p>
    </div>
  );
}

function EncodePanel({
  text,
  onText,
  testId,
}: {
  text: string;
  onText: (t: string) => void;
  testId: string;
}) {
  const r = useMemo(() => encodeDecimal(F, text), [text]);
  const steps = useMemo(() => (r.ok ? r.steps : []), [r]);
  const playerSteps = useMemo(() => toPlayerSteps(steps), [steps]);
  const range = steps.find((s) => s.kind === 'range');
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
        <OperandInput
          label="เลขฐานสิบ"
          value={text}
          onChange={onText}
          error={r.ok ? null : r.error.kind}
          testId={`${testId}-input`}
          className="max-w-sm"
        />
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {ENCODE_EXAMPLES.filter((e) => ENCODER_PICKS.includes(e.id)).map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="btn h-11 min-h-11 bg-white/80 btn-ghost font-mono font-normal ring-1 ring-line btn-sm"
                onClick={() => onText(e.input)}
                title={e.note}
              >
                {e.input}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {r.ok && (
        <>
          <Register bits={r.bits} label={`ผลลัพธ์ของ ${text.trim()}`} name={`${testId}-result`} />
          <div className="space-y-2" aria-live="polite">
            {range?.kind === 'range' && range.outcome === 'overflow' && (
              <div role="alert" className="alert alert-warning" data-testid={`${testId}-overflow`}>
                <TriangleAlert className="h-5 w-5" aria-hidden />
                <span>
                  ค่านี้ใหญ่เกินกว่าที่ Single Precision เก็บได้ (ค่าจำกัดที่มากที่สุดประมาณ{' '}
                  <Num value={shortestDecimal(F, MAX_FINITE)} />) จึงกลายเป็น ∞
                </span>
              </div>
            )}
            {range?.kind === 'range' && range.outcome === 'underflow-subnormal' && (
              <div className="alert alert-info">
                <Info className="h-5 w-5" aria-hidden />
                <span>
                  ค่านี้เล็กมาก (น้อยกว่า 2⁻¹²⁶) จึงเก็บแบบ Subnormal ซึ่งมีความละเอียดน้อยลง
                </span>
              </div>
            )}
            {range?.kind === 'range' && range.outcome === 'underflow-zero' && (
              <div className="alert alert-warning">
                <TriangleAlert className="h-5 w-5" aria-hidden />
                <span>ค่านี้เล็กเกินกว่าค่าที่เล็กที่สุดที่เก็บได้ จึงกลายเป็น 0</span>
              </div>
            )}
            {r.input.kind !== 'finite' && (
              <div className="alert alert-info">
                <Info className="h-5 w-5" aria-hidden />
                <span>
                  {r.input.kind === 'nan' ? 'NaN' : '∞'} เป็นค่าพิเศษของ IEEE 754 มีรูปแบบบิตเฉพาะ
                  (Exponent เป็น 1 ทั้งหมด)
                </span>
              </div>
            )}
            {!r.equal && r.stored && r.error && (
              <div
                role="status"
                className="alert items-start alert-warning"
                data-testid={`${testId}-inexact`}
              >
                <TriangleAlert className="h-5 w-5" aria-hidden />
                <div className="min-w-0 space-y-1 text-sm">
                  <p className="font-semibold">ค่าที่เก็บจริงไม่เท่ากับค่าที่ป้อน (ต้องปัดเศษ)</p>
                  <p className="break-all">
                    เก็บจริง: <Num value={exactDecimal(F, r.bits)} />
                  </p>
                  <p className="break-all">
                    ผลต่าง (ค่าที่เก็บ − ค่าที่ป้อน): <Num value={fmt(r.error, 12)} />
                  </p>
                </div>
              </div>
            )}
            {r.equal && r.stored && r.input.kind === 'finite' && (
              <p className="text-sm text-success" data-testid={`${testId}-exact`}>
                เก็บได้พอดี ไม่ต้องปัดเศษ
              </p>
            )}
          </div>
          <FieldLegend fields={['sign', 'exp', 'frac', 'hidden', 'grs']} />
          <StepPlayer
            steps={playerSteps}
            flow={FLOWS.encode}
            label={`ขั้นตอนการแปลง ${text.trim()} เป็น IEEE 754`}
            minHeight="18rem"
            testId={`${testId}-player`}
            render={(i) => <StepView step={steps[i]} />}
          />
        </>
      )}
    </div>
  );
}

const BITS_MSG = (e: BitParseError): string => {
  if (e.kind === 'empty') return 'bits-empty';
  if (e.kind === 'invalid-char') return 'bits-char';
  return `ต้องมีครบ 32 บิต แต่ตอนนี้มี ${e.got} บิต`;
};
const HEX_MSG = (e: BitParseError): string => {
  if (e.kind === 'empty') return 'empty';
  if (e.kind === 'invalid-char') return 'hex-char';
  return `ต้องมี 8 หลักพอดี แต่ตอนนี้มี ${e.got} หลัก`;
};

function DecodePanel({
  bits,
  onBits,
  testId,
}: {
  bits: bigint;
  onBits: (b: bigint) => void;
  testId: string;
}) {
  const [bitText, setBitText] = useState(toBinaryString(bits, 32));
  const [hexText, setHexText] = useState(toHex(bits, 32).slice(2));
  const [bitErr, setBitErr] = useState<string | null>(null);
  const [hexErr, setHexErr] = useState<string | null>(null);
  const d = useMemo(() => decodeWithSteps(F, bits), [bits]);
  const playerSteps = useMemo(() => toPlayerSteps(d.steps), [d]);

  const apply = (b: bigint, from: 'bits' | 'hex' | 'toggle') => {
    onBits(b);
    if (from !== 'bits') setBitText(toBinaryString(b, 32));
    if (from !== 'hex') setHexText(toHex(b, 32).slice(2));
    setBitErr(null);
    setHexErr(null);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
        <p className="mb-2 text-sm">กดที่บิตเพื่อสลับ 0/1 หรือพิมพ์บิต/hex ด้านล่าง</p>
        <Register
          bits={bits}
          mode="edit"
          onToggle={(i) => apply(bits ^ (1n << BigInt(31 - i)), 'toggle')}
          name={`${testId}-edit`}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <OperandInput
            label="บิต 32 ตัว (เว้นวรรคหรือขีดคั่นได้)"
            value={bitText}
            onChange={(v) => {
              setBitText(v);
              const r = parseBitString(F, v);
              if (r.ok) apply(r.bits, 'bits');
              else setBitErr(BITS_MSG(r.error));
            }}
            error={bitErr}
            testId={`${testId}-bits`}
          />
          <OperandInput
            label="หรือ hex 8 หลัก"
            value={hexText}
            onChange={(v) => {
              setHexText(v);
              const r = parseHex(F, v);
              if (r.ok) apply(r.bits, 'hex');
              else setHexErr(HEX_MSG(r.error));
            }}
            error={hexErr}
            testId={`${testId}-hex`}
          />
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {DECODE_EXAMPLES.map((e) => {
            const b = encodeBits(F, e.source)!;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  className="btn h-11 min-h-11 bg-white/80 btn-ghost font-mono font-normal ring-1 ring-line btn-sm"
                  onClick={() => apply(b, 'toggle')}
                  title={e.note}
                >
                  {toHex(b, 32)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-lg" aria-live="polite">
        ค่าที่ถอดได้ ({CLASS_TEXT[d.cls]}):{' '}
        <b data-testid={`${testId}-decoded`}>
          <Num value={exactDecimal(F, bits)} />
        </b>
      </p>
      <StepPlayer
        steps={playerSteps}
        flow={FLOWS.decode}
        label="ขั้นตอนการถอดรหัส IEEE 754"
        minHeight="14rem"
        testId={`${testId}-dplayer`}
        render={(i) => <StepView step={d.steps[i]} bits={bits} />}
      />
    </div>
  );
}
