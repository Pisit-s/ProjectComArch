'use client';

import { X } from 'lucide-react';
import { type CSSProperties, type KeyboardEvent, useRef, useState } from 'react';
import { BINARY32, type FloatFormat, bitMeaning, toBinaryString, toHex, width } from '@/lib/fp';
import { fmt } from '@/lib/display';
import { cn } from '@/lib/utils';
import { Num, Pow } from '@/components/ui/num';
import { BIT_INFO } from '@/content/lesson/copy';
import { BitCell } from './bit-cell';
import { FIELD_STYLE, type FieldKind } from './field-style';

export type FieldHighlight = Partial<Record<'sign' | 'exp' | 'frac', boolean>>;

type Props = {
  bits: bigint;
  fmt?: FloatFormat;
  /** edit: every bit is a large toggle button (>= 44px). display: compact, tap to explain. */
  mode?: 'display' | 'edit';
  onToggle?: (index: number) => void;
  highlight?: FieldHighlight;
  label?: string;
  showHex?: boolean;
  className?: string;
  /** Prefix for test ids / aria. */
  name?: string;
};

const fieldOf = (f: FloatFormat, i: number): 'sign' | 'exp' | 'frac' =>
  i === 0 ? 'sign' : i <= f.expBits ? 'exp' : 'frac';

/**
 * A full floating-point word with labelled fields (S / Exponent / Fraction). Phones show
 * Sign + Exponent on one row and Fraction on the next. Every bit can be tapped to see its meaning.
 */
export function Register({
  bits,
  fmt: f = BINARY32,
  mode = 'display',
  onToggle,
  highlight,
  label,
  showHex = true,
  className,
  name = 'register',
}: Props) {
  const w = width(f);
  const s = toBinaryString(bits, w);
  const [selected, setSelected] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const edit = mode === 'edit';

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === 'ArrowRight') next = Math.min(w - 1, i + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(0, i - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = w - 1;
    else return;
    e.preventDefault();
    e.stopPropagation();
    setFocusIdx(next);
    refs.current[next]?.focus();
  };

  const cell = (i: number) => {
    const field = fieldOf(f, i);
    const m = bitMeaning(f, bits, i);
    return (
      <BitCell
        key={i}
        ref={(el) => {
          refs.current[i] = el;
        }}
        bit={s[i] as '0' | '1'}
        field={field}
        size={edit ? 'lg' : 'xs'}
        changed={highlight?.[field]}
        selected={selected === i}
        tabIndex={i === focusIdx ? 0 : -1}
        aria-pressed={edit ? s[i] === '1' : undefined}
        aria-label={`บิตที่ ${m.bitNumber}, ${FIELD_STYLE[field].label}, ค่า ${s[i]}`}
        data-testid={`${name}-bit-${i}`}
        onKeyDown={(e) => onKey(e, i)}
        onFocus={() => setFocusIdx(i)}
        onClick={() => {
          if (edit) onToggle?.(i);
          setSelected((cur) => (edit ? i : cur === i ? null : i));
        }}
      />
    );
  };

  const group = (field: 'sign' | 'exp' | 'frac', from: number, to: number) => (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1',
        !edit && field === 'frac' && 'w-full lg:w-auto lg:flex-1',
      )}
    >
      <span className={cn('text-xs font-semibold', FIELD_STYLE[field].text)}>
        {field === 'sign' ? 'S' : FIELD_STYLE[field].label}
        <span className="ml-1 font-normal text-muted">
          {to - from} {BIT_INFO.bits}
        </span>
      </span>
      <div
        className={cn(
          edit
            ? 'flex flex-wrap gap-1'
            : 'grid grid-cols-[repeat(var(--cols-sm),minmax(0,1fr))] gap-px sm:gap-0.5 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]',
        )}
        style={
          edit
            ? undefined
            : // very long fields (binary64 fraction: 52 bits) use two rows below lg
              ({
                '--cols': to - from,
                '--cols-sm': to - from > 26 ? Math.ceil((to - from) / 2) : to - from,
              } as CSSProperties)
        }
      >
        {Array.from({ length: to - from }, (_, k) => cell(from + k))}
      </div>
    </div>
  );

  return (
    <div className={cn('glass-solid rounded-xl p-3 ring-1 ring-foreground/10 sm:p-4', className)}>
      {(label || showHex) && (
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          {label && <span className="text-sm font-semibold">{label}</span>}
          {showHex && (
            <span className="num font-mono text-sm text-muted" data-testid={`${name}-hex`}>
              {toHex(bits, w)}
            </span>
          )}
        </div>
      )}
      <div
        className={cn('flex flex-wrap gap-x-3 gap-y-2', !edit && 'lg:flex-nowrap')}
        role="group"
        aria-label={label ? `บิตของ ${label}` : 'บิตทั้งหมด'}
      >
        <div className="flex gap-3">
          {group('sign', 0, 1)}
          {group('exp', 1, 1 + f.expBits)}
        </div>
        {group('frac', 1 + f.expBits, w)}
      </div>
      {selected !== null && (
        <BitInfo fmt={f} bits={bits} index={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export function BitInfo({
  fmt: f,
  bits,
  index,
  onClose,
}: {
  fmt: FloatFormat;
  bits: bigint;
  index: number;
  onClose: () => void;
}) {
  const m = bitMeaning(f, bits, index);
  const field: FieldKind = m.field;
  return (
    <div
      className="mt-3 flex items-start gap-2 rounded-lg bg-ice-100 p-3 text-sm"
      role="status"
      aria-live="polite"
      data-testid="bit-info"
    >
      <span
        className={cn('mt-1 h-3 w-3 shrink-0 rounded-sm', FIELD_STYLE[field].chip)}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-semibold">
          {BIT_INFO.bit} {m.bitNumber} ·{' '}
          <span className={FIELD_STYLE[field].text}>{FIELD_STYLE[field].label}</span> ·{' '}
          {BIT_INFO.value} {m.bit}
        </p>
        {m.field === 'sign' && (
          <p>
            {BIT_INFO.sign}
            {m.bit ? BIT_INFO.negative : BIT_INFO.positive}
          </p>
        )}
        {m.field === 'exp' && (
          <p>
            {BIT_INFO.expPos} <Pow exp={m.position} /> = {2 ** m.position} {BIT_INFO.expAdds}{' '}
            <b className="num font-mono">{m.expContribution}</b> {BIT_INFO.expTail}
          </p>
        )}
        {m.field === 'frac' && (
          <p>
            {BIT_INFO.fracPos} {m.position} {BIT_INFO.fracWeight} <Pow exp={-m.position} />{' '}
            {BIT_INFO.fracOf}
            {m.valueContribution && m.scaleExponent !== null ? (
              <>
                {' '}
                · {BIT_INFO.fracAdds} <Pow exp={-m.position} /> × <Pow exp={m.scaleExponent} /> ={' '}
                <b>
                  <Num value={fmt(m.valueContribution, 12)} />
                </b>{' '}
                {BIT_INFO.fracTail}
              </>
            ) : (
              ` · ${BIT_INFO.special}`
            )}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn -mt-1 -mr-1 btn-circle btn-ghost btn-sm"
        aria-label={BIT_INFO.close}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
