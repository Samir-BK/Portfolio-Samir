import assert from 'node:assert/strict';
import test from 'node:test';
import { localDatabaseUrl } from '../prisma/local-database.ts';
import { readFacet, readingMinutes } from '../src/lib/content.ts';
import { pageMetadata, siteConfiguration } from '../src/server/metadata.ts';
import robots from '../src/app/robots.ts';

test('normalizes URL filters and reads only the first repeated value', () => {
  assert.equal(readFacet([' Next.js ', 'React']), 'next-js');
  assert.equal(readFacet('Developer tooling'), 'developer-tooling');
  assert.equal(readFacet(undefined), '');
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('word '.repeat(221)), 2);
});

test('generates canonical and Open Graph URLs from the configured site origin', () => {
  const site = siteConfiguration('https://portfolio.example/');
  const listing = pageMetadata(
    { title: 'Projects', description: 'Case studies', path: '/projects' },
    site,
  );
  assert.equal(
    listing.alternates.canonical,
    'https://portfolio.example/projects',
  );
  assert.equal(listing.openGraph.url, listing.alternates.canonical);
  assert.equal(listing.openGraph.type, 'website');
  assert.deepEqual(listing.robots, { index: true, follow: true });

  const article = pageMetadata(
    {
      title: 'Sample article',
      description: 'Summary',
      path: '/blog/example',
      publishedAt: '2026-11-07',
    },
    site,
  );
  assert.equal(article.openGraph.type, 'article');
  assert.equal(article.openGraph.publishedTime, '2026-11-07T00:00:00.000Z');
  assert.equal(
    article.alternates.canonical,
    'https://portfolio.example/blog/example',
  );
  assert.deepEqual(siteConfiguration(''), {
    origin: 'http://localhost:3000',
    index: false,
  });
  for (const origin of [
    'https://example.com/foo',
    'https://example.com/?x=1',
    'javascript:alert(1)',
    'https://user@example.com',
  ])
    assert.throws(() => siteConfiguration(origin), /SITE_ORIGIN/);
});

test('robots uses the configured origin and disallows indexing by default', (t) => {
  const previous = process.env.SITE_ORIGIN;
  t.after(() => {
    if (previous === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = previous;
  });
  process.env.SITE_ORIGIN = 'https://portfolio.example';
  assert.deepEqual(robots(), {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://portfolio.example/sitemap.xml',
  });
  delete process.env.SITE_ORIGIN;
  assert.deepEqual(robots().rules, { userAgent: '*', disallow: '/' });
});

test('demo seed and integration commands reject remote and mismatched databases', () => {
  const testUrl = 'postgresql://user@127.0.0.1:5432/portfolio_test';
  assert.equal(localDatabaseUrl(testUrl, 'test'), testUrl);
  assert.throws(() => localDatabaseUrl(testUrl, 'dev'), /DATABASE_URL/);
  for (const value of [
    undefined,
    'postgresql://user@production.example/portfolio_test',
    'postgresql://user@127.0.0.1/portfolio_dev',
    testUrl + '?host=production.example',
    testUrl + '?dbname=portfolio_dev',
  ])
    assert.throws(() => localDatabaseUrl(value, 'test'), /TEST_DATABASE_URL/);
});
