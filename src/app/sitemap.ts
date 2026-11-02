import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: new URL('/', site.siteUrl).toString(), changeFrequency: 'monthly', priority: 1 }];
}
