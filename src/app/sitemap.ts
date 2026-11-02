import type { MetadataRoute } from 'next';
import { CHAPTERS, LAB } from '@/content/chapters';
import { TOPICS_IN_ORDER } from '@/content/topics';
import { site } from '@/lib/site';

/** Home, the Floating-Point pages and every other topic that is `ready` (PLAN.md 2.6). */
export default function sitemap(): MetadataRoute.Sitemap {
  const topics = TOPICS_IN_ORDER.filter((t) => t.status === 'ready').map((t) => t.href);
  const paths = [...new Set(['/', ...topics, ...CHAPTERS.map((c) => c.href), LAB.href])];
  return paths.map((p) => ({
    url: new URL(p, site.siteUrl).toString(),
    changeFrequency: 'monthly',
    priority: p === '/' ? 1 : 0.8,
  }));
}
