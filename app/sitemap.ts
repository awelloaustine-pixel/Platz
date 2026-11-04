import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { SITEMAP_PATHS } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_PATHS.map((path) => ({
    url: new URL(path, site.url).toString(),
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.8,
  }));
}
