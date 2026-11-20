import type { Metadata } from 'next';
import { httpUrl } from '../lib/urls.ts';

export const siteName = 'Developer Portfolio';

export function siteConfiguration(origin = process.env.SITE_ORIGIN) {
  if (!origin) return { origin: 'http://localhost:3000', index: false };
  const url = httpUrl(origin);
  if (!url || url.pathname !== '/' || url.href !== `${url.origin}/`) {
    throw new Error(
      'SITE_ORIGIN must be an HTTP or HTTPS origin without a path, query, or fragment.',
    );
  }
  return { origin: url.origin, index: true };
}

export function pageMetadata(
  {
    title,
    description,
    path,
    publishedAt,
  }: {
    title: string;
    description: string;
    path: `/${string}`;
    publishedAt?: string;
  },
  site = siteConfiguration(),
): Metadata {
  const displayTitle = title === siteName ? title : `${title} | ${siteName}`;
  const canonical = new URL(path, site.origin).href;
  const openGraph = {
    title: displayTitle,
    description,
    url: canonical,
    siteName,
  };
  return {
    title: displayTitle,
    description,
    alternates: { canonical },
    robots: { index: site.index, follow: site.index },
    openGraph: publishedAt
      ? {
          ...openGraph,
          type: 'article',
          publishedTime: new Date(publishedAt).toISOString(),
        }
      : { ...openGraph, type: 'website' },
  };
}
