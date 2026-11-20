import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export function ContentPage({
  area,
  children,
}: {
  area: 'projects' | 'blog' | 'other';
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader page={area} />
      <main className="content-page" id="main-content" tabIndex={-1}>
        <div className="site-width">{children}</div>
      </main>
      <SiteFooter home={false} />
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
