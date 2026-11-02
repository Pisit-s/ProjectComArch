'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** What a wire carries; sets its colour. */
export type WireKind = 'exp' | 'sig' | 'sign' | 'ctl';

const WIRE_CLASS: Record<WireKind, string> = {
  exp: 'stroke-bit-exp',
  sig: 'stroke-bit-frac',
  sign: 'stroke-bit-sign',
  ctl: 'stroke-carry',
};

const CHIP_CLASS: Record<WireKind, string> = {
  exp: 'fill-bit-exp-ink',
  sig: 'fill-bit-frac-ink',
  sign: 'fill-bit-sign-ink',
  ctl: 'fill-carry-ink',
};

interface BoxProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** aria-label: block name + what it does in this frame. */
  ariaLabel?: string;
  active?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

/** Focusable SVG group that acts like a button. */
function Pressable({
  id,
  ariaLabel,
  label,
  active,
  selected,
  onSelect,
  children,
}: Pick<BoxProps, 'id' | 'ariaLabel' | 'label' | 'active' | 'selected' | 'onSelect'> & {
  children: ReactNode;
}) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(id);
    }
  };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={ariaLabel ?? label}
      aria-pressed={selected}
      data-block={id}
      data-active={active ? 'true' : 'false'}
      onClick={() => onSelect?.(id)}
      onKeyDown={onKey}
      className="cursor-pointer outline-none [&:focus-visible>.hw-shape]:stroke-primary [&:focus-visible>.hw-shape]:stroke-[3.5]"
    >
      {children}
    </g>
  );
}

const shapeClass = (active?: boolean, selected?: boolean) =>
  cn(
    'hw-shape transition-colors duration-300',
    active ? 'fill-sky-200 stroke-primary' : 'fill-white stroke-line',
    selected && 'stroke-navy-900',
  );

const Label = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    dominantBaseline="middle"
    className="pointer-events-none fill-ink font-sans text-[11px] font-semibold"
  >
    {children}
  </text>
);

/** Register with three fields: s | exponent | significand. */
export function HwRegister(props: BoxProps) {
  const { x, y, w, h, label, active, selected } = props;
  const s = w * 0.1;
  const e = w * 0.3;
  return (
    <Pressable {...props}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        strokeWidth={2}
        className={shapeClass(active, selected)}
      />
      <rect x={x + 2} y={y + 2} width={s - 2} height={h - 4} rx={2} className="fill-bit-sign/25" />
      <rect
        x={x + s + 1}
        y={y + 2}
        width={e - 2}
        height={h - 4}
        rx={2}
        className="fill-bit-exp/20"
      />
      <rect
        x={x + s + e}
        y={y + 2}
        width={w - s - e - 2}
        height={h - 4}
        rx={2}
        className="fill-bit-frac/15"
      />
      <Label x={x + s + e + (w - s - e) / 2} y={y + h / 2}>
        {label}
      </Label>
    </Pressable>
  );
}

/** ALU drawn as a trapezoid with the notch at the bottom. */
export function HwAlu(props: BoxProps) {
  const { x, y, w, h, label, active, selected } = props;
  const n = w * 0.14;
  const d = `M${x} ${y} H${x + w} L${x + w - n} ${y + h} H${x + w / 2 + n / 2} L${x + w / 2} ${y + h - n * 0.7} L${x + w / 2 - n / 2} ${y + h} H${x + n} Z`;
  return (
    <Pressable {...props}>
      <path d={d} strokeWidth={2} strokeLinejoin="round" className={shapeClass(active, selected)} />
      <Label x={x + w / 2} y={y + h * 0.42}>
        {label}
      </Label>
    </Pressable>
  );
}

/** Multiplexer as a capsule; the select line comes in from the side. */
export function HwMux(props: BoxProps) {
  const { x, y, w, h, label, active, selected } = props;
  return (
    <Pressable {...props}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={Math.min(w, h) / 2}
        strokeWidth={2}
        className={shapeClass(active, selected)}
      />
      <Label x={x + w / 2} y={y + h / 2}>
        {label}
      </Label>
    </Pressable>
  );
}

/** Plain block: Shift right, Normalize, Inc/Dec, Round, Control. */
export function HwBox(props: BoxProps) {
  const { x, y, w, h, label, active, selected } = props;
  return (
    <Pressable {...props}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        strokeWidth={2}
        className={shapeClass(active, selected)}
      />
      <Label x={x + w / 2} y={y + h / 2}>
        {label}
      </Label>
    </Pressable>
  );
}

/** Wire through the given points with an arrow head; active wires get a running dash. */
export function HwWire({
  id,
  points,
  kind,
  active = false,
  dashed = false,
  chip,
}: {
  id: string;
  points: [number, number][];
  kind: WireKind;
  active?: boolean;
  /** Feedback path (the rounding carry going back to Normalize). */
  dashed?: boolean;
  /** Value shown on the wire (from the frame). */
  chip?: string;
}) {
  const reduce = useReducedMotion();
  const d = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px} ${py}`).join(' ');
  const [ex, ey] = points.at(-1)!;
  const [px, py] = points.at(-2) ?? points[0];
  const ang = Math.atan2(ey - py, ex - px);
  const head = (a: number) => `${ex - 7 * Math.cos(ang + a)} ${ey - 7 * Math.sin(ang + a)}`;
  // chip sits halfway along the middle segment, never on a block it points into
  const k = Math.max(1, Math.floor(points.length / 2));
  const mid = [(points[k - 1][0] + points[k][0]) / 2, (points[k - 1][1] + points[k][1]) / 2];
  return (
    <g data-wire={id} data-active={active ? 'true' : 'false'} aria-hidden>
      <path
        d={d}
        fill="none"
        strokeWidth={active ? 3 : 1.6}
        strokeLinejoin="round"
        strokeDasharray={dashed ? '6 5' : undefined}
        className={cn(WIRE_CLASS[kind], 'transition-opacity duration-300', !active && 'opacity-35')}
      />
      {active && !reduce && (
        <motion.path
          d={d}
          fill="none"
          strokeWidth={3}
          strokeDasharray="4 10"
          className="stroke-white/90"
          initial={{ strokeDashoffset: 14 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
        />
      )}
      <path
        d={`M${head(0.5)} L${ex} ${ey} L${head(-0.5)}`}
        fill="none"
        strokeWidth={active ? 3 : 1.6}
        strokeLinecap="round"
        className={cn(WIRE_CLASS[kind], !active && 'opacity-35')}
      />
      {active && chip && (
        <g transform={`translate(${mid[0]} ${mid[1]})`}>
          <rect
            x={-chip.length * 3.6 - 5}
            y={-9}
            width={chip.length * 7.2 + 10}
            height={18}
            rx={9}
            className="fill-white stroke-line"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={cn('font-mono text-[11px] font-bold', CHIP_CLASS[kind])}
          >
            {chip}
          </text>
        </g>
      )}
    </g>
  );
}
