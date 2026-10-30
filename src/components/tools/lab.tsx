'use client';

import { Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { CopyLinkButton } from '@/components/ui/copy-button';
import { ALL_OP_EXAMPLES } from '@/content/examples';
import { BINARY32, parseHex, simulate } from '@/lib/fp';
import { type LabState, parseLabQuery, toLabQuery } from '@/lib/url-state';
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
    const sim = simulate(BINARY32, s.op, s.a, s.b);
    if (!sim.ok) return 0;
    return Math.max(
      0,
      sim.result.steps.findIndex((x) => x.id === s.step),
    );
  }, [initial]);

  const hexBits = parseHex(BINARY32, state.hex);
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
        <CopyLinkButton />
      </div>
      <ToolBoundary>
        {state.tab === 'calc' ? (
          <FpSimulator
            ops={['+', '-', '*', '/']}
            initial={{ op: state.op, a: state.a, b: state.b }}
            initialStep={initialStep}
            examples={ALL_OP_EXAMPLES}
            specials
            onChange={(s) => write({ ...stateRef.current, ...s, step: null })}
            onStepChange={(id) => {
              if (stateRef.current.step !== id) write({ ...stateRef.current, step: id });
            }}
            testId="sim"
          />
        ) : (
          <Ieee754Converter
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
