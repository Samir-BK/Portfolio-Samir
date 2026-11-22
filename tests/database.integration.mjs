import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { seedDemo } from '../prisma/demo-data.ts';
import { localDatabaseUrl } from '../prisma/local-database.ts';
import { createDatabase } from '../src/server/db.ts';
import { projectFixtures } from '../src/content/projects.ts';
import { postFixtures } from '../src/content/posts.ts';
import {
  ContentConflict,
  publishPost,
  publishProject,
  savePostDraft,
  saveProjectDraft,
  withdrawPost,
  withdrawProject,
} from '../src/server/publication.ts';

const siteOrigin = 'https://portfolio.example';
const newSlug = 'integration-new';
const project = projectFixtures[0];
const post = postFixtures[0];
const pgConcurrentQueryWarning =
  /Calling client\.query\(\) when the client is already executing a query/;

function testEnvironment() {
  assert.notEqual(process.env.NODE_ENV, 'production');
  const url = localDatabaseUrl(process.env.TEST_DATABASE_URL, 'test');
  const testDatabase = new URL(url).pathname;
  for (const configured of [
    process.env.DATABASE_URL,
    process.env.DATABASE_MIGRATION_URL,
  ]) {
    if (configured) {
      const databasePath = decodeURIComponent(new URL(configured).pathname);
      assert.notEqual(
        databasePath,
        testDatabase,
        'The test database must be separate from application and migration databases.',
      );
    }
  }
  return {
    ...process.env,
    DATABASE_URL: url,
    DATABASE_MIGRATION_URL: url,
    SITE_ORIGIN: siteOrigin,
    AI_CHAT_ENABLED: 'false',
  };
}

async function startApp(env) {
  const listener = createServer().listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const { port } = listener.address();
  await new Promise((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve())),
  );
  const child = spawn(
    process.execPath,
    [
      fileURLToPath(import.meta.resolve('next/dist/bin/next')),
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      env: { ...env, NODE_ENV: 'production' },
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  );
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
    process.stderr.write(chunk);
  });
  const closed = once(child, 'close');
  async function stop() {
    if (child.exitCode === null && child.signalCode === null && child.pid) {
      child.kill();
    }
    await closed;
  }
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) break;
    try {
      const response = await fetch(base + '/robots.txt', {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return { base, stop, stderr: () => stderr };
    } catch {
      await delay(250);
    }
  }
  await stop();
  throw new Error('The production Next.js test server did not start.');
}

