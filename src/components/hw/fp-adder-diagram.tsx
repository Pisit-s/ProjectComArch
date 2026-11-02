'use client';

import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { type BlockId, type WireId, circuitState } from '@/lib/lesson/circuit-map';
import type { FpFrame } from '@/lib/lesson/fp-frames';
import { BLOCKS, CIRCUIT_VIEWBOX, type CircuitBlock, WIRES } from '@/content/lesson/circuit';
import { BLOCK_DETAILS, CIRCUIT_SCOPE, type SignalRow } from '@/content/lesson/circuit-details';
import { UI } from '@/content/lesson/copy';
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
  // values on the lit wires that enter / leave the tapped block in this frame
  const io = (side: 'to' | 'from') =>
    WIRES.filter((w) => w[side] === selected && lit.has(w.id) && st.labels[w.id])
      .map((w) => st.labels[w.id])
      .join(', ');
  const inputs = io('to');
  const outputs = io('from');
  const box = useRef<HTMLDivElement>(null);

  // the floating details close with Esc or a tap anywhere outside them (a block opens its own)
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && (box.current?.contains(t) || t.closest('[data-block]'))) return;
      setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [selected]);

  return (
    <div className={cn('relative mx-auto w-full max-w-[26rem]', className)} data-testid={testId}>
      <svg
        viewBox={`0 0 ${CIRCUIT_VIEWBOX.w} ${CIRCUIT_VIEWBOX.h}`}
        className="adder-diagram mx-auto block w-full max-w-[26rem]"
        // group, not img: the blocks inside are buttons
        role="group"
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
              chipOffset={w.chipOffset}
              chipAt={w.chipAt}
              junction={w.junction}
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
      {sel && (
        <BlockPanel
          ref={box}
          style={popoverPlace(sel)}
          block={sel}
          values={st.labels}
          lit={lit}
          inputs={inputs}
          outputs={outputs}
          onClose={() => setSelected(null)}
          testId={testId}
        />
      )}
    </div>
  );
}

/**
 * For readers who want to go further: what the tapped block is, its bit-level equations, and
 * every signal in and out (with this step's value when the wire is lit). The animation above
 * stays the main explanation.
 */
/**
 * Where the floating details sit: next to the tapped block, on the side with more room, never
 * taller than that room (the stage clips anything outside it).
 */
function popoverPlace(b: CircuitBlock): CSSProperties {
  const { w: W, h: H } = CIRCUIT_VIEWBOX;
  const x = ((b.x + b.w / 2) / W) * 100;
  const below = b.y + b.h / 2 < H / 2;
  const edge = below ? ((b.y + b.h) / H) * 100 : ((H - b.y) / H) * 100;
  return {
    left: `clamp(0px, calc(${x}% - 11rem), calc(100% - 22rem))`,
    ...(below ? { top: `calc(${edge}% + 6px)` } : { bottom: `calc(${edge}% + 6px)` }),
    maxHeight: `calc(${100 - edge}% - 12px)`,
  };
}

function BlockPanel({
  ref,
  style,
  block,
  values,
  lit,
  inputs,
  outputs,
  onClose,
  testId,
}: {
  ref: React.Ref<HTMLDivElement>;
  style: CSSProperties;
  block: CircuitBlock;
  values: Partial<Record<WireId, string>>;
  lit: Set<WireId>;
  inputs: string;
  outputs: string;
  onClose: () => void;
  testId: string;
}) {
  const d = BLOCK_DETAILS[block.id];
  const rows = (title: string, list: SignalRow[]) =>
    list.length > 0 && (
      <div>
        <p className="mb-1 text-xs font-semibold text-muted">{title}</p>
        <table className="w-full text-left text-xs">
          <tbody>
            {list.map((r) => {
              const v = r.wire && lit.has(r.wire) ? values[r.wire] : undefined;
              return (
                <tr key={r.name} className="border-t border-line/60 align-top">
                  <td className="num py-1 pr-2 font-mono font-semibold whitespace-nowrap">
                    {r.name}
                  </td>
                  <td className="num py-1 pr-2 whitespace-nowrap text-muted">
                    {r.bits} {UI.bitsUnit}
                  </td>
                  <td className="py-1 pr-2">{r.peer}</td>
                  <td className="num py-1 text-right font-mono font-bold text-primary">
                    {v ?? ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  return (
    <motion.section
      ref={ref}
      role="dialog"
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={style}
      className="absolute z-20 w-[min(22rem,100%)] space-y-3 overflow-y-auto rounded-xl bg-white p-3 text-sm leading-relaxed shadow-xl ring-1 ring-line"
      aria-label={block.label}
      data-testid={`${testId}-info`}
    >
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold">{block.label}</p>
          {block.vocab && <p className="text-ink/80">{VOCAB[block.vocab].meaning}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-circle h-9 min-h-9 w-9 btn-ghost btn-sm"
          aria-label={UI.close}
          data-testid={`${testId}-info-close`}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>
      {(inputs || outputs) && (
        <p className="num font-mono text-primary" data-testid={`${testId}-io`}>
          {inputs && (
            <span className="mr-3">
              <span className="font-sans text-muted">{UI.wireIn}</span> {inputs}
            </span>
          )}
          {outputs && (
            <span>
              <span className="font-sans text-muted">{UI.wireOut}</span> {outputs}
            </span>
          )}
        </p>
      )}
      <div>
        <p className="mb-1 text-xs font-semibold text-muted">{UI.detailWhat}</p>
        <p>{d.what}</p>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted">{UI.detailHow}</p>
        <pre className="num overflow-x-auto rounded-lg bg-white/80 p-2 font-mono text-xs leading-relaxed whitespace-pre-wrap ring-1 ring-line/60">
          {d.how.join('\n')}
        </pre>
      </div>
      {rows(UI.detailIn, d.inputs)}
      {rows(UI.detailOut, d.outputs)}
      {d.note && <p className="text-xs text-ink/80">{d.note}</p>}
      <p className="text-xs text-muted">{CIRCUIT_SCOPE}</p>
    </motion.section>
  );
}
