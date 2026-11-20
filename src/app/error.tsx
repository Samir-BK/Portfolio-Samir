'use client';

import Link from 'next/link';

export default function PortfolioError() {
  return (
    <main className="content-page site-width" id="main-content" tabIndex={-1}>
      <div className="content-heading">
        <h1>Content unavailable</h1>
        <p className="content-summary">
          Please try loading the page again in a moment.
        </p>
      </div>
      <Link href="/" className="project-link">
        Portfolio home
      </Link>
    </main>
  );
}
