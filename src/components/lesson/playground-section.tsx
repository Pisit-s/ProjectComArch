import { sectionById } from '@/content/lesson/sections';
import { PlaygroundLink } from './playground-link';
import { SceneShell } from './scene-shell';

export function PlaygroundSection() {
  const s = sectionById('playground');
  return (
    <section
      id="playground"
      aria-labelledby="playground-h"
      className="scroll-mt-20 px-4 py-10 sm:py-14"
      data-testid="section-playground"
    >
      <div className="mx-auto max-w-[960px] space-y-4">
        <header className="max-w-[60ch]">
          <h2 id="playground-h" className="font-display text-3xl font-semibold sm:text-4xl">
            {s.title}
          </h2>
          <p className="mt-2 text-lg text-ink/80" data-testid="hook">
            {s.hook}
          </p>
        </header>
        <SceneShell id="playground" minHeight="36rem" />
        <PlaygroundLink />
      </div>
    </section>
  );
}
