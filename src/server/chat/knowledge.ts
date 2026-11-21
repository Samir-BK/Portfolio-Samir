import 'server-only';
import { isDeepStrictEqual } from 'node:util';
import { marked } from 'marked';
import { readDatabase } from '../db.ts';
import { postVisibility, projectVisibility } from '../content.ts';
import { profilePublicationId, publicProfileSources } from './profile.ts';
import { isCitationPath } from '../../lib/chat.ts';
import type { Source } from './retrieval.ts';

const aliases: Record<string, string[]> = {
  'personal-trainer': [
    'personal trainer',
    'training app',
    'fitness goals',
    'spring boot',
    'university api',
  ],
  'flappy-bird-dqn': [
    'flappy bird',
    'dqn',
    'reinforcement learning',
    'replay buffer',
    'target network',
  ],
  'creator-scout': [
    'creatorscout',
    'creator scout',
    'creator discovery',
    'fit scoring',
    'streamlit',
  ],
  'text-summarizer-app': [
    'text summarizer',
    't5',
    'dialogue',
    'fastapi',
    'beam search',
  ],
  mailbrief: [
    'mailbrief',
    'mail brief',
    'email summary',
    'email summarization',
    'flask',
  ],
  'cnn-image-classification': [
    'cnn',
    'cifar 10',
    'image classifier',
    'computer vision',
    'torchvision',
  ],
};

export function loadKnowledge(): Promise<Source[]> {
  return readDatabase(async (tx) => {
    const profile = await tx.assistantProfilePublication.findUnique({
      where: { id: profilePublicationId },
      select: { sections: true },
    });
    const approved = publicProfileSources();
    // An outdated or hand-edited snapshot must not contradict the public homepage.
    const sources = isDeepStrictEqual(profile?.sections, approved)
      ? (profile?.sections as Source[])
      : [];
    const projects = await tx.projectVersion.findMany({
      where: {
        ...projectVisibility,
        project: { ...projectVisibility.project, isDemo: false },
      },
      orderBy: { projectId: 'asc' },
      take: 30,
      select: {
        title: true,
        summary: true,
        overview: true,
        approach: true,
        decisions: true,
        challenges: true,
        project: { select: { slug: true } },
        technologies: { select: { label: true }, orderBy: { position: 'asc' } },
      },
    });
    const portfolioProjects: Source[] = projects.flatMap((project) => {
      const { slug } = project.project;
      const href = '/projects/' + slug;
      if (!isCitationPath(href)) return [];
      const technologies = project.technologies.map(({ label }) => label);
      return [
        {
          id: 'project:' + slug,
          title: project.title,
          href,
          terms: [
            project.title,
            ...technologies,
            ...(Object.hasOwn(aliases, slug) ? aliases[slug] : []),
          ],
          passages: [
            `${project.title} is described in a project case study. ${project.summary}`,
            `${project.title} uses ${technologies.join(', ')}.`,
            project.overview,
            project.approach,
            project.decisions,
            project.challenges,
          ].filter(Boolean),
        },
      ];
    });

    const posts = await tx.postVersion.findMany({
      where: {
        ...postVisibility,
        post: { ...postVisibility.post, isDemo: false },
      },
      orderBy: [{ publishedAt: 'desc' }, { postId: 'asc' }],
      take: 30,
      select: {
        title: true,
        summary: true,
        markdown: true,
        post: { select: { slug: true } },
        tags: { select: { label: true } },
      },
    });
    const articles: Source[] = posts.flatMap((post) => {
      const href = '/blog/' + post.post.slug;
      if (!isCitationPath(href)) return [];
      const passages = marked
        .lexer(post.markdown.slice(0, 8_000))
        .flatMap((token) =>
          token.type === 'paragraph' && typeof token.text === 'string'
            ? [
                token.text
                  .replace(/<[^>]+>/g, '')
                  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1'),
              ]
            : [],
        );
      return [
        {
          id: 'post:' + post.post.slug,
          title: post.title,
          href,
          terms: [post.title, ...post.tags.map(({ label }) => label)],
          passages: [post.summary, ...passages.slice(0, 12)],
        },
      ];
    });
    return [
      ...sources,
      ...(portfolioProjects.length
        ? [
            {
              id: 'projects',
              title: 'Project gallery',
              href: '/projects',
              terms: [
                'projects',
                'github projects',
                'case studies',
                'portfolio projects',
              ],
              passages: [
                'The published project gallery includes ' +
                  portfolioProjects.map(({ title }) => title).join(', ') +
                  '.',
              ],
            },
          ]
        : []),
      ...portfolioProjects,
      ...articles,
    ];
  });
}
