export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof sections)[number]['id'];

type Social = {
  label: string;
  href: string;
  icon: 'github' | 'linkedin';
};

export const profile = {
  name: 'Your Name',
  role: 'Software developer',
  availability: 'Availability · sample',
  description:
    'I build web interfaces and the systems behind them, with an eye for accessibility, clear code, and the small details people notice.',
  about:
    'I’m interested in the whole path from an idea to a working product. That includes how an interface feels, how data moves through the system, and how easily someone else can maintain it.',
  interests: [
    'Accessible interfaces',
    'API and data design',
    'Developer tooling',
  ],
  email: 'hello@example.invalid',
  resume: '/resume-placeholder.txt',
  socials: [
    { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
  ] satisfies readonly Social[],
} as const;

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: readonly string[];
  visual: 'queue' | 'trace' | 'notes';
  href: string;
};

export const projects: readonly Project[] = [
  {
    id: 'signal-desk',
    title: 'Signal Desk',
    category: 'Workflow',
    description:
      'A concept for sorting incoming support requests and making the next action clear.',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL'],
    visual: 'queue',
    href: 'https://example.com/?project=signal-desk',
  },
  {
    id: 'traceboard',
    title: 'Traceboard',
    category: 'Developer tooling',
    description:
      'A concept for exploring request traces and finding where a service call slows down.',
    technologies: ['React', 'Node.js', 'OpenTelemetry'],
    visual: 'trace',
    href: 'https://example.com/?project=traceboard',
  },
  {
    id: 'field-notes',
    title: 'Field Notes',
    category: 'Knowledge tools',
    description:
      'A concept for organizing technical notes with tags, Markdown, and quick search.',
    technologies: ['TypeScript', 'Tailwind CSS', 'Markdown'],
    visual: 'notes',
    href: 'https://example.com/?project=field-notes',
  },
];

type SkillGroup = { title: string; items: readonly string[] };

export const skillGroups: readonly SkillGroup[] = [
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  },
  { title: 'Backend', items: ['Node.js', 'REST APIs', 'PostgreSQL', 'SQL'] },
  { title: 'Engineering', items: ['Git', 'Testing', 'Accessibility', 'CI/CD'] },
];

export type TimelineEntry = {
  period: string;
  title: string;
  description: string;
};

export const experience: readonly TimelineEntry[] = [
  {
    period: 'Sample role',
    title: 'Software developer',
    description:
      'Build web interfaces, design API boundaries, and test critical user flows.',
  },
  {
    period: 'Sample project',
    title: 'Independent practice',
    description:
      'Explore smaller tools, prototypes, and experiments in web engineering.',
  },
];

export const education: readonly TimelineEntry[] = [
  {
    period: 'Sample coursework',
    title: 'Software engineering',
    description:
      'Example study areas include databases, web development, and software design.',
  },
];
