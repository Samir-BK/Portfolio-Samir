import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { hasPublishedArticles } from '@/server/content';

export async function ContentPage({
  area,
  children,
}: {
  area: 'projects' | 'blog' | 'other';
  children: ReactNode;
}) {
  const showBlog =
    area !== 'other' && (await hasPublishedArticles().catch(() => false));
  return (
    <>
      <SiteHeader page={area} showBlog={showBlog} />
      <main className="content-page" id="main-content" tabIndex={-1}>
        <div className="site-width">{children}</div>
      </main>
      <SiteFooter home={false} showBlog={showBlog} />
    </>
  );
}

export function ContentHeading({
  path,
  title,
  summary,
  children,
}: {
  path: string;
  title: string;
  summary: string;
  children?: ReactNode;
}) {
  return (
    <header className="content-heading">
      <p className="meta-label">{path}</p>
      <h1>{title}</h1>
      <p className="content-summary">{summary}</p>
      {children}
    </header>
  );
}
