import { MetadataRoute } from 'next';
import { RITUAL_FORMULATIONS, BLOG_POSTS } from '@/lib/rituals-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL || 'https://thewellnesshouse.in';

  const staticRoutes = [
    '',
    '/rituals',
    '/science',
    '/atelier',
    '/ingredients',
    '/consultation',
    '/journal',
    '/about',
    '/contact',
    '/faq',
    '/privacy-policy',
    '/terms-and-conditions'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const ritualRoutes = RITUAL_FORMULATIONS.map((ritual) => ({
    url: `${baseUrl}/rituals/${ritual.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...ritualRoutes, ...blogRoutes];
}
