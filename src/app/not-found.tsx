import Link from 'next/link';
import { ContentHeading, ContentPage } from '@/components/content/content-page';

export default function NotFound() {
  return (
    <ContentPage area="other">
      <ContentHeading
        path="404"
        title="Page not found"
        summary="This address does not point to a published page."
      />
      <nav className="content-links" aria-label="Find another page">
        <Link href="/projects" className="button button--primary">
          Project gallery
        </Link>
        <Link href="/blog" className="button button--secondary">
          Technical blog
        </Link>
      </nav>
    </ContentPage>
  );
}
