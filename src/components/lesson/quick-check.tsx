'use client';

import { CircleCheck, CircleX } from 'lucide-react';
import { useId, useState } from 'react';
import { UI } from '@/content/lesson/copy';
import type { Quiz } from '@/content/lesson/quiz';
import { cn } from '@/lib/utils';

/** One question, three options, check and see why (no score is kept). */
export function QuickCheck({ quiz, testId }: { quiz: Quiz; testId: string }) {
  const name = useId();
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const right = checked && picked === 0;
  return (
    <form
      className="glass rounded-xl bg-card p-4 ring-1 ring-foreground/10"
      onSubmit={(e) => {
        e.preventDefault();
        if (picked !== null) setChecked(true);
      }}
      data-testid={testId}
    >
      <fieldset>
        <legend className="mb-2 font-semibold">
          <span className="mr-2 text-xs font-semibold tracking-wide text-primary">{UI.quiz}</span>
          {quiz.question}
        </legend>
        <div className="grid gap-1.5">
          {quiz.order.map((i) => (
            <label
              key={i}
              className={cn(
                'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 ring-1',
                picked === i
                  ? 'bg-primary/8 ring-primary/40'
                  : 'bg-white/70 ring-line hover:bg-ice-100',
                checked && i === 0 && 'bg-success/10 ring-success/50',
              )}
            >
              <input
                type="radio"
                name={name}
                className="radio radio-sm radio-primary"
                checked={picked === i}
                onChange={() => {
                  setPicked(i);
                  setChecked(false);
                }}
                data-answer={i === 0 ? '1' : undefined}
              />
              <span className="num">{quiz.options[i]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="btn h-10 min-h-10 btn-primary btn-sm"
          disabled={picked === null}
        >
          {UI.check}
        </button>
        {checked && (
          <p
            className={cn(
              'flex items-center gap-1.5 text-sm font-semibold',
              right ? 'text-success' : 'text-error',
            )}
            role="status"
            data-testid={`${testId}-result`}
          >
            {right ? (
              <CircleCheck className="h-4 w-4" aria-hidden />
            ) : (
              <CircleX className="h-4 w-4" aria-hidden />
            )}
            {right ? UI.correct : UI.wrong} ·{' '}
            <span className="font-normal text-ink">{quiz.reason}</span>
          </p>
        )}
      </div>
    </form>
  );
}
