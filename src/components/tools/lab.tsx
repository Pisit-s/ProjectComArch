'use client';

import { Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { CopyLinkButton } from '@/components/ui/copy-button';
import { ALL_OP_EXAMPLES } from '@/content/examples';
import { bias, parseHex, simulate } from '@/lib/fp';
import {
  FORMATS,
  type FormatId,
  type LabState,
  defaultHex,
  parseLabQuery,
  toLabQuery,
} from '@/lib/url-state';
import { cn } from '@/lib/utils';
import { FpSimulator } from './fp-simulator';
import { Ieee754Converter } from './ieee-converter';
import { ToolBoundary } from './tool-boundary';

/** The Lab: converter + calculator; the whole state lives in the URL so it can be shared. */
export function Lab() {
  const params = useSearchParams();
  const initial = useMemo(() => parseLabQuery(params), [params]);
  const [state, setState] = useState<LabState>(initial.state);
  const stateRef = useRef(state);

  const write = (next: LabState) => {
    stateRef.current = next;
    setState(next);
    window.history.replaceState(null, '', `${window.location.pathname}?${toLabQuery(next)}`);
  };

  // first step index for ?step= (only for the state the page was opened with)
  const initialStep = useMemo(() => {
    const s = initial.state;
    if (!s.step) return 0;
    const sim = simulate(FORMATS[s.fmt], s.op, s.a, s.b);
    if (!sim.ok) return 0;
    return Math.max(
      0,
      sim.result.steps.findIndex((x) => x.id === s.step),
    );
  }, [initial]);

  const F = FORMATS[state.fmt];
  const hexBits = parseHex(F, state.hex);
  return (
    <div className="space-y-4">
      {initial.invalid.length > 0 && (
        <div role="alert" className="alert alert-warning" data-testid="lab-invalid">
          <Info className="h-5 w-5" aria-hidden />
          <span>
            ลิงก์นี้มีค่าบางอย่างไม่ถูกต้อง ({initial.invalid.join(', ')}) จึงใช้ค่าเริ่มต้นแทน
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="เครื่องมือใน Lab" className="glass tabs tabs-box bg-card">
          {(
            [
              ['calc', 'Calculator + − × ÷'],
              ['conv', 'Converter'],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={state.tab === t}
              className={cn('tab h-11', state.tab === t ? 'tab-active' : 'text-ink/80')}
              onClick={() => write({ ...stateRef.current, tab: t, step: null })}
              data-testid={`lab-tab-${t}`}
            >
              {label}
            </button>
          ))}
        </div>
        <FormatPicker
          value={state.fmt}
          onChange={(fmt) => write({ ...stateRef.current, fmt, hex: defaultHex(fmt), step: null })}
        />
        <CopyLinkButton />
      </div>
      {state.fmt !== 'b32' && (
        <p className="text-sm text-muted" data-testid="lab-format-note">
          บทเรียนใช้ Single Precision (32 บิต) · ตอนนี้กำลังดู {F.name}: Exponent {F.expBits} บิต
          (Bias {bias(F)}) · Fraction {F.fracBits} บิต · ขั้นตอนเหมือนกันทุกอย่าง ต่างแค่จำนวนบิต
        </p>
      )}
      <ToolBoundary>
        {state.tab === 'calc' ? (
          <FpSimulator
            key={state.fmt}
            fmt={F}
            ops={['+', '-', '*', '/']}
            initial={{ op: state.op, a: state.a, b: state.b }}
            initialStep={state.fmt === initial.state.fmt ? initialStep : 0}
            examples={ALL_OP_EXAMPLES}
            specials
            onChange={(s) => write({ ...stateRef.current, ...s, step: null })}
            onStepChange={(id, index) => {
              // the first step is the default and stays out of the URL
              const step = index === 0 ? null : id;
              if (stateRef.current.step !== step) write({ ...stateRef.current, step });
            }}
            testId="sim"
          />
        ) : (
          <Ieee754Converter
            key={state.fmt}
            fmt={F}
            initialMode={state.mode}
            initialInput={state.x}
            initialBits={hexBits.ok ? hexBits.bits : undefined}
            onChange={({ mode, value }) =>
              write({
                ...stateRef.current,
                mode,
                ...(mode === 'encode' ? { x: value } : { hex: value }),
              })
            }
          />
        )}
      </ToolBoundary>
    </div>
  );
}

const FORMAT_LABELS: { id: FormatId; name: string; bits: string }[] = [
  { id: 'b16', name: 'Half', bits: '16' },
  { id: 'b32', name: 'Single', bits: '32' },
  { id: 'b64', name: 'Double', bits: '64' },
];

function FormatPicker({ value, onChange }: { value: FormatId; onChange: (f: FormatId) => void }) {
  return (
    <div className="join" role="group" aria-label="ขนาดของ Floating-Point">
      {FORMAT_LABELS.map((f) => (
        <button
          key={f.id}
          type="button"
          className={cn(
            'btn join-item h-11 min-h-11 px-3',
            value === f.id ? 'btn-primary' : 'bg-white/80 btn-ghost text-ink/80',
          )}
          aria-pressed={value === f.id}
          onClick={() => onChange(f.id)}
          data-testid={`lab-fmt-${f.id}`}
        >
          {f.name} <span className="num font-mono text-xs opacity-80">{f.bits} บิต</span>
        </button>
      ))}
    </div>
  );
}
