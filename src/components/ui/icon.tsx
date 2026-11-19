import type { ReactNode } from 'react';

const paths = {
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  external: <path d="M6 18 18 6M8 6h10v10" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />,
  github: (
    <>
      <path
        d="M9 19c-4 1-4-2-6-2m12 5v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.8-1.6 6.8-7.3a5.7 5.7 0 0 0-1.5-4 5.3 5.3 0 0 0-.2-4s-1.2-.4-4 1.5a15 15 0 0 0-7.2 0C5.1-.2 3.9.2 3.9.2a5.3 5.3 0 0 0-.2 4 5.7 5.7 0 0 0-1.5 4c0 5.7 3.5 6.9 6.8 7.3a3.4 3.4 0 0 0-1 2.6V22"
        transform="translate(1 1) scale(.94)"
      />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7m0-10v.1m4 10v-7m0 3a3 3 0 0 1 6 0v4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
    </>
  ),
  moon: <path d="M20.8 14.1A9 9 0 0 1 9.9 3.2a9 9 0 1 0 10.9 10.9Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  up: <path d="M12 19V5m-6 6 6-6 6 6" />,
} satisfies Record<string, ReactNode>;

export function Icon({
  name,
  className,
}: {
  name: keyof typeof paths;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
