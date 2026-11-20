import type { MetadataRoute } from 'next';
import { siteConfiguration } from '../server/metadata.ts';

export default function robots(): MetadataRoute.Robots {
  const { origin, index } = siteConfiguration();
  return {
    rules: index
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${origin}/sitemap.xml`,
  };
}
