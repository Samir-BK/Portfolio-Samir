import 'server-only';
import type { Project } from '../content/projects.ts';
import type { Post } from '../content/posts.ts';
import type { Prisma, PrismaClient } from '../generated/prisma/client.ts';
import { facetKey } from '../lib/content.ts';

type ProjectDraft = Omit<Project, 'slug' | 'published'> & {
  featuredOrder?: number;
};
type PostDraft = Pick<Post, 'title' | 'summary' | 'markdown' | 'tags'>;
type Mode = 'unpublish' | 'delete';

export class ContentConflict extends Error {
  constructor() {
    super('The draft version has changed or the content no longer exists.');
  }
}

function topic(label: string) {
  const key = facetKey(label);
  if (!key) throw new Error('A topic must have a URL-safe key.');
  return { key, label };
}

function topics(labels: readonly string[]) {
  return labels.map((label, position) => ({ ...topic(label), position }));
}

export function projectVersionData(draft: ProjectDraft) {
  const {
    title,
    summary,
    overview,
    problem,
    approach,
    decisions,
    challenges,
    lessons,
    visual,
    featured,
    featuredOrder = 0,
    repositoryUrl,
    demoUrl,
    category,
    technologies,
    media,
  } = draft;
  return {
    title,
    summary,
    overview,
    problem,
    approach,
    decisions,
    challenges,
    lessons,
    visual,
    featured,
    featuredOrder,
    repositoryUrl: repositoryUrl ?? null,
    demoUrl: demoUrl ?? null,
    category: { create: topic(category) },
    technologies: { create: topics(technologies) },
    media: {
      create:
        media?.map(({ src, alt, width, height }, position) => {
          if (
            !/^\/(?![/\\])/.test(src) ||
            /[\\\s]/.test(src) ||
            width < 1 ||
            height < 1
          ) {
            throw new Error(
              'Project media requires a local path and positive dimensions.',
            );
          }
          return { src, alt, width, height, position };
        }) ?? [],
    },
  } satisfies Omit<Prisma.ProjectVersionCreateWithoutProjectInput, 'stage'>;
}

export function postVersionData(draft: PostDraft) {
  const { tags, title, summary, markdown } = draft;
  return { title, summary, markdown, tags: { create: topics(tags) } };
}

// All writes for one slug acquire the same parent row lock before reading its versions.
async function lockProject(tx: Prisma.TransactionClient, slug: string) {
  const { count } = await tx.project.updateMany({
    where: { slug, deletedAt: null },
    data: { updatedAt: new Date() },
  });
  if (!count) throw new ContentConflict();
  return tx.project.findUniqueOrThrow({
    where: { slug },
    select: { id: true },
  });
}

async function lockPost(tx: Prisma.TransactionClient, slug: string) {
  const { count } = await tx.post.updateMany({
    where: { slug, deletedAt: null },
    data: { updatedAt: new Date() },
  });
  if (!count) throw new ContentConflict();
  return tx.post.findUniqueOrThrow({ where: { slug }, select: { id: true } });
}

export function saveProjectDraft(
  db: PrismaClient,
  slug: string,
  input: ProjectDraft,
  expectedVersion: number,
) {
  return db.$transaction(async (tx) => {
    if (expectedVersion === 0)
      await tx.project.createMany({ data: { slug }, skipDuplicates: true });
    const { id: projectId } = await lockProject(tx, slug);
    const key = { projectId, stage: 'DRAFT' } as const;
    const current = await tx.projectVersion.findUnique({
      where: { projectId_stage: key },
    });
    if ((current?.version ?? 0) !== expectedVersion)
      throw new ContentConflict();
    const version = expectedVersion + 1;
    const data = projectVersionData(input);
    if (!current) {
      await tx.projectVersion.create({ data: { ...data, ...key, version } });
    } else {
      await tx.projectVersion.update({
        where: { id: current.id },
        data: {
          ...data,
          version,
          category: {
            upsert: {
              create: data.category.create,
              update: data.category.create,
            },
          },
          technologies: { deleteMany: {}, create: data.technologies.create },
          media: { deleteMany: {}, create: data.media.create },
        },
      });
    }
    return version;
  });
}

