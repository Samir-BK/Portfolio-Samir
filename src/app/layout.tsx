import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Foundation',
  description: 'A verification page for the portfolio design system.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <main id="main-content" className="page-container" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
