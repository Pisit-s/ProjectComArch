'use client';

import { createContext, useContext, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { HW_ACTIVE, HW_IDLE, HW_INK, HW_MUTED, HW_ROLE_COLOR, type HwRole } from './colors';

/**
 * SVG primitives for hardware diagrams (PLAN.md 6.2): every topic draws registers, ALUs, control
 * and wires with the same look. Put them inside `HwDiagram`, which scales with the screen through
 * its `viewBox`. Every part takes `active` (highlight in this step) and `role` (colour, PLAN.md 6.1).
 * Never copy figures from the textbook: compose your own diagram from these parts.
 */

// Arrow markers are scoped per diagram so two diagrams on one page never share ids.
const HwArrowIds = createContext('');

export function HwDiagram({
  width,
  height,
  label,
  children,
  className,
  minWidth,
}: {
  /** viewBox size in SVG units. */
  width: number;
  height: number;
  /** What the diagram shows, read by screen readers. */
  label: string;
  children: ReactNode;
  className?: string;
  /**
   * Narrowest width in CSS px before the diagram stops shrinking and scrolls sideways instead,
   * so text stays readable on phones (e.g. 520 for a 640-wide viewBox).
   */
  minWidth?: number;
}) {
  const id = useId().replace(/:/g, '');
  const svg = (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={cn('h-auto w-full font-sans select-none', className)}
    >
      <defs>
        {[
          ['idle', HW_IDLE],
          ['active', HW_ACTIVE],
        ].map(([k, c]) => (
          <marker
            key={k}
            id={`hw-arrow-${k}-${id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={c} />
          </marker>
        ))}
      </defs>
      <HwArrowIds.Provider value={id}>{children}</HwArrowIds.Provider>
    </svg>
  );
  if (!minWidth) return svg;
  return (
    <div className="scroll-x" data-hw="scroll">
      <div style={{ minWidth }}>{svg}</div>
    </div>
  );
}

type Box = { x: number; y: number; w: number; h: number };

export function HwRegister({
  x,
  y,
  w,
  h = 56,
  name,
  bits,
  value,
  shift,
  role = 'neutral',
  active = false,
}: Omit<Box, 'h'> & {
  h?: number;
  name: string;
  /** Width in bits, shown as "64 บิต". */
  bits?: number;
  /** Current value, rendered by the caller from its model (never typed by hand). */
  value?: ReactNode;
  shift?: 'left' | 'right';
  role?: HwRole;
  active?: boolean;
}) {
  const c = HW_ROLE_COLOR[role];
  return (
    <g data-hw="register" data-active={active || undefined}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={active ? `${c.main}24` : '#ffffff'}
        stroke={active ? c.main : `${c.main}99`}
        strokeWidth={active ? 3 : 1.5}
      />
      <rect x={x} y={y} width={6} height={h} rx={3} fill={c.main} />
      <text x={x + 14} y={y + 20} fontSize={14} fontWeight={600} fill={c.ink}>
        {name}
      </text>
      {bits !== undefined && (
        <text x={x + w - 10} y={y + 20} fontSize={11} textAnchor="end" fill={HW_MUTED}>
          {bits} บิต
        </text>
      )}
      {value !== undefined && (
        <text
          x={x + 14}
          y={y + h - 13}
          fontSize={14}
          fontFamily="var(--font-mono), monospace"
          fill={HW_INK}
        >
          {value}
        </text>
      )}
      {shift && (
        <g transform={`translate(${shift === 'left' ? x - 22 : x + w + 6}, ${y + h / 2 - 8})`}>
          <rect width={16} height={16} rx={4} fill={active ? HW_ACTIVE : '#e2e8f0'} />
          <path
            d={shift === 'left' ? 'M11 4 L5 8 L11 12' : 'M5 4 L11 8 L5 12'}
            fill="none"
            stroke={active ? '#ffffff' : HW_MUTED}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <title>{shift === 'left' ? 'shift ซ้าย' : 'shift ขวา'}</title>
        </g>
      )}
    </g>
  );
}

/** The usual ALU outline: two inputs on top, a notch between them, output at the bottom. */
export function HwAlu({
  x,
  y,
  w = 120,
  h = 70,
  label = 'ALU',
  op,
  role = 'md-alu',
  active = false,
}: Partial<Box> & {
  x: number;
  y: number;
  label?: string;
  /** e.g. "+" or "−" shown inside. */
  op?: string;
  role?: HwRole;
  active?: boolean;
}) {
  const c = HW_ROLE_COLOR[role];
  const n = w * 0.12;
  const d = [
    `M${x} ${y}`,
    `L${x + w / 2 - n} ${y}`,
    `L${x + w / 2} ${y + h * 0.25}`,
    `L${x + w / 2 + n} ${y}`,
    `L${x + w} ${y}`,
    `L${x + w * 0.78} ${y + h}`,
    `L${x + w * 0.22} ${y + h}`,
    'Z',
  ].join(' ');
  return (
    <g data-hw="alu" data-active={active || undefined}>
      <path
        d={d}
        fill={active ? `${c.main}24` : '#ffffff'}
        stroke={active ? c.main : `${c.main}99`}
        strokeWidth={active ? 3 : 1.5}
        strokeLinejoin="round"
      />
      <text
        x={x + w / 2}
        y={y + h * 0.62}
        fontSize={14}
        fontWeight={600}
        textAnchor="middle"
        fill={c.ink}
      >
        {label}
      </text>
      {op && (
        <text x={x + w / 2} y={y + h * 0.9} fontSize={13} textAnchor="middle" fill={HW_INK}>
          {op}
        </text>
      )}
    </g>
  );
}

export function HwControl({
  x,
  y,
  w = 110,
  h = 50,
  label = 'Control test',
  detail,
  role = 'md-test',
  active = false,
}: Partial<Box> & {
  x: number;
  y: number;
  label?: string;
  /** Short line under the label, e.g. the bit being tested. */
  detail?: ReactNode;
  role?: HwRole;
  active?: boolean;
}) {
  const c = HW_ROLE_COLOR[role];
  return (
    <g data-hw="control" data-active={active || undefined}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        fill={active ? `${c.main}24` : '#ffffff'}
        stroke={active ? c.main : `${c.main}99`}
        strokeWidth={active ? 3 : 1.5}
      />
      <text
        x={x + w / 2}
        y={y + (detail ? h / 2 - 3 : h / 2 + 5)}
        fontSize={13}
        fontWeight={600}
        textAnchor="middle"
        fill={c.ink}
      >
        {label}
      </text>
      {detail && (
        <text x={x + w / 2} y={y + h / 2 + 14} fontSize={11} textAnchor="middle" fill={HW_INK}>
          {detail}
        </text>
      )}
    </g>
  );
}

/**
 * A wire through `points` with an arrow at the end. Active wires turn primary blue with a
 * moving dash (still under reduced motion). `width` is the bus width label, e.g. 32.
 */
export function HwWire({
  points,
  active = false,
  arrow = true,
  label,
  width,
}: {
  points: readonly (readonly [number, number])[];
  active?: boolean;
  arrow?: boolean;
  label?: string;
  /** Bus width in bits: drawn as a small slash with the number. */
  width?: number;
}) {
  const ids = useContext(HwArrowIds);
  const d = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px} ${py}`).join(' ');
  const [mx, my] = midpoint(points);
  return (
    <g data-hw="wire" data-active={active || undefined}>
      <path
        d={d}
        fill="none"
        stroke={active ? HW_ACTIVE : HW_IDLE}
        strokeWidth={active ? 3 : 2}
        strokeLinejoin="round"
        className={active ? 'hw-wire-active' : undefined}
        markerEnd={arrow ? `url(#hw-arrow-${active ? 'active' : 'idle'}-${ids})` : undefined}
      />
      {width !== undefined && (
        <g transform={`translate(${mx}, ${my})`}>
          <path d="M-5 6 L5 -6" stroke={active ? HW_ACTIVE : HW_IDLE} strokeWidth={1.5} />
          <text x={7} y={-6} fontSize={10} fill={HW_MUTED}>
            {width}
          </text>
        </g>
      )}
      {label && (
        <text x={mx + 8} y={my + 14} fontSize={11} fill={active ? HW_ACTIVE : HW_MUTED}>
          {label}
        </text>
      )}
    </g>
  );
}

function midpoint(points: readonly (readonly [number, number])[]): [number, number] {
  if (points.length < 2) return [points[0]?.[0] ?? 0, points[0]?.[1] ?? 0];
  // middle of the longest segment: labels sit where there is room
  let best = 0;
  let at: [number, number] = [points[0][0], points[0][1]];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const len = Math.hypot(bx - ax, by - ay);
    if (len > best) {
      best = len;
      at = [(ax + bx) / 2, (ay + by) / 2];
    }
  }
  return at;
}
