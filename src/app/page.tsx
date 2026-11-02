import { HashAnchor } from '@/components/layout/hash-anchor';
import { Hero } from '@/components/lesson/hero';
import { LessonSection } from '@/components/lesson/lesson-section';
import { PlaygroundSection } from '@/components/lesson/playground-section';
import { SummarySection } from '@/components/lesson/summary-section';
import { LESSONS } from '@/content/lesson/sections';

/** The whole lesson on one page (PLAN.md 3, 4.2): hero, chapters 1-6, playground, summary. */
export default function HomePage() {
  return (
    <>
      <Hero />
      {LESSONS.map((c) => (
        <LessonSection key={c.id} section={c} />
      ))}
      <PlaygroundSection />
      <SummarySection />
      <HashAnchor />
    </>
  );
}
