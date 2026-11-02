import Link from 'next/link';
import { site } from '@/lib/site';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import { NavLinks } from './nav-links';

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <nav
        aria-label="เมนูหลัก"
        className="glass mx-auto flex max-w-6xl items-center gap-2 rounded-full bg-card py-1.5 pr-1.5 pl-4 ring-1 ring-foreground/10 [@media(hover:none)]:bg-white/92"
      >
        <Link href="/" aria-label={`${site.name} หน้าแรก`} className="rounded-full py-1 pr-1">
          <Logo />
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center">
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
