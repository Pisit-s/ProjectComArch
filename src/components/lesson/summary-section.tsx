import { ArrowUp, CheckCircle2 } from 'lucide-react';
import { SUMMARY, UI } from '@/content/lesson/copy';
import { sectionById } from '@/content/lesson/sections';
import { site } from '@/lib/site';

export function SummarySection() {
  const s = sectionById('summary');
  return (
    <section
      id="summary"
      aria-labelledby="summary-h"
      className="scroll-mt-20 px-4 py-10 sm:py-14"
      data-testid="section-summary"
    >
      <div className="mx-auto max-w-[960px] space-y-5">
        <h2 id="summary-h" className="font-display text-3xl font-semibold sm:text-4xl">
          {s.title}
        </h2>
        <ol className="grid gap-2.5 sm:grid-cols-2">
          {SUMMARY.map((item, i) => (
            <li
              key={i}
              className="glass flex items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="flex-1">{item.text}</span>
              <a
                href={`#${item.back}`}
                className="btn btn-circle h-9 min-h-9 w-9 shrink-0 btn-ghost btn-sm"
                aria-label={`${UI.backTo} ${sectionById(item.back).number}`}
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </a>
            </li>
          ))}
        </ol>
        <div className="text-sm text-muted">
          <p className="font-semibold text-ink">{UI.source}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {site.references.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
