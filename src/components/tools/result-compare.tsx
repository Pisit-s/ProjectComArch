import { Num } from '@/components/ui/num';
import { fmt } from '@/lib/display';
import type { FloatFormat, FpResult, Rational } from '@/lib/fp';
import { BINARY32, exactDecimal, shortestDecimal, toHex, width } from '@/lib/fp';
import { FlagBadges } from '@/components/viz/step-parts';

/** Three values side by side: typed, exact result of the stored operands, and the float result. */
export function ResultCompare({
  typed,
  exactStored,
  result,
  error,
  expression,
  fmt: f = BINARY32,
}: {
  typed: Rational | null;
  exactStored: Rational | null;
  result: FpResult;
  error: Rational | null;
  expression: string;
  fmt?: FloatFormat;
}) {
  return (
    <section
      aria-label="ผลลัพธ์"
      className="glass-raised rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
      data-testid="result-card"
    >
      <h3 className="font-display text-lg font-semibold">ผลลัพธ์ {expression}</h3>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-lg bg-white/80 p-3 ring-1 ring-line">
          <dt className="text-xs text-muted">ผลแม่นยำของค่าที่พิมพ์</dt>
          <dd className="mt-1 text-sm">
            {typed ? (
              <Num value={fmt(typed, 30)} />
            ) : (
              <span className="text-muted">— (มีค่าพิเศษ)</span>
            )}
          </dd>
        </div>
        <div className="rounded-lg bg-white/80 p-3 ring-1 ring-line">
          <dt className="text-xs text-muted">ผลแม่นยำของค่าที่เก็บจริงใน float</dt>
          <dd className="mt-1 text-sm">
            {exactStored ? (
              <Num value={fmt(exactStored, 30)} />
            ) : (
              <span className="text-muted">—</span>
            )}
          </dd>
        </div>
        <div className="rounded-lg bg-primary/8 p-3 ring-1 ring-primary/30">
          <dt className="text-xs font-semibold text-primary">ผล float ({f.name})</dt>
          <dd className="mt-1">
            <b className="text-lg" data-testid="result-value">
              <Num value={shortestDecimal(f, result.bits)} />
            </b>
            <span className="num ml-2 font-mono text-sm text-muted" data-testid="result-hex">
              {toHex(result.bits, width(f))}
            </span>
            <span className="mt-1 block text-xs text-muted">
              เก็บจริง: <Num value={exactDecimal(f, result.bits)} />
            </span>
          </dd>
        </div>
      </dl>
      {error && (
        <p className="mt-3 text-sm">
          ผลต่างจากค่าที่พิมพ์:{' '}
          {error.num === 0n ? (
            <b>0 (ตรงพอดี)</b>
          ) : (
            <Num value={fmt(error, 12)} className="font-semibold" />
          )}
        </p>
      )}
      <div className="mt-2">
        <FlagBadges flags={result.flags} />
      </div>
    </section>
  );
}