export function savePostDraft(
  db: PrismaClient,
  slug: string,
  input: PostDraft,
  expectedVersion: number,
) {
  return db.$transaction(async (tx) => {
    if (expectedVersion === 0)
      await tx.post.createMany({ data: { slug }, skipDuplicates: true });
    const { id: postId } = await lockPost(tx, slug);
    const key = { postId, stage: 'DRAFT' } as const;
    const current = await tx.postVersion.findUnique({
      where: { postId_stage: key },
    });
    if ((current?.version ?? 0) !== expectedVersion)
      throw new ContentConflict();
    const version = expectedVersion + 1;
    const data = postVersionData(input);
    if (!current) {
      await tx.postVersion.create({ data: { ...data, ...key, version } });
    } else {
      await tx.postVersion.update({
        where: { id: current.id },
        data: {
          ...data,
          version,
          tags: { deleteMany: {}, create: data.tags.create },
        },
      });
    }
    return version;
  });
}

export function publishProject(
  db: PrismaClient,
  slug: string,
  expectedVersion: number,
) {
  return db.$transaction(async (tx) => {
    const { id: projectId } = await lockProject(tx, slug);
    const draft = await tx.projectVersion.findUnique({
      where: { projectId_stage: { projectId, stage: 'DRAFT' } },
      include: { category: true, technologies: true, media: true },
    });
    if (!draft || draft.version !== expectedVersion)
      throw new ContentConflict();
    if (!draft.category) throw new Error('Project category is missing.');
    const key = { projectId, stage: 'PUBLISHED' } as const;
    const live = await tx.projectVersion.findUnique({
      where: { projectId_stage: key },
    });
    if (live?.version === expectedVersion) return;
    const {
      title,
      summary,
      overview,
      problem,
      approach,
      decisions,
      challenges,
      lessons,
      visual,
      featured,
      featuredOrder,
      repositoryUrl,
      demoUrl,
    } = draft;
    await tx.projectVersion.deleteMany({ where: key });
    await tx.projectVersion.create({
      data: {
        ...key,
        version: draft.version,
        publishedAt: live?.publishedAt ?? new Date(),
        title,
        summary,
        overview,
        problem,
        approach,
        decisions,
        challenges,
        lessons,
        visual,
        featured,
        featuredOrder,
        repositoryUrl,
        demoUrl,
        category: {
          create: { key: draft.category.key, label: draft.category.label },
        },
        technologies: {
          create: draft.technologies.map(({ key, label, position }) => ({
            key,
            label,
            position,
          })),
        },
        media: {
          create: draft.media.map(({ src, alt, width, height, position }) => ({
            src,
            alt,
            width,
            height,
            position,
          })),
        },
      },
    });
  });
}

export function publishPost(
  db: PrismaClient,
  slug: string,
  expectedVersion: number,
) {
  return db.$transaction(async (tx) => {
    const { id: postId } = await lockPost(tx, slug);
    const draft = await tx.postVersion.findUnique({
      where: { postId_stage: { postId, stage: 'DRAFT' } },
      include: { tags: true },
    });
    if (!draft || draft.version !== expectedVersion)
      throw new ContentConflict();
    const key = { postId, stage: 'PUBLISHED' } as const;
    const live = await tx.postVersion.findUnique({
      where: { postId_stage: key },
    });
    if (live?.version === expectedVersion) return;
    await tx.postVersion.deleteMany({ where: key });
    await tx.postVersion.create({
      data: {
        ...key,
        version: draft.version,
        publishedAt: live?.publishedAt ?? new Date(),
        title: draft.title,
        summary: draft.summary,
        markdown: draft.markdown,
        tags: {
          create: draft.tags.map(({ key, label, position }) => ({
            key,
            label,
            position,
          })),
        },
      },
    });
  });
}

export function withdrawProject(db: PrismaClient, slug: string, mode: Mode) {
  return db.$transaction(async (tx) => {
    const { id } = await lockProject(tx, slug);
    if (mode === 'delete') {
      await tx.project.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      await tx.projectVersion.deleteMany({
        where: { projectId: id, stage: 'PUBLISHED' },
      });
    }
  });
}

export function withdrawPost(db: PrismaClient, slug: string, mode: Mode) {
  return db.$transaction(async (tx) => {
    const { id } = await lockPost(tx, slug);
    if (mode === 'delete') {
      await tx.post.update({ where: { id }, data: { deletedAt: new Date() } });
    } else {
      await tx.postVersion.deleteMany({
        where: { postId: id, stage: 'PUBLISHED' },
      });
    }
  });
}
