import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Kit } from './kit';

export const metadata: Metadata = { title: 'kit', robots: { index: false, follow: false } };

/** Building blocks on one page while developing (PLAN.md 4.1). Not part of the site. */
export default function KitPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Kit />;
}
