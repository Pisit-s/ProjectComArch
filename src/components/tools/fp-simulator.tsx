'use client';

import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Register } from '@/components/bits/register';
import { FieldLegend } from '@/components/bits/field-legend';
import { StepPlayer } from '@/components/player/step-player';
import { Num } from '@/components/ui/num';
import { StepView } from '@/components/viz/step-view';
import { type OpExample, SPECIAL_OPERANDS } from '@/content/examples';
import { OP_NAME, OP_SYMBOL, flowFor, toPlayerSteps } from '@/content/step-text';
import { fmt } from '@/lib/display';
import { BINARY32, type Op, simulate } from '@/lib/fp';
import { cn } from '@/lib/utils';
import { OperandInput } from './operand-input';
import { ResultCompare } from './result-compare';

export interface SimState {
  op: Op;
  a: string;
  b: string;
}

type Props = {
  ops: Op[];
  initial: SimState;
  examples: OpExample[];
  /** Offer 0, −0, ∞, −∞, NaN as operand quick picks. */
  specials?: boolean;
  initialStep?: number;
  onChange?: (s: SimState) => void;
  onStepChange?: (stepId: string, index: number) => void;
  testId?: string;
};

/**
 * One simulator for Chapter 4 (+ −), Chapter 5 (× ÷) and the Lab. Both operands are stored as
 * binary32 first; the engine then works on the stored bits and the player shows every step.
 */
export function FpSimulator({
  ops,
  initial,
  examples,
  specials = false,
  initialStep = 0,
  onChange,
  onStepChange,
  testId = 'sim',
}: Props) {
  const [state, setState] = useState<SimState>(initial);
  const [target, setTarget] = useState<'a' | 'b'>('a');
  const sim = useMemo(() => simulate(BINARY32, state.op, state.a, state.b), [state]);
  const update = (patch: Partial<SimState>) => {
    const next = { ...state, ...patch };
    setState(next);
    onChange?.(next);
  };

  const steps = useMemo(() => (sim.ok ? sim.result.steps : []), [sim]);
  const playerSteps = useMemo(() => toPlayerSteps(steps, state.op), [steps, state.op]);
  const expression = `${state.a} ${OP_SYMBOL[state.op]} ${state.b}`;

  return (
    <div className="space-y-4" data-testid={testId}>
      <div className="glass rounded-2xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
        {ops.length > 1 && (
          <div
            role="tablist"
            aria-label="เลือกการดำเนินการ"
            className="tabs tabs-box mb-3 w-fit bg-ice-100"
          >
            {ops.map((o) => (
              <button
                key={o}
                type="button"
                role="tab"
                aria-selected={state.op === o}
                className={cn(
                  'tab h-11 min-w-14 text-lg font-semibold',
                  state.op === o ? 'tab-active' : 'text-ink/80',
                )}
                onClick={() => update({ op: o })}
                data-testid={`${testId}-op-${o === '*' ? 'mul' : o === '/' ? 'div' : o === '+' ? 'add' : 'sub'}`}
                aria-label={OP_NAME[o]}
              >
                {OP_SYMBOL[o]}
              </button>
            ))}
          </div>
        )}
        <div className="grid items-start gap-x-3 sm:grid-cols-[1fr_auto_1fr]">
          <OperandInput
            label="A"
            value={state.a}
            onChange={(a) => update({ a })}
            error={sim.ok ? null : sim.errorA?.kind}
            testId={`${testId}-a`}
          />
          <span
            className="hidden pt-10 text-center font-mono text-2xl font-bold text-primary sm:block"
            aria-hidden
          >
            {OP_SYMBOL[state.op]}
          </span>
          <OperandInput
            label="B"
            value={state.b}
            onChange={(b) => update({ b })}
            error={sim.ok ? null : sim.errorB?.kind}
            testId={`${testId}-b`}
          />
        </div>
        <p className="mt-1 text-xs text-muted">
          พิมพ์ทศนิยมหรือ scientific notation เช่น 0.1, -6.5, 1e-8 หรือ inf, nan ·
          ใช้จุดเป็นจุดทศนิยม
        </p>
        {examples.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-sm font-semibold">ตัวอย่าง</p>
            <ul className="flex flex-wrap gap-1.5" data-testid={`${testId}-examples`}>
              {examples.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    className="btn h-11 min-h-11 bg-white/80 btn-ghost font-mono font-normal ring-1 ring-line btn-sm"
                    onClick={() => update({ op: ex.op, a: ex.a, b: ex.b })}
                    title={ex.note}
                    data-testid={`example-${ex.id}`}
                  >
                    <span className="font-sans text-xs text-muted">{ex.id}</span> {ex.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {specials && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-sm font-semibold">ค่าพิเศษ ใส่ที่</span>
            <div className="join">
              {(['a', 'b'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={cn(
                    'btn join-item h-11 min-h-11 btn-sm',
                    target === t ? 'btn-primary' : 'bg-white/80 btn-ghost',
                  )}
                  onClick={() => setTarget(t)}
                  aria-pressed={target === t}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            {SPECIAL_OPERANDS.map((s) => (
              <button
                key={s.value}
                type="button"
                className="btn h-11 min-h-11 min-w-11 bg-white/80 btn-ghost font-mono ring-1 ring-line btn-sm"
                onClick={() => update({ [target]: s.value })}
                data-testid={`special-${s.value}`}
                aria-label={`ใส่ ${s.label} ที่ ${target.toUpperCase()}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {sim.ok ? (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            {(['a', 'b'] as const).map((k) => {
              const e = sim[k];
              return (
                <div key={k} className="space-y-1.5">
                  <Register
                    bits={e.bits}
                    label={`${k.toUpperCase()} = ${state[k]}`}
                    name={`${testId}-reg-${k}`}
                  />
                  {!e.equal && e.stored && (
                    <p
                      className="flex gap-1.5 text-sm text-warning"
                      data-testid={`${testId}-${k}-inexact`}
                    >
                      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span>
                        เก็บได้ไม่พอดี ค่าที่เก็บจริงคือ <Num value={fmt(e.stored, 20)} />
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <FieldLegend fields={['sign', 'exp', 'frac', 'hidden', 'grs']} />
          <StepPlayer
            steps={playerSteps}
            flow={flowFor(state.op)}
            label={`ขั้นตอนการ${OP_NAME[state.op]} ${expression}`}
            initialStep={initialStep}
            onStepChange={(i) => onStepChange?.(steps[i]?.id ?? '', i)}
            minHeight="18rem"
            testId={`${testId}-player`}
            render={(i) => <StepView step={steps[i]} op={state.op} />}
          />
          <ResultCompare
            typed={sim.typed}
            exactStored={sim.result.exact}
            result={sim.result}
            error={sim.error}
            expression={expression}
          />
        </>
      ) : (
        <div role="alert" className="alert alert-warning">
          <Info className="h-5 w-5" aria-hidden />
          <span>แก้ค่าที่ป้อนให้ถูกรูปแบบก่อน แล้วขั้นตอนการคำนวณจะแสดงที่นี่</span>
        </div>
      )}
    </div>
  );
}
