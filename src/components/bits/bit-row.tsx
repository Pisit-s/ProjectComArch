'use client';

import { Fragment, useState } from 'react';
import { cn } from '@/lib/utils';
import { BitCell } from './bit-cell';
import { formatBitValue, mask, type BitRowValue } from './bit-format';
import { FIELD_STYLE, type FieldKind } from './field-style';

export { formatBitValue, type BitRowValue } from './bit-format';

export interface BitRowProps {
  label?: string;
  value: bigint;
  /** Number of bits shown (value is masked to this width). */
  width: number;
  /**
   * One colour for the row, or a colour per bit position (0 = LSB): an array indexed by
   * position, or a function. A function only works when BitRow is used inside a client
   * component (functions cannot be sent from a server component).
   */
  kind?: FieldKind | readonly FieldKind[] | ((bit: number) => FieldKind);
  /** Leave a gap every `group` bits, counted from the LSB (e.g. 4 for nibbles). */
  group?: number;
  /** Draw a divider between the left and right halves (e.g. HI | LO of a Product register). */
  split?: boolean;
  /** Bit positions (0 = LSB) that changed in this step. */
  changed?: readonly number[];
  /** A dashed cell left of the MSB, e.g. the carry out of the ALU. */
  extraBit?: { value: 0 | 1; label: string };
  showValue?: BitRowValue;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  'data-testid'?: string;
}

/**
 * A row of bits for any topic (PLAN.md 6.2): MSB on the left, colours from `FieldKind`,
 * changed bits glow, and tapping a bit tells its position and weight 2^i.
 */
export function BitRow({
  label,
  value,
  width,
  kind = 'plain',
  group,
  split = false,
  changed = [],
  extraBit,
  showValue = false,
  size = 'sm',
  className,
  'data-testid': testId,
}: BitRowProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const v = value & mask(width);
  const kindOf = (bit: number): FieldKind =>
    typeof kind === 'function'
      ? kind(bit)
      : typeof kind === 'string'
        ? kind
        : (kind[bit] ?? 'plain');
  const positions = Array.from({ length: width }, (_, k) => width - 1 - k);
  const half = Math.floor(width / 2);
  const gap = size === 'xs' ? 'gap-px' : 'gap-0.5';

  return (
    <div className={cn('min-w-0', className)} data-testid={testId}>
      {(label || showValue) && (
        <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
          {label && <span className="font-semibold">{label}</span>}
          {showValue && (
            <span className="num font-mono text-muted" data-testid={testId && `${testId}-value`}>
              {formatBitValue(v, width, showValue)}
            </span>
          )}
        </div>
      )}
      <div className={cn('flex flex-wrap items-end', gap)} role="group" aria-label={label}>
        {extraBit && (
          <span className="mr-1 flex flex-col items-center">
            <span
              className={cn(
                'inline-grid place-items-center rounded-md border-2 border-dashed border-md-alu font-mono text-md-alu-ink',
                size === 'xs' ? 'h-7 w-5 text-xs' : size === 'sm' ? 'h-9 w-6 text-sm' : 'h-11 w-7',
                extraBit.value === 1 && 'bg-md-alu/14 font-bold',
              )}
              aria-label={`${extraBit.label} = ${extraBit.value}`}
            >
              {extraBit.value}
            </span>
            <span className="text-[0.65rem] leading-tight text-muted">{extraBit.label}</span>
          </span>
        )}
        {positions.map((i) => {
          const bit = Number((v >> BigInt(i)) & 1n) as 0 | 1;
          const groupGap = group && i !== width - 1 && (i + 1) % group === 0;
          const splitHere = split && i === half - 1 && width > 1;
          return (
            <Fragment key={i}>
              {splitHere && <span aria-hidden className="mx-1 h-7 w-px self-center bg-ink/40" />}
              {groupGap && !splitHere && <span aria-hidden className="w-1" />}
              <BitCell
                bit={bit}
                field={kindOf(i)}
                size={size}
                changed={changed.includes(i)}
                selected={picked === i}
                aria-label={`บิตที่ ${i} = ${bit}`}
                onClick={() => setPicked((p) => (p === i ? null : i))}
              />
            </Fragment>
          );
        })}
      </div>
      {picked !== null && picked < width && (
        <p className="mt-1 text-xs text-muted" aria-live="polite">
          บิตที่ <span className="num font-mono">{picked}</span> (
          {FIELD_STYLE[kindOf(picked)].label}) มีน้ำหนัก 2<sup>{picked}</sup> ={' '}
          <span className="num font-mono">{(1n << BigInt(picked)).toString()}</span>
        </p>
      )}
    </div>
  );
}
