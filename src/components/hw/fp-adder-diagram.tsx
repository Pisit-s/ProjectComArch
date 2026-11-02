'use client';

import { useState } from 'react';
import { type BlockId, circuitState } from '@/lib/lesson/circuit-map';
import type { FpFrame } from '@/lib/lesson/fp-frames';
import { BLOCKS, CIRCUIT_VIEWBOX, WIRES } from '@/content/lesson/circuit';
import { VOCAB } from '@/content/lesson/vocab';
import { cn } from '@/lib/utils';
import { HwAlu, HwBox, HwMux, HwRegister, HwWire } from './primitives';

const SHAPE = { register: HwRegister, alu: HwAlu, mux: HwMux, box: HwBox } as const;

/**
 * Block diagram of the floating-point adder (Chapter 6, the playground's circuit view).
 * Which blocks and wires light up, and the values on the wires, come from circuit-map.ts.
 */
export function FpAdderDiagram({
  frame,
  summary,
  className,
  testId = 'fp-adder',
}: {
  frame: FpFrame;
  /** aria-label of the whole picture: what happens in this frame. */
  summary: string;
  className?: string;
  testId?: string;
}) {
  const st = circuitState(frame);
  const [selected, setSelected] = useState<BlockId | null>(null);
  const active = new Set(st.active);
  const lit = new Set(st.wires);
  const sel = BLOCKS.find((b) => b.id === selected);
  return (
    <div className={cn('space-y-2', className)} data-testid={testId}>
      <svg
        viewBox={`0 0 ${CIRCUIT_VIEWBOX.w} ${CIRCUIT_VIEWBOX.h}`}
        className="mx-auto block w-full max-w-[26rem]"
        role="img"
        aria-label={summary}
        data-active={st.active.join(' ')}
      >
        {/* inactive wires first so lit ones are drawn on top */}
        {[...WIRES]
          .sort((a, b) => Number(lit.has(a.id)) - Number(lit.has(b.id)))
          .map((w) => (
            <HwWire
              key={w.id}
              id={w.id}
              points={w.points}
              kind={w.kind}
              dashed={w.dashed}
              active={lit.has(w.id)}
              chip={st.labels[w.id]}
            />
          ))}
        {BLOCKS.map((b) => {
          const Shape = SHAPE[b.kind];
          return (
            <Shape
              key={b.id}
              id={b.id}
              x={b.x}
              y={b.y}
              w={b.w}
              h={b.h}
              label={b.label}
              active={active.has(b.id)}
              selected={selected === b.id}
              onSelect={(id) => setSelected((s) => (s === id ? null : (id as BlockId)))}
            />
          );
        })}
      </svg>
      {sel?.vocab && (
        <p
          className="rounded-lg bg-ice-100 p-2.5 text-sm leading-relaxed"
          role="status"
          data-testid={`${testId}-info`}
        >
          <b className="font-semibold">{VOCAB[sel.vocab].term}</b> {VOCAB[sel.vocab].meaning}
        </p>
      )}
    </div>
  );
}
