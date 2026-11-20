import { publishedLocations } from '@/server/content';
import { siteConfiguration } from '@/server/metadata';

export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export async function GET() {
  const { origin } = siteConfiguration();
  const { projects, posts } = await publishedLocations();
  const entry = (path: string, updatedAt?: Date) => {
    const url = escapeXml(new URL(path, origin).href);
    const lastModified = updatedAt
      ? `<lastmod>${updatedAt.toISOString()}</lastmod>`
      : '';
    return `<url><loc>${url}</loc>${lastModified}</url>`;
  };
  const entries = [
    ...['/', '/projects', '/blog'].map((path) => entry(path)),
    ...projects.map(({ project: { slug }, updatedAt }) =>
      entry(`/projects/${encodeURIComponent(slug)}`, updatedAt),
    ),
    ...posts.map(({ post: { slug }, updatedAt }) =>
      entry(`/blog/${encodeURIComponent(slug)}`, updatedAt),
    ),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}
