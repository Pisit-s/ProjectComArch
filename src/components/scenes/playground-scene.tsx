'use client';

import { Binary, Cpu } from 'lucide-react';
import { useState } from 'react';
import type { FpScene } from '@/lib/lesson/fp-frames';
import { type PlayState, parsePlayQuery, toPlayQuery } from '@/lib/url-state';
import { UI } from '@/content/lesson/copy';
import { FP_EXAMPLES, MAIN } from '@/content/lesson/examples';
import { sectionById } from '@/content/lesson/sections';
import { CopyLinkButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';
import { CircuitFrame, circuitSteps } from './circuit-scene';
import { type FpOpState, FpOpScene, fpSteps } from './fp-op-scene';

const DEFAULT: PlayState = { op: MAIN.op, a: MAIN.a, b: MAIN.b, step: null };

/** The query of the page when the scene first mounts (?a=&b=&op=&step=). */
function readLink(): { state: PlayState; present: boolean } {
  if (typeof window === 'undefined') return { state: DEFAULT, present: false };
  const { state, present } = parsePlayQuery(new URLSearchParams(window.location.search), DEFAULT);
  return { state, present };
}

function ResultPanel({ scene, state }: { scene: FpScene; state: FpOpState }) {
  const r = scene.result;
  const flags = [
    r.flags.inexact && 'inexact',
    r.flags.overflow && 'overflow',
    r.flags.invalid && 'invalid',
  ]
    .filter(Boolean)
    .join(' · ');
  const row = (label: string, value: string | null, cls = '', testId?: string) =>
    value === null ? null : (
      <>
        <dt className="font-sans text-sm text-muted">{label}</dt>
        <dd className={cn('break-all', cls)} data-testid={testId}>
          {value}
        </dd>
      </>
    );
  return (
    <div
      className="glass-solid space-y-3 rounded-2xl p-4 ring-1 ring-foreground/10"
      data-testid="play-result"
    >
      <dl className="num grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 font-mono">
        {row(UI.stored, r.stored ?? r.value, 'font-semibold text-primary', 'play-stored')}
        {row(UI.typed, r.typed)}
        {row(UI.diff, r.error, 'text-bit-grs-ink')}
        {row('hex', r.hex, '', 'play-hex')}
        {row(
          'flag',
          flags || null,
          r.flags.overflow || r.flags.invalid ? 'font-semibold text-error' : 'text-muted',
        )}
      </dl>
      <CopyLinkButton
        testId="play-copy"
        url={() => {
          const q = toPlayQuery({ a: state.a, b: state.b, op: state.op, step: state.step });
          return `${window.location.origin}${window.location.pathname}?${q}#playground`;
        }}
      />
    </div>
  );
}

/** Chapter 7: any A ± B, as bits or as the circuit, with a link that reopens the same step. */
export function PlaygroundScene() {
  const [link] = useState(readLink);
  const [view, setView] = useState<'bits' | 'circuit'>('bits');
  const s = link.state;
  return (
    <div className="space-y-3">
      <div className="join" role="group" aria-label={UI.sceneLabel}>
        {(
          [
            ['bits', UI.bitsView, Binary],
            ['circuit', UI.circuitView, Cpu],
          ] as const
        ).map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={cn(
              'btn join-item h-10 min-h-10 gap-1.5',
              view === v ? 'btn-primary' : 'bg-white/80',
            )}
            data-testid={`play-view-${v}`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>
      <FpOpScene
        initial={{ a: s.a, b: s.b, op: s.op }}
        initialStep={s.step}
        fromLink={link.present}
        examples={FP_EXAMPLES}
        testId="play"
        label={sectionById('playground').title}
        stepsOf={view === 'bits' ? fpSteps : circuitSteps}
        showFull={view === 'bits'}
        minHeight={view === 'bits' ? '15rem' : '30rem'}
        renderFrame={
          view === 'circuit'
            ? (scene, i) => <CircuitFrame scene={scene} index={i} testId="play" />
            : undefined
        }
        extra={(scene, state) => <ResultPanel scene={scene} state={state} />}
      />
    </div>
  );
}
