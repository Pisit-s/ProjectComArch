import { site } from '@/lib/site';

/**
 * Site mark: a blue chip with small pins on both sides and the three Floating-Point bars
 * (Sign, Exponent, Fraction) inside, carried over from the stage 1 logo.
 */
export function LogoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {[7, 11, 15].map((y) => (
        <g key={y} fill="#2563EB">
          <rect x="0.5" y={y} width="3" height="2" rx="0.8" />
          <rect x="20.5" y={y} width="3" height="2" rx="0.8" />
        </g>
      ))}
      <rect x="2.5" y="1.5" width="19" height="21" rx="4.5" fill="#2563EB" />
      <rect x="4.6" y="3.6" width="14.8" height="16.8" rx="2.8" fill="#FFFFFF" />
      <rect x="6.3" y="6" width="2" height="12" rx="0.9" fill="#D55E00" />
      <rect x="9.2" y="6" width="3.8" height="12" rx="0.9" fill="#009E73" />
      <rect x="13.9" y="6" width="3.8" height="12" rx="0.9" fill="#2563EB" />
    </svg>
  );
}

/** The stage 1 mark (three bars only): the icon of the Floating-Point topic. */
export function FpMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1" y="5" width="4" height="14" rx="1.5" fill="#D55E00" />
      <rect x="6.5" y="5" width="7" height="14" rx="1.5" fill="#009E73" />
      <rect x="15" y="5" width="8" height="14" rx="1.5" fill="#2563EB" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        {site.name}
      </span>
    </span>
  );
}
