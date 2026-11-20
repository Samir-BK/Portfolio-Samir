import 'server-only';
import type { PublishedPost } from '../content/posts.ts';
import type { PublishedProject } from '../content/projects.ts';
import type { Prisma } from '../generated/prisma/client.ts';
import { facetKey } from '../lib/content.ts';
import { readDatabase } from './db.ts';

const projectVisibility = {
  stage: 'PUBLISHED',
  project: { deletedAt: null },
} satisfies Prisma.ProjectVersionWhereInput;

const postVisibility = {
  stage: 'PUBLISHED',
  post: { deletedAt: null },
} satisfies Prisma.PostVersionWhereInput;

const projectInclude = {
  project: { select: { slug: true, isDemo: true } },
  category: true,
  technologies: { orderBy: { position: 'asc' } },
  media: { orderBy: { position: 'asc' } },
} satisfies Prisma.ProjectVersionInclude;

const postInclude = {
  post: { select: { slug: true, isDemo: true } },
  tags: { orderBy: { position: 'asc' } },
} satisfies Prisma.PostVersionInclude;

function toProject(
  row: Prisma.ProjectVersionGetPayload<{ include: typeof projectInclude }>,
): PublishedProject {
  if (!row.category) throw new Error('Project category is missing.');
  const {
    title,
    summary,
    featured,
    visual,
    overview,
    problem,
    approach,
    decisions,
    challenges,
    lessons,
    repositoryUrl,
    demoUrl,
  } = row;
  return {
    ...row.project,
    title,
    summary,
    featured,
    visual,
    overview,
    problem,
    approach,
    decisions,
    challenges,
    lessons,
    repositoryUrl: repositoryUrl ?? undefined,
    demoUrl: demoUrl ?? undefined,
    category: row.category.label,
    technologies: row.technologies.map(({ label }) => label),
    media: row.media.map(({ src, alt, width, height }) => ({
      src: src as `/${string}`,
      alt,
      width,
      height,
    })),
  };
}

function toPost(
  row: Prisma.PostVersionGetPayload<{ include: typeof postInclude }>,
): PublishedPost {
  if (!row.publishedAt) throw new Error('Publication date is missing.');
  return {
    ...row.post,
    title: row.title,
    summary: row.summary,
    markdown: row.markdown,
    publishedAt: row.publishedAt.toISOString(),
    tags: row.tags.map(({ label }) => label),
  };
}

type ProjectFilters = { technology?: string; category?: string };

async function queryProjects(
  tx: Prisma.TransactionClient,
  filters: ProjectFilters = {},
) {
  const { technology, category } = filters;
  const rows = await tx.projectVersion.findMany({
    where: {
      ...projectVisibility,
      ...(technology && { technologies: { some: { key: technology } } }),
      ...(category && { category: { key: category } }),
    },
    include: projectInclude,
    orderBy: [
      { featured: 'desc' },
      { featuredOrder: 'asc' },
      { projectId: 'asc' },
    ],
  });
  return rows.map(toProject);
}

export function listProjects(filters: ProjectFilters = {}) {
  return readDatabase((tx) => queryProjects(tx, filters));
}

export function findProject(slug: string) {
  return readDatabase(async (tx) => {
    const row = await tx.projectVersion.findFirst({
      where: {
        ...projectVisibility,
        project: { ...projectVisibility.project, slug },
      },
      include: projectInclude,
    });
    return row ? toProject(row) : undefined;
  });
}

async function queryPosts(tx: Prisma.TransactionClient, tag?: string) {
  const rows = await tx.postVersion.findMany({
    where: { ...postVisibility, ...(tag && { tags: { some: { key: tag } } }) },
    include: postInclude,
    orderBy: [{ publishedAt: 'desc' }, { postId: 'asc' }],
  });
  return rows.map(toPost);
}

export function hasPublishedArticles() {
  return readDatabase(async (tx) => {
    const article = await tx.postVersion.findFirst({
      where: {
        ...postVisibility,
        post: { ...postVisibility.post, isDemo: false },
      },
      select: { id: true },
    });
    return Boolean(article);
  });
}

export function listPosts(tag?: string) {
  return readDatabase((tx) => queryPosts(tx, tag));
}

export function findPost(slug: string) {
  return readDatabase(async (tx) => {
    const row = await tx.postVersion.findFirst({
      where: { ...postVisibility, post: { ...postVisibility.post, slug } },
      include: postInclude,
    });
    return row ? toPost(row) : undefined;
  });
}

function listFacets(values: readonly string[]) {
  return [...new Map(values.map((label) => [facetKey(label), label])).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function projectGallery(filters: ProjectFilters) {
  return readDatabase(async (tx) => {
    const all = await queryProjects(tx);
    return {
      projects:
        filters.technology || filters.category
          ? await queryProjects(tx, filters)
          : all,
      technologies: listFacets(all.flatMap((project) => project.technologies)),
      categories: listFacets(all.map((project) => project.category)),
    };
  });
}

export function postListing(tag?: string) {
  return readDatabase(async (tx) => {
    const all = await queryPosts(tx);
    return {
      posts: tag ? await queryPosts(tx, tag) : all,
      tags: listFacets(all.flatMap((post) => post.tags)),
    };
  });
}

export function publishedLocations() {
  return readDatabase(async (tx) => {
    const projects = await tx.projectVersion.findMany({
      where: projectVisibility,
      select: { project: { select: { slug: true } }, updatedAt: true },
      orderBy: { projectId: 'asc' },
    });
    const posts = await tx.postVersion.findMany({
      where: postVisibility,
      select: { post: { select: { slug: true } }, updatedAt: true },
      orderBy: [{ publishedAt: 'desc' }, { postId: 'asc' }],
    });
    return { projects, posts };
  });
}

function relatedBy<T extends { slug: string }>(
  current: T,
  entries: readonly T[],
  topics: (entry: T) => readonly string[],
) {
  const currentTopics = new Set(topics(current).map(facetKey));
  return entries
    .filter(({ slug }) => slug !== current.slug)
    .map((entry) => ({
      entry,
      overlap: topics(entry).filter((topic) =>
        currentTopics.has(facetKey(topic)),
      ).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 2)
    .map(({ entry }) => entry);
}

export async function relatedProjects(project: PublishedProject) {
  return relatedBy(project, await listProjects(), (entry) => [
    entry.category,
    ...entry.technologies,
  ]);
}

export async function relatedPosts(post: PublishedPost) {
  return relatedBy(post, await listPosts(), (entry) => entry.tags);
}
