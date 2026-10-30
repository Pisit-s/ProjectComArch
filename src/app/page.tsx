import Link from 'next/link';
import { ChapterIcon } from '@/components/layout/chapter-icon';
import { Glass, GlassPill } from '@/components/glass/glass';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { CHAPTERS, LAB } from '@/content/chapters';
import { site } from '@/lib/site';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <GlassPill>
        <AnimatedShinyText>Computer Architecture · IEEE 754</AnimatedShinyText>
      </GlassPill>
      <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{site.name}</h1>
      <p className="mt-2 text-lg text-muted">{site.tagline}</p>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...CHAPTERS, { ...LAB, number: 0, title: 'Lab', slug: 'lab' }].map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="block h-full rounded-xl">
              <Glass interactive className="h-full p-4">
                <ChapterIcon name={c.icon} className="h-6 w-6 text-primary" />
                <p className="mt-2 font-semibold">{c.title}</p>
                <p className="text-sm text-muted">{c.blurb}</p>
              </Glass>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
