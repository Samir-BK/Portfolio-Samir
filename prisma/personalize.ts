import { isDeepStrictEqual } from 'node:util';
import { personalizedProjects } from '../src/content/personalized-projects.ts';
import { postFixtures } from '../src/content/posts.ts';
import { projectFixtures } from '../src/content/projects.ts';
import { createDatabase } from '../src/server/db.ts';
import {
  projectVersionData,
  publishProject,
  saveProjectDraft,
  withdrawPost,
  withdrawProject,
} from '../src/server/publication.ts';
import { localDatabaseUrl } from './local-database.ts';

const mode = process.argv[2] ?? '--plan';
const retireExamples = process.argv[3] === '--retire-examples';
if (
  !['--plan', '--draft', '--publish'].includes(mode) ||
  (process.argv.length > 3 && (!retireExamples || mode !== '--publish')) ||
  process.argv.length > 4
) {
  throw new Error('Use --plan, --draft, or --publish [--retire-examples].');
}

const target = process.env.PERSONALIZATION_DATABASE_URL;
if (process.env.NODE_ENV === 'production' || !target) {
  throw new Error(
    'Set PERSONALIZATION_DATABASE_URL to the dedicated local personalization database.',
  );
}
const url = localDatabaseUrl(target, 'dev');
if (new URL(url).pathname !== '/portfolio_personalization_dev') {
  throw new Error(
    'This import only accepts the local portfolio_personalization_dev database.',
  );
}

const db = createDatabase(url);
try {
  // Preflight the entire manifest before making writes. Changes to an existing draft
  // require review rather than silently replacing it.
  const plan = [];
  for (const project of personalizedProjects) {
    const existing = await db.project.findUnique({
      where: { slug: project.slug },
      include: {
        versions: {
          include: {
            category: { select: { key: true, label: true } },
            technologies: {
              select: { key: true, label: true, position: true },
              orderBy: { position: 'asc' },
            },
            media: {
              select: {
                src: true,
                alt: true,
                width: true,
                height: true,
                position: true,
              },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
    const draft = existing?.versions.find(({ stage }) => stage === 'DRAFT');
    const live = existing?.versions.find(({ stage }) => stage === 'PUBLISHED');
    const { category, technologies, media, ...fields } =
      projectVersionData(project);
    const desired = {
      ...fields,
      category: category.create,
      technologies: technologies.create,
      media: media.create,
    };
    const matches = (row: NonNullable<typeof draft>) =>
      Object.entries(desired).every(([key, value]) =>
        isDeepStrictEqual(row[key as keyof typeof desired], value),
      );
    if (
      existing &&
      (existing.isDemo ||
        existing.deletedAt ||
        !draft ||
        !matches(draft) ||
        (live && (!matches(live) || live.version !== draft.version)))
    ) {
      throw new Error(
        `Existing project differs from the reviewed manifest: ${project.slug}`,
      );
    }
    plan.push({
      project,
      version: draft?.version ?? 0,
      published: Boolean(live),
    });
  }

  const exampleProjects = await db.project.findMany({
    where: {
      slug: { in: projectFixtures.map(({ slug }) => slug) },
      isDemo: true,
      deletedAt: null,
      versions: { some: { stage: 'PUBLISHED' } },
    },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  });
  const examplePosts = await db.post.findMany({
    where: {
      slug: { in: postFixtures.map(({ slug }) => slug) },
      isDemo: true,
      deletedAt: null,
      versions: { some: { stage: 'PUBLISHED' } },
    },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  });

  for (const entry of plan) {
    const { project, published } = entry;
    let { version } = entry;
    if (mode !== '--plan' && version === 0) {
      version = await saveProjectDraft(db, project.slug, project, 0);
    }
    if (mode === '--publish' && !published) {
      await publishProject(db, project.slug, version);
    }
    const status =
      published || mode === '--publish'
        ? 'published'
        : version
          ? 'draft'
          : 'ready to import';
    console.log(
      `Project ${project.slug}: ${status}${version ? ` (version ${version})` : ''}`,
    );
  }

  for (const { slug } of exampleProjects) {
    if (retireExamples) await withdrawProject(db, slug, 'unpublish');
    console.log(
      `Demo project ${slug}: ${retireExamples ? 'unpublished' : 'retained'}`,
    );
  }
  for (const { slug } of examplePosts) {
    if (retireExamples) await withdrawPost(db, slug, 'unpublish');
    console.log(
      `Demo post ${slug}: ${retireExamples ? 'unpublished' : 'retained'}`,
    );
  }
} finally {
  await db.$disconnect();
}
