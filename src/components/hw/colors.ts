/**
 * Colours of hardware diagrams. SVG fills need literal values, so these mirror the `@theme`
 * tokens in `src/app/globals.css` (PLAN.md 6.1); `tests/unit/topics/hw-colors.test.ts` keeps
 * the two in sync.
 */
export const HW_ROLE_COLOR = {
  'md-operand': { main: '#0072b2', ink: '#00629a' },
  'md-step': { main: '#e69f00', ink: '#8a5a00' },
  'md-acc': { main: '#009e73', ink: '#007553' },
  'md-alu': { main: '#cc79a7', ink: '#963f73' },
  'md-test': { main: '#d55e00', ink: '#a64300' },
  'mips-op': { main: '#102880', ink: '#102880' },
  'mips-rs': { main: '#0072b2', ink: '#00629a' },
  'mips-rt': { main: '#56b4e9', ink: '#1f6f9f' },
  'mips-rd': { main: '#009e73', ink: '#007553' },
  'mips-const': { main: '#cc79a7', ink: '#963f73' },
  'mips-funct': { main: '#e69f00', ink: '#8a5a00' },
  neutral: { main: '#54648a', ink: '#0b1b4d' },
} as const;

export type HwRole = keyof typeof HW_ROLE_COLOR;

/** Primary blue: active wires and outlines. */
export const HW_ACTIVE = '#2563eb';
export const HW_IDLE = '#94a3b8';
export const HW_INK = '#0b1b4d';
export const HW_MUTED = '#54648a';
