import Link from 'next/link';
import type { PublishedPost } from '@/content/posts';
import { readingMinutes } from '@/lib/content';

const dateFormat = new Intl.DateTimeFormat('en', {
  dateStyle: 'long',
  timeZone: 'UTC',
});

export function PostMeta({ post }: { post: PublishedPost }) {
  return (
    <p className="post-meta">
      <time dateTime={post.publishedAt}>
        {dateFormat.format(new Date(post.publishedAt))}
      </time>
      <span>{readingMinutes(post.markdown)} min read</span>
    </p>
  );
}

export function PostCard({ post }: { post: PublishedPost }) {
  return (
    <article className="post-card">
      <PostMeta post={post} />
      {post.isDemo && <p className="meta-label">Synthetic example</p>}
      <h3>
        <Link href={`/blog/${post.slug}`} prefetch={false}>
          {post.title}
        </Link>
      </h3>
      <p>{post.summary}</p>
      <ul className="badge-list" aria-label="Article tags">
        {post.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </article>
  );
}
