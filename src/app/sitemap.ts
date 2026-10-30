import type { MetadataRoute } from 'next';
import { CHAPTERS, LAB } from '@/content/chapters';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', ...CHAPTERS.map((c) => c.href), LAB.href];
  return paths.map((p) => ({
    url: new URL(p, site.siteUrl).toString(),
    changeFrequency: 'monthly',
    priority: p === '/' ? 1 : 0.8,
  }));
}
