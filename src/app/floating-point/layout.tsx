import { FpSubnav } from '@/components/layout/fp-subnav';

/** Floating-Point topic: breadcrumb + chapter pills above every page (PLAN.md 2.5). */
export default function FloatingPointLayout({ children }: LayoutProps<'/floating-point'>) {
  return (
    <>
      <FpSubnav />
      {children}
    </>
  );
}
