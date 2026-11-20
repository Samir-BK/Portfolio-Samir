import 'server-only';
import { notFound } from 'next/navigation.js';
import { cache } from 'react';
import { findPost, findProject } from './content.ts';

export const requireProject = cache(async (slug: string) => {
  const project = await findProject(slug);
  if (!project) notFound();
  return project;
});

export const requirePost = cache(async (slug: string) => {
  const post = await findPost(slug);
  if (!post) notFound();
  return post;
});
