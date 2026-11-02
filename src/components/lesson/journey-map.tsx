import { CHAPTERS } from '@/content/lesson/sections';

/** Seven chips, one per chapter; tap to jump (scrolls sideways on phones). */
export function JourneyMap() {
  return (
    <nav aria-label="แผนที่บทเรียน" data-testid="journey-map">
      <ol className="scroll-x -mx-4 flex gap-2 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {CHAPTERS.map((c) => (
          <li key={c.id} className="shrink-0">
            <a
              href={`#${c.id}`}
              className="flex min-h-11 items-center gap-2 rounded-full bg-white/85 py-1.5 pr-3.5 pl-1.5 text-sm font-medium ring-1 ring-line hover:bg-ice-100"
            >
              <span className="num grid h-7 w-7 place-items-center rounded-full bg-primary font-mono text-xs text-white">
                {c.number}
              </span>
              {c.short}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
