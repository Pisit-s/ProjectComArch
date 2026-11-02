import type { ComponentType } from 'react';

/** Scene id (anchor) -> lazily loaded component. Scenes are added phase by phase. */
export const SCENES: Record<string, ComponentType> = {};
