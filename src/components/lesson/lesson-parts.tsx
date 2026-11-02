import { ArrowDown, BookOpen, Lightbulb } from 'lucide-react';
import { UI } from '@/content/lesson/copy';
import { type SectionDef } from '@/content/lesson/sections';
import { VOCAB, type VocabId } from '@/content/lesson/vocab';

/** Terms first (PLAN.md 1.1 rule 2): swipe row on phones, grid from 768px. */
export function VocabStrip({ ids, sectionId }: { ids: VocabId[]; sectionId: string }) {
  if (ids.length === 0) return null;
  return (
    <div data-testid={`vocab-${sectionId}`}>
      <h3 className="sr-only">{UI.vocab}</h3>
      <ul className="scroll-x -mx-4 flex snap-x snap-mandatory gap-2.5 px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0">
        {ids.map((id) => {
          const v = VOCAB[id];
          return (
            <li
              key={id}
              className="glass w-[72%] shrink-0 snap-start rounded-xl bg-card p-3 ring-1 ring-foreground/10 min-[480px]:w-[46%] md:w-auto"
            >
              <p className="font-display font-semibold text-ink">
                {v.term}
                {'thai' in v && v.thai && (
                  <span className="ml-1.5 text-sm font-normal text-muted">({v.thai})</span>
                )}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink/80">{v.meaning}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Takeaway({ text }: { text: string }) {
  return (
    <p
      className="flex items-start gap-2.5 rounded-xl bg-primary/8 p-4 font-semibold text-ink ring-1 ring-primary/25"
      data-testid="takeaway"
    >
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <span>{text}</span>
    </p>
  );
}

export function Bridge({ text }: { text: string }) {
  return <p className="text-center font-display text-lg font-semibold text-primary">{text}</p>;
}

export function SourceNote({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted">
      <BookOpen className="h-3.5 w-3.5" aria-hidden />
      {UI.source}: {text}
    </p>
  );
}

export function NextUp({ next }: { next?: SectionDef }) {
  if (!next) return null;
  return (
    <a
      href={`#${next.id}`}
      className="glass glass-interactive flex items-center justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
      data-testid="next-up"
    >
      <span>
        <span className="block text-xs text-muted">
          {UI.nextUp}: {next.number > 0 ? `${UI.chapter} ${next.number}` : ''}
        </span>
        <span className="font-display font-semibold">{next.title}</span>
      </span>
      <ArrowDown className="h-5 w-5 shrink-0 text-primary" aria-hidden />
    </a>
  );
}
