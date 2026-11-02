import { CircleHelp } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SelfCheckItem {
  q: ReactNode;
  a: ReactNode;
}

/**
 * "คำถามชวนคิด": 3-5 questions, each answer opens on its own ("ดูเฉลย"). Built on `<details>`
 * with daisyUI `collapse`, so it works with the keyboard and without JavaScript (PLAN.md 1.5).
 */
export function SelfCheck({
  items,
  title = 'คำถามชวนคิด',
  id = 'self-check',
}: {
  items: SelfCheckItem[];
  title?: string;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24" data-testid="self-check">
      <div className="glass rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <h2 id={`${id}-h`} className="flex items-center gap-2 font-display text-2xl font-semibold">
          <CircleHelp className="h-6 w-6 text-primary" aria-hidden />
          {title}
        </h2>
        <ol className="mt-3 max-w-[72ch] space-y-3">
          {items.map((it, i) => (
            <li key={i} className="rounded-xl bg-white/70 p-3 ring-1 ring-line/70">
              <p className="flex gap-2 font-semibold">
                <span className="num font-mono text-primary">{i + 1}.</span>
                <span>{it.q}</span>
              </p>
              <details className="collapse-arrow collapse mt-2 rounded-lg bg-ice-50 ring-1 ring-line/60">
                <summary className="collapse-title min-h-11 py-2.5 text-sm font-medium text-primary">
                  ดูเฉลย
                </summary>
                <div className="collapse-content text-ink/90">{it.a}</div>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
