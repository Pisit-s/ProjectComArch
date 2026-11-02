'use client';

import { motion } from 'motion/react';
import { usePlayerMotion } from '@/components/player/player-speed';
import { cn } from '@/lib/utils';

type Tok = 'kw' | 'fn' | 'str' | 'num' | 'plain';

const TOKEN = /("(?:[^"\\]|\\.)*")|\b(int|float|double)\b|\b(printf)\b|(\d+(?:\.\d+)?f?)\b/g;

const TOK_CLASS: Record<Tok, string> = {
  kw: 'text-primary font-semibold',
  fn: 'text-bit-exp-ink',
  str: 'text-bit-sign-ink',
  num: 'text-bit-grs-ink',
  plain: 'text-ink',
};

/** Tiny C highlighter: keywords, printf, strings and numbers (no library, PLAN.md 4.5). */
function tokens(line: string): { t: Tok; s: string }[] {
  const out: { t: Tok; s: string }[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    if (m.index > last) out.push({ t: 'plain', s: line.slice(last, m.index) });
    out.push({ t: m[1] ? 'str' : m[2] ? 'kw' : m[3] ? 'fn' : 'num', s: m[0] });
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push({ t: 'plain', s: line.slice(last) });
  return out;
}

/**
 * C code with one highlighted line, and an output strip that types its text one character
 * at a time (all at once under reduced motion).
 */
export function CodeCard({
  lines,
  active,
  output,
  outputLabel,
  shake = false,
  testId = 'code',
}: {
  lines: readonly string[];
  /** Highlighted line (-1 for none). */
  active: number;
  output: string;
  outputLabel: string;
  /** Wobble the output once it is typed (a surprising result). */
  shake?: boolean;
  testId?: string;
}) {
  const { d } = usePlayerMotion();
  const per = d(0.05);
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-line" data-testid={testId}>
      <pre className="scroll-x num py-2 font-mono text-[clamp(0.8rem,3.6vw,1rem)] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'relative px-3 whitespace-pre',
              i === active && 'bg-primary/10 shadow-[inset_3px_0_0] shadow-primary',
            )}
            data-active={i === active ? 'true' : undefined}
          >
            {tokens(line).map((k, j) => (
              <span key={j} className={TOK_CLASS[k.t]}>
                {k.s}
              </span>
            ))}
          </div>
        ))}
      </pre>
      <div className="flex min-h-11 items-center gap-2 border-t border-line bg-ink px-3 py-2 font-mono text-white">
        <span className="font-sans text-xs text-white/60">{outputLabel}</span>
        <motion.span
          key={output}
          className="num text-[clamp(0.9rem,4vw,1.1rem)]"
          initial={false}
          animate={shake ? { x: [0, -5, 5, -4, 4, -2, 0] } : { x: 0 }}
          transition={{ delay: d(0.05 * output.length + 0.2), duration: d(0.5) }}
        >
          <span className="sr-only" data-testid={`${testId}-output`}>
            {output}
          </span>
          {[...output].map((c, k) => (
            <motion.span
              key={k}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: k * per, duration: 0.01 }}
              aria-hidden
            >
              {c}
            </motion.span>
          ))}
          <span
            className="ml-0.5 inline-block h-[1em] w-2 translate-y-0.5 bg-white/70"
            aria-hidden
          />
        </motion.span>
      </div>
    </div>
  );
}
