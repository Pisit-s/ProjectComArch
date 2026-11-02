import { MessageSquareText } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * "ประเด็นสำหรับอธิบาย": 4-6 points a presenter can say out loud at the end of a topic
 * (PLAN.md 1.5). Gets the id `talking-points` for the table of contents.
 */
export function TalkingPoints({
  points,
  title = 'ประเด็นสำหรับอธิบาย',
  id = 'talking-points',
}: {
  points: ReactNode[];
  title?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className="scroll-mt-24"
      data-testid="talking-points"
    >
      <div className="glass rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <h2 id={`${id}-h`} className="flex items-center gap-2 font-display text-2xl font-semibold">
          <MessageSquareText className="h-6 w-6 text-primary" aria-hidden />
          {title}
        </h2>
        <ol className="mt-3 max-w-[72ch] space-y-2.5">
          {points.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
