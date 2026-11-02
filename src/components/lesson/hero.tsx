import { ArrowDown, Play } from 'lucide-react';
import { GlassPill } from '@/components/glass/glass';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { HERO } from '@/content/lesson/copy';
import { site } from '@/lib/site';
import { JourneyMap } from './journey-map';
import { SceneShell } from './scene-shell';

/** Text renders on the server first; the teaser animation loads after (PLAN.md 3.1). */
export function Hero() {
  return (
    <section id="top" className="scroll-mt-20 px-4 pt-8 pb-6 sm:pt-14" data-testid="section-top">
      <div className="mx-auto grid max-w-[960px] gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="space-y-4">
          <GlassPill>
            <AnimatedShinyText className="mx-0">{HERO.pill}</AnimatedShinyText>
          </GlassPill>
          <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            {site.name}
          </h1>
          <p className="font-display text-xl text-primary sm:text-2xl">{site.tagline}</p>
          <p className="max-w-[52ch] text-ink/80">{HERO.intro}</p>
          <p className="inline-block rounded-full bg-white/80 px-3 py-1 text-sm text-muted ring-1 ring-line">
            {HERO.prereq}
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="#binary" className="btn h-12 min-h-12 px-6 text-base btn-primary">
              <Play className="h-5 w-5" aria-hidden />
              {HERO.start}
            </a>
            <a
              href="#playground"
              className="btn h-12 min-h-12 bg-white/80 btn-ghost px-6 text-base ring-1 ring-line"
            >
              {HERO.skip}
            </a>
          </div>
        </div>
        <div className="space-y-2">
          <SceneShell id="hero-teaser" minHeight="16rem" />
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted">
            <ArrowDown className="h-4 w-4" aria-hidden />
            {HERO.teaser}
          </p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-[960px]">
        <JourneyMap />
      </div>
    </section>
  );
}
