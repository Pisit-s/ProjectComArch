'use client';

import { useInView } from 'motion/react';
import { useRef } from 'react';
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
  return (
    <div
      ref={ref}
      style={{ minHeight }}
      data-testid={`scene-${id}`}
      data-loaded={near && Scene ? '1' : undefined}
    >
      {near && Scene ? (
        <ToolBoundary>
          <Scene />
        </ToolBoundary>
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
