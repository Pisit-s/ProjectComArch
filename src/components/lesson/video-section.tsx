'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';
import { VIDEO } from '@/content/lesson/copy';

/**
 * The lesson video at the end of the page. Only a cover is shown until the first tap, so the
 * page does not load YouTube's player (and its scripts) for people who never watch it.
 */
export function VideoSection() {
  const [on, setOn] = useState(false);
  return (
    <section
      id="video"
      aria-labelledby="video-h"
      className="scroll-mt-20 px-4 pb-10 sm:pb-14"
      data-testid="video"
    >
      <div className="mx-auto max-w-[960px] space-y-4">
        <h2 id="video-h" className="font-display text-2xl font-semibold sm:text-3xl">
          {VIDEO.title}
        </h2>
        <div className="glass relative aspect-video overflow-hidden rounded-2xl bg-navy-900 ring-1 ring-foreground/10">
          {on ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO.id}?autoplay=1&rel=0`}
              title={VIDEO.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full"
              data-testid="video-frame"
            />
          ) : (
            <button
              type="button"
              onClick={() => setOn(true)}
              className="group absolute inset-0 grid place-items-center"
              aria-label={`${VIDEO.play}: ${VIDEO.title}`}
              data-testid="video-play"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote cover, shown as is */}
              <img
                src={`https://i.ytimg.com/vi/${VIDEO.id}/maxresdefault.jpg`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-primary text-white shadow-xl ring-8 ring-primary/20 transition-transform group-hover:scale-105">
                <Play className="ml-1 h-9 w-9" aria-hidden />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
