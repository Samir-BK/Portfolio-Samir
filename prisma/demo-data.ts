import type { PrismaClient } from '../src/generated/prisma/client.ts';
import { postFixtures } from '../src/content/posts.ts';
import { projectFixtures } from '../src/content/projects.ts';
import {
  postVersionData,
  projectVersionData,
} from '../src/server/publication.ts';

const projectDemoDate = new Date('2026-11-01T00:00:00Z');

export async function seedDemo(db: PrismaClient) {
  await db.$transaction(
    async (tx) => {
      for (const [featuredOrder, project] of projectFixtures.entries()) {
        const { slug, published } = project;
        const { count } = await tx.project.createMany({
          data: { slug, isDemo: true },
          skipDuplicates: true,
        });
        if (!count) continue;
        const { id: projectId } = await tx.project.findUniqueOrThrow({
          where: { slug },
        });
        const data = projectVersionData({ ...project, featuredOrder });
        await tx.projectVersion.create({
          data: { projectId, stage: 'DRAFT', ...data },
        });
        if (published) {
          await tx.projectVersion.create({
            data: {
              projectId,
              stage: 'PUBLISHED',
              publishedAt: projectDemoDate,
              ...data,
            },
          });
        }
      }
      for (const post of postFixtures) {
        const { slug, published, publishedAt } = post;
        const { count } = await tx.post.createMany({
          data: { slug, isDemo: true },
          skipDuplicates: true,
        });
        if (!count) continue;
        const { id: postId } = await tx.post.findUniqueOrThrow({
          where: { slug },
        });
        const data = postVersionData(post);
        await tx.postVersion.create({
          data: { postId, stage: 'DRAFT', ...data },
        });
        if (published) {
          await tx.postVersion.create({
            data: {
              postId,
              stage: 'PUBLISHED',
              publishedAt: new Date(publishedAt),
              ...data,
            },
          });
        }
      }
    },
    { timeout: 20_000 },
  );
}
