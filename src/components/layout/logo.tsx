import { site } from '@/lib/site';

/** Three coloured blocks (Sign, Exponent, Fraction) + the site name. */
export function LogoMark({ className = 'h-6 w-6' }: { className?: string }) {
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
