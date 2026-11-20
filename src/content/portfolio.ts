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

type Profile = {
  name: string;
  role: string;
  location: string;
  description: string;
  about: string;
  interests: readonly string[];
  email: string;
  resume: `/${string}.pdf` | null;
  socials: readonly Social[];
};

export const profile: Profile = {
  name: 'Samir B K',
  role: 'Software Developer | AI/ML Enthusiast',
  location: 'Helsinki, Finland',
  description:
    'I study Business Information Technology at Haaga-Helia. My projects span full-stack development, data, and applied machine learning.',
  about:
    'I’m a Business Information Technology student at Haaga-Helia University of Applied Sciences. I’m interested in full-stack development, applied machine learning, and how data can make software more useful. I enjoy exploring new tools and working with others through technical communities, hackathons, and collaborative projects.',
  interests: [
    'Full-stack development',
    'Applied AI and machine learning',
    'Data',
  ],
  email: 'bksamm88@gmail.com',
  resume: null,
  socials: [
    { label: 'GitHub', href: 'https://github.com/Samir-BK', icon: 'github' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/samirbk/',
      icon: 'linkedin',
    },
  ],
};

export const profileDescription = `${profile.name}, software developer and AI/ML enthusiast based in ${profile.location}. Explore projects in full-stack development, machine learning, and data.`;

type SkillGroup = { title: string; items: readonly string[] };

export const skillGroups: readonly SkillGroup[] = [
  {
    title: 'Languages',
    items: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
  },
  { title: 'Frontend', items: ['HTML', 'CSS', 'React', 'Material UI'] },
  { title: 'Backend', items: ['Spring Boot', 'FastAPI', 'Flask'] },
  {
    title: 'AI and machine learning',
    items: ['scikit-learn', 'PyTorch', 'Hugging Face Transformers'],
  },
  {
    title: 'Data',
    items: ['Data analysis', 'PostgreSQL', 'Data visualization'],
  },
  {
    title: 'Development tools',
    items: ['Git', 'Docker Compose', 'GitHub Actions'],
  },
];

export type TimelineEntry = {
  period?: string;
  title: string;
  description: string;
};

export const experience: readonly TimelineEntry[] = [
  {
    period: 'July 2026 – September 2026',
    title: 'Machine Learning Engineering Intern · FlyRank AI',
    description:
      'Contributed to model development and evaluation with the AI development team, using Python, scikit-learn, and production data.',
  },
  {
    period: 'January 2026 – June 2026',
    title: 'Data Team Member · FINE Ecosystem',
    description:
      'Worked with the team to organize and maintain datasets and support reporting and dashboards.',
  },
  {
    period: 'September 2025',
    title: 'Event Staff, Cloakroom Team · Nordic Business Forum',
    description:
      'Supported cloakroom operations, assisted attendees, and helped with event logistics.',
  },
];

export const education: readonly TimelineEntry[] = [
  {
    period: 'January 2025 – July 2028 (expected)',
    title: 'Haaga-Helia University of Applied Sciences',
    description:
      'Bachelor of Business Administration (BBA), Business Information Technology',
  },
  {
    title: 'Orchid Science College',
    description: 'High School, Bio Science and Mathematics',
  },
];
