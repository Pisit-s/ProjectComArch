import type { GlossaryEntry } from './types';

/** Terms of the mips topic: filled by WP-1 (PLAN.md 6.3). Keys must not repeat keys of other files. */
export const MIPS_GLOSSARY = {} as const satisfies Record<string, GlossaryEntry>;
