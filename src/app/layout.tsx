import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { profile, profileDescription } from '@/content/portfolio';
import { initializeTheme } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: profile.name,
  description: profileDescription,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initializeTheme }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
