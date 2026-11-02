'use client';

import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { SCENES } from '@/components/scenes/registry';
import { ToolBoundary } from './tool-boundary';

/**
 * Reserves the scene's height and loads its code only when it comes within about one
 * screen of the viewport (PLAN.md 4.9). Unbuilt scenes stay as a faint empty box.
 */
export function SceneShell({ id, minHeight = '22rem' }: { id: string; minHeight?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: '900px 0px' });
  const Scene = SCENES[id];
  const inner = useRef<HTMLDivElement>(null);
  // keep the reserved height until the scene has really drawn something (its code loads as a
  // separate chunk), then let the scene's own height count so a short scene leaves no gap
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const el = inner.current;
    if (!el || drawn) return;
    const ro = new ResizeObserver(() => el.offsetHeight > 0 && setDrawn(true));
    ro.observe(el);
    return () => ro.disconnect();
  }, [near, drawn]);
  return (
    <div
      ref={ref}
      style={drawn ? undefined : { minHeight }}
      data-testid={`scene-${id}`}
      data-loaded={near && Scene ? '1' : undefined}
    >
      {near && Scene ? (
        <div ref={inner}>
          <ToolBoundary>
            <Scene />
          </ToolBoundary>
        </div>
      ) : (
        <ScenePlaceholder minHeight={minHeight} />
      )}
    </div>
  );
}

export function ScenePlaceholder({ minHeight }: { minHeight: string }) {
  return (
    <div
      aria-hidden
      className="glass-solid h-full rounded-2xl opacity-50 ring-1 ring-foreground/5"
      style={{ minHeight }}
    />
  );
}
