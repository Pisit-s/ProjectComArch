'use client';

import { useId } from 'react';
import { INPUT_ERRORS } from '@/content/lesson/copy';
import { cn } from '@/lib/utils';

export function OperandInput({
  label,
  value,
  onChange,
  error,
  hint,
  testId,
  className,
  inputMode = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Error kind from the parser (shown in Thai under the field). */
  error?: string | null;
  hint?: string;
  testId?: string;
  className?: string;
  inputMode?: 'text' | 'decimal';
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  const message = error ? (INPUT_ERRORS[error] ?? error) : hint;
  return (
    <fieldset className={cn('fieldset min-w-0', className)}>
      <label htmlFor={id} className="fieldset-legend pb-1 text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cn('input h-11 w-full bg-white font-mono text-base', error && 'input-error')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? msgId : undefined}
        data-testid={testId}
      />
      {message && (
        <p
          id={msgId}
          className={cn('label text-sm whitespace-normal', error ? 'text-error' : 'text-muted')}
          role={error ? 'alert' : undefined}
        >
          {message}
        </p>
      )}
    </fieldset>
  );
}
