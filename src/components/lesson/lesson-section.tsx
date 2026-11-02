import { BRIDGE, FACTS, TAKEAWAY, UI } from '@/content/lesson/copy';
import { QUIZ } from '@/content/lesson/quiz';
import { SECTIONS, type SectionDef } from '@/content/lesson/sections';
import { Bridge, NextUp, SourceNote, Takeaway, VocabStrip } from './lesson-parts';
import { QuickCheck } from './quick-check';
import { SceneShell } from './scene-shell';

/** Scene heights reserved before the code loads (keeps the page from jumping). */
const SCENE_HEIGHT: Record<string, string> = {
  'int-add': '24rem',
  'int-sub': '24rem',
  overflow: '26rem',
  shift: '16rem',
  'c-code': '22rem',
  point: '18rem',
  layout: '36rem',
  'bit-play': '36rem',
  special: '34rem',
  encode: '37rem',
  decode: '34rem',
  dec4: '24rem',
  'fp-add-bits': '32rem',
  'fp-sub': '32rem',
  rounding: '30rem',
  'slide-fun-fact': '16rem',
  'circuit-flow': '44rem',
};

/** Chapter template (PLAN.md 4.3): eyebrow, title, hook, terms, scenes, takeaway, check, source, next. */
export function LessonSection({ section }: { section: SectionDef }) {
  const i = SECTIONS.findIndex((s) => s.id === section.id);
  const next = SECTIONS[i + 1];
  const takeaway = TAKEAWAY[section.id];
  const quiz = QUIZ[section.id];
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-h`}
      className="scroll-mt-20 py-10 sm:py-14"
      data-testid={`section-${section.id}`}
    >
      <div className="mx-auto max-w-[960px] space-y-5 px-4">
        <header className="max-w-[60ch]">
          <p className="text-sm font-semibold text-primary">
            {UI.chapter} {section.number}
          </p>
          <h2
            id={`${section.id}-h`}
            className="mt-1 font-display text-3xl font-semibold text-balance sm:text-4xl"
          >
            {section.title}
          </h2>
          <p className="mt-2 text-lg text-ink/80" data-testid="hook">
            {section.hook}
          </p>
        </header>
        <VocabStrip ids={section.vocab} sectionId={section.id} />
        {section.id === 'ieee754' && (
          <ul className="flex flex-wrap gap-2 text-sm">
            {[FACTS.ieee, FACTS.sizes].map((t) => (
              <li key={t} className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-line">
                {t}
              </li>
            ))}
          </ul>
        )}
        {section.scenes.map((sc) => (
          <div key={sc.id} id={sc.id} className="scroll-mt-20 space-y-3">
            <h3 className="font-display text-xl font-semibold">{sc.title}</h3>
            <SceneShell id={sc.id} minHeight={SCENE_HEIGHT[sc.id]} />
            {sc.id === 'dec4' && <Bridge text={BRIDGE.dec4} />}
          </div>
        ))}
        {takeaway && <Takeaway text={takeaway} />}
        {section.id === 'binary' && <Bridge text={BRIDGE.binary} />}
        {quiz && <QuickCheck quiz={quiz} testId={`quiz-${section.id}`} />}
        <SourceNote text={section.source} />
        <NextUp next={next} />
      </div>
    </section>
  );
}
