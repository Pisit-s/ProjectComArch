import { ArrowLeft, ArrowRight, Clock, ListChecks, Target } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Glass, GlassPill } from '@/components/glass/glass';

export interface TocItem {
  id: string;
  title: string;
}

export interface LessonLink {
  href: Route;
  /** Small line above the title, e.g. "บทถัดไป · บทที่ 2". */
  caption: string;
  title: string;
}

export interface LessonLayoutProps {
  /** Icon beside the eyebrow (e.g. `<TopicIcon name="multiply" />`). */
  icon: ReactNode;
  /** e.g. "หัวข้อที่ 1" or "บทที่ 3". */
  eyebrow: string;
  title: string;
  objectives: readonly string[];
  readMinutes?: number;
  toc: readonly TocItem[];
  /** Title of the closing section; it gets the id `summary`. */
  summaryTitle?: string;
  prev?: LessonLink;
  next?: LessonLink;
  children: ReactNode;
}

/**
 * Layout of every lesson page in every topic (PLAN.md 6.2): eyebrow, H1, objectives, reading
 * time, table of contents (sticky on desktop, folding on phones) and previous / next links.
 * Use `Section`, `Summary`, `TalkingPoints` and `SelfCheck` inside.
 */
export function LessonLayout({
  icon,
  eyebrow,
  title,
  objectives,
  readMinutes,
  toc,
  summaryTitle = 'สรุปท้ายบท',
  prev,
  next,
  children,
}: LessonLayoutProps) {
  const items = [...toc, { id: 'summary', title: summaryTitle }];
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 sm:pt-10">
      <header className="tb-rise">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
            {icon}
            {eyebrow}
          </span>
          {readMinutes !== undefined && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden />
                อ่านประมาณ {readMinutes} นาที
              </span>
            </>
          )}
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold text-balance sm:text-4xl">
          {title}
        </h1>
        {objectives.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" aria-hidden />
              เรียนจบบทนี้แล้วจะ
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="วัตถุประสงค์การเรียนรู้">
              {objectives.map((o) => (
                <li key={o}>
                  <GlassPill className="text-left leading-snug font-normal">{o}</GlassPill>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        <Toc items={items} />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
      {(prev || next) && <LessonNav prev={prev} next={next} />}
    </div>
  );
}

function Toc({ items }: { items: readonly TocItem[] }) {
  const list = (
    <ol className="space-y-1 text-sm">
      {items.map((it, i) => (
        <li key={it.id}>
          <a
            href={`#${it.id}`}
            className="flex gap-2 rounded-md px-2 py-1.5 text-ink/80 hover:bg-ice-100 hover:text-ink"
          >
            <span className="num w-4 font-mono text-xs text-muted">{i + 1}</span>
            <span>{it.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <details className="glass collapse-arrow collapse mb-4 rounded-xl bg-card ring-1 ring-foreground/10 lg:hidden">
        <summary className="collapse-title min-h-11 py-3 text-sm font-semibold">
          <ListChecks className="mr-1.5 inline h-4 w-4 text-primary" aria-hidden />
          หัวข้อในบทนี้
        </summary>
        <nav aria-label="หัวข้อในบทนี้" className="collapse-content">
          {list}
        </nav>
      </details>
      <aside className="hidden lg:block">
        <nav aria-label="หัวข้อในบทนี้" className="sticky top-24">
          <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted">หัวข้อในบทนี้</p>
          {list}
        </nav>
      </aside>
    </>
  );
}

export function Section({
  id,
  title,
  children,
  wide = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  /** Tools may use the full width; reading text stays near 72ch. */
  wide?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24">
      <Glass className="p-4 sm:p-6">
        <h2 id={`${id}-h`} className="font-display text-2xl font-semibold">
          {title}
        </h2>
        <div className={wide ? 'mt-3 space-y-4' : 'prose-th mt-3 max-w-[72ch] space-y-3'}>
          {children}
        </div>
      </Glass>
    </section>
  );
}

export function Summary({ points, title = 'สรุปท้ายบท' }: { points: ReactNode[]; title?: string }) {
  return (
    <section
      id="summary"
      aria-labelledby="summary-h"
      className="scroll-mt-24"
      data-testid="chapter-summary"
    >
      <div className="glass-raised rounded-2xl bg-card p-4 ring-2 ring-primary/30 sm:p-6">
        <h2 id="summary-h" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <ListChecks className="h-6 w-6 text-primary" aria-hidden />
          {title}
        </h2>
        <ul className="mt-3 max-w-[72ch] list-disc space-y-2 pl-5 marker:text-primary">
          {points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LessonNav({ prev, next }: { prev?: LessonLink; next?: LessonLink }) {
  return (
    <nav
      aria-label="บทก่อนหน้าและบทถัดไป"
      className="mt-10 grid gap-3 sm:grid-cols-2"
      data-testid="chapter-nav"
    >
      {prev ? (
        <Link href={prev.href} className="rounded-xl" data-testid="prev-chapter">
          <Glass interactive className="flex h-full items-center gap-3 p-4">
            <ArrowLeft className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block text-xs text-muted">{prev.caption}</span>
              <span className="font-semibold">{prev.title}</span>
            </span>
          </Glass>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className="rounded-xl" data-testid="next-chapter">
          <Glass interactive className="flex h-full items-center justify-end gap-3 p-4 text-right">
            <span>
              <span className="block text-xs text-muted">{next.caption}</span>
              <span className="font-semibold">{next.title}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          </Glass>
        </Link>
      )}
    </nav>
  );
}
