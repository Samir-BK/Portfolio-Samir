import Link from 'next/link';
import { ContentHeading, ContentPage } from '@/components/content/content-page';
import { PostCard, PostMeta } from '@/components/content/post-card';
import { facetKey } from '@/lib/content';
import { relatedPosts } from '@/server/content';
import { renderMarkdown } from '@/server/markdown';
import { pageMetadata } from '@/server/metadata';
import { requirePost } from '@/server/published-route';

type RouteProps = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: RouteProps) {
  const post = await requirePost((await params).slug);
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    publishedAt: post.publishedAt,
  });
}

export default async function ArticlePage({ params }: RouteProps) {
  const post = await requirePost((await params).slug);
  const related = await relatedPosts(post);

  return (
    <ContentPage area="blog">
      <Link className="project-link content-back" href="/blog" prefetch={false}>
        ← Technical blog
      </Link>
      <article>
        <ContentHeading
          path={post.isDemo ? 'Synthetic technical note' : 'Technical note'}
          title={post.title}
          summary={post.summary}
        >
          <PostMeta post={post} />
          <ul className="badge-list article-tags" aria-label="Article tags">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link href={`/blog?tag=${facetKey(tag)}`} prefetch={false}>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </ContentHeading>
        <div className="article-prose">{renderMarkdown(post.markdown)}</div>
      </article>
      {related.length > 0 && (
        <section className="content-related" aria-labelledby="related-posts">
          <h2 id="related-posts">Related articles</h2>
          <div className="post-list">
            {related.map((entry) => (
              <PostCard key={entry.slug} post={entry} />
            ))}
          </div>
        </section>
      )}
    </ContentPage>
  );
}
