import { readFacet, type QueryValue } from '@/lib/content';
import { ContentHeading, ContentPage } from '@/components/content/content-page';
import { EmptyResults, Filters } from '@/components/content/filters';
import { PostCard } from '@/components/content/post-card';
import { postListing } from '@/server/content';
import { pageMetadata } from '@/server/metadata';

export const dynamic = 'force-dynamic';

const summary =
  'Technical notes on software development, with examples and code.';
export const metadata = pageMetadata({
  title: 'Technical blog',
  description: summary,
  path: '/blog',
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, QueryValue>>;
}) {
  const tag = readFacet((await searchParams).tag);
  const { posts, tags } = await postListing(tag);

  return (
    <ContentPage area="blog">
      <ContentHeading path="~/blog" title="Technical blog" summary={summary} />
      <Filters
        action="/blog"
        fields={[{ name: 'tag', label: 'Tag', selected: tag, options: tags }]}
      />
      <section aria-labelledby="post-results">
        <h2 id="post-results" className="result-count">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'}
        </h2>
        {posts.length ? (
          <div className="post-list">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <EmptyResults href="/blog" message="No articles match this tag." />
        )}
      </section>
    </ContentPage>
  );
}