test(
  'migrated test database serves only current published snapshots',
  { timeout: 90_000 },
  async (t) => {
    const env = testEnvironment();
    assert.ok(
      existsSync('.next/BUILD_ID'),
      'Run the production build before the database tests.',
    );
    try {
      execFileSync('corepack', ['pnpm', 'db:migrate'], {
        env,
        timeout: 30_000,
        stdio: 'pipe',
      });
    } catch {
      throw new Error(
        'Test migration failed. Verify that the isolated PostgreSQL database is running and writable.',
      );
    }

    const db = createDatabase(env.DATABASE_URL);
    let ownsFixtures = false;
    let app;
    const warnings = [];
    function recordWarning(warning) {
      if (pgConcurrentQueryWarning.test(warning.message))
        warnings.push(warning.message);
    }
    process.on('warning', recordWarning);
    // Only remove records owned by this suite. Leave the applied migration in place.
    t.after(async () => {
      try {
        await app?.stop();
        if (ownsFixtures)
          await db.$transaction([
            db.project.deleteMany({
              where: {
                OR: [
                  {
                    isDemo: true,
                    slug: { in: projectFixtures.map(({ slug }) => slug) },
                  },
                  { slug: newSlug },
                ],
              },
            }),
            db.post.deleteMany({
              where: {
                OR: [
                  {
                    isDemo: true,
                    slug: { in: postFixtures.map(({ slug }) => slug) },
                  },
                  { slug: newSlug },
                ],
              },
            }),
          ]);
      } finally {
        try {
          await db.$disconnect();
        } finally {
          process.off('warning', recordWarning);
        }
      }
      assert.doesNotMatch(app?.stderr() ?? '', pgConcurrentQueryWarning);
      assert.deepEqual(warnings, []);
    });
    assert.equal(
      await db.project.count(),
      0,
      'Start with an empty dedicated test database.',
    );
    assert.equal(
      await db.post.count(),
      0,
      'Start with an empty dedicated test database.',
    );
    ownsFixtures = true;

    await seedDemo(db);
    await seedDemo(db);
    assert.equal(await db.project.count(), 4);
    assert.equal(await db.post.count(), 4);
    assert.equal(
      await db.projectVersion.count({ where: { stage: 'PUBLISHED' } }),
      3,
    );
    assert.equal(
      await db.postVersion.count({ where: { stage: 'PUBLISHED' } }),
      3,
    );

    await db.$disconnect();
    app = await startApp(env);
    async function get(path, status = 200) {
      const response = await fetch(app.base + path, {
        headers: { 'user-agent': 'Mozilla/5.0 PortfolioIntegration' },
        signal: AbortSignal.timeout(8_000),
      });
      assert.equal(response.status, status, path);
      assert.match(
        response.headers.get('cache-control') ?? '',
        /no-store/,
        path,
      );
      return response.text();
    }

    await t.test('disabled assistant links to the public gallery', async () => {
      const home = await get('/');
      const panel = home.match(
        /<section[^>]+aria-labelledby="terminal-title"[^>]*>.*?<\/section>/s,
      )?.[0];
      assert.ok(panel, 'The disabled assistant panel is rendered.');
      assert.match(panel, /The AI assistant is currently unavailable\./);
      assert.match(panel, /<a[^>]+href="\/projects"[^>]*>Explore projects/);
      assert.doesNotMatch(panel, /coming soon|<textarea[\s>]/i);
      assert.match(await get('/projects'), /<h1>Projects<\/h1>/);
    });

    await t.test(
      'lists published content and applies query-string filters',
      async () => {
        const home = await get('/');
        assert.match(home, /Featured projects/);
        assert.match(
          home,
          /<title>Samir B K \| Software Developer \| AI\/ML Enthusiast<\/title>/,
        );
        assert.match(home, /href="https:\/\/github\.com\/Samir-BK"/);
        assert.doesNotMatch(
          home,
          /resume-placeholder\.txt|hello@example\.invalid/,
        );
        assert.match(home, /Signal Desk/);
        assert.match(home, /Synthetic concept/);
        assert.doesNotMatch(home, /href="\/blog"/);
        assert.doesNotMatch(home, /Private project fixture/);
        const gallery = await get('/projects');
        assert.match(gallery, /Signal Desk/);
        assert.match(gallery, /Field Notes/);
        assert.doesNotMatch(gallery, /href="\/blog"/);
        assert.doesNotMatch(
          gallery,
          /Private project fixture|Draft technology/,
        );
        const projects = await get(
          '/projects?technology=typescript&category=developer-tooling',
        );
        assert.match(projects, /Traceboard/);
        assert.doesNotMatch(projects, /Signal Desk|Field Notes/);
        assert.match(
          await get('/projects?technology=next-js&category=developer-tooling'),
          /No projects match/,
        );
        const blog = await get('/blog');
        assert.match(blog, /Put gallery filters in the URL/);
        assert.match(blog, /Synthetic example/);
        assert.doesNotMatch(blog, /href="\/blog"/);
        assert.doesNotMatch(blog, /Private article fixture|Draft tag/);
        const filtered = await get('/blog?tag=observability');
        assert.match(filtered, /Make a trace waterfall readable/);
        assert.doesNotMatch(filtered, /Put gallery filters in the URL/);
        assert.match(await get('/blog?tag=missing'), /No articles match/);
      },
    );

    await t.test(
      'looks up live slugs and withholds metadata and sitemap URLs for drafts',
      async () => {
        for (const [area, entry] of [
          ['projects', project],
          ['blog', post],
        ]) {
          const path = `/${area}/${entry.slug}`;
          const html = await get(path);
          assert.ok(html.includes(entry.title));
          assert.ok(
            html.includes(`rel="canonical" href="${siteOrigin}${path}"`),
          );
          assert.ok(
            html.includes(`property="og:url" content="${siteOrigin}${path}"`),
          );
          await get(`/${area}/missing`, 404);
          const draft = await get(
            `/${area}/draft-${area === 'projects' ? 'project' : 'post'}`,
            404,
          );
          assert.doesNotMatch(
            draft,
            /Private (project|article) fixture|rel="canonical"|property="og:url"/,
          );
        }
        const sitemap = await get('/sitemap.xml');
        assert.ok(
          sitemap.includes(`<loc>${siteOrigin}/projects/${project.slug}</loc>`),
        );
        assert.ok(
          sitemap.includes(`<loc>${siteOrigin}/blog/${post.slug}</loc>`),
        );
        assert.doesNotMatch(sitemap, /draft-/);
      },
    );

    await t.test(
      'keeps draft edits private, including taxonomy and media, until atomic publish',
      async () => {
        assert.equal(
          await saveProjectDraft(
            db,
            project.slug,
            {
              ...project,
              title: 'Updated project',
              category: 'Design systems',
              technologies: ['TypeScript', 'CSS'],
              media: [
                {
                  src: '/integration-image.png',
                  alt: 'Test artwork',
                  width: 640,
                  height: 320,
                },
              ],
            },
            1,
          ),
          2,
        );
        assert.equal(
          await savePostDraft(
            db,
            post.slug,
            {
              ...post,
              title: 'Updated article',
              tags: ['Design systems'],
              markdown: 'Updated article body.',
            },
            1,
          ),
          2,
        );
        await assert.rejects(
          saveProjectDraft(db, project.slug, project, 1),
          ContentConflict,
        );
        await assert.rejects(publishPost(db, post.slug, 1), ContentConflict);
        assert.doesNotMatch(
          await get(`/projects/${project.slug}`),
          /Updated project|integration-image/,
        );
        assert.doesNotMatch(
          await get(`/blog/${post.slug}`),
          /Updated article|Design systems/,
        );
        assert.match(
          await get('/projects?category=design-systems'),
          /No projects match/,
        );
        assert.match(
          await get('/blog?tag=design-systems'),
          /No articles match/,
        );

        await publishProject(db, project.slug, 2);
        await publishPost(db, post.slug, 2);
        const detail = await get(`/projects/${project.slug}`);
        assert.match(detail, /Updated project/);
        assert.match(detail, /integration-image/);
        assert.match(
          await get('/projects?category=design-systems&technology=css'),
          /Updated project/,
        );
        assert.match(await get('/blog?tag=design-systems'), /Updated article/);
        const article = await get(`/blog/${post.slug}`);
        assert.match(article, /Updated article body/);
        assert.match(
          article,
          /article:published_time" content="2026-11-12T00:00:00.000Z"/,
        );
      },
    );

    await t.test(
      'publishes new slugs without a rebuild and withdraws published slugs immediately',
      async () => {
        await saveProjectDraft(
          db,
          newSlug,
          { ...project, title: 'New public project' },
          0,
        );
        await savePostDraft(
          db,
          newSlug,
          { ...post, title: 'New public article' },
          0,
        );
        await get(`/projects/${newSlug}`, 404);
        await get(`/blog/${newSlug}`, 404);
        assert.doesNotMatch(await get('/'), /href="\/blog"/);
        await publishProject(db, newSlug, 1);
        await publishPost(db, newSlug, 1);
        assert.match(await get(`/projects/${newSlug}`), /New public project/);
        assert.match(await get(`/blog/${newSlug}`), /New public article/);
        assert.match(await get('/'), /href="\/blog"/);
        assert.match(await get('/projects'), /href="\/blog"/);

        await withdrawProject(db, newSlug, 'delete');
        await withdrawPost(db, newSlug, 'delete');
        await withdrawProject(db, project.slug, 'unpublish');
        await withdrawPost(db, post.slug, 'unpublish');
        await seedDemo(db);
        assert.doesNotMatch(await get('/'), /href="\/blog"/);
        for (const [area, slug] of [
          ['projects', project.slug],
          ['blog', post.slug],
          ['projects', newSlug],
          ['blog', newSlug],
        ]) {
          const html = await get(`/${area}/${slug}`, 404);
          assert.doesNotMatch(html, /rel="canonical"|property="og:url"/);
        }
        assert.doesNotMatch(
          await get('/'),
          /Updated project|New public project/,
        );
        assert.doesNotMatch(
          await get('/projects'),
          /Updated project|New public project/,
        );
        assert.doesNotMatch(
          await get('/blog'),
          /Updated article|New public article/,
        );
        assert.doesNotMatch(
          await get('/sitemap.xml'),
          /signal-desk|url-filters-without-client-state|integration-new/,
        );
        await assert.rejects(publishProject(db, newSlug, 1), ContentConflict);
        await assert.rejects(publishPost(db, newSlug, 1), ContentConflict);
      },
    );
  },
);
