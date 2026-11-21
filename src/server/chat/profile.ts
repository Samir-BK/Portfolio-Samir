import 'server-only';
import {
  education,
  experience,
  profile,
  skillGroups,
} from '../../content/portfolio.ts';
import type { Source } from './retrieval.ts';

export const profilePublicationId = 'portfolio-homepage';

export function publicProfileSources(): Source[] {
  return [
    {
      id: 'about',
      title: 'About Samir',
      href: '/#about',
      terms: [
        'samir b k',
        'about samir',
        'who is samir',
        'helsinki',
        'location',
        'based',
        'background',
        'interests',
      ],
      passages: [
        `${profile.name} is based in ${profile.location}. His portfolio headline is ${profile.role}.`,
        profile.about,
      ],
    },
    {
      id: 'skills',
      title: 'Skills',
      href: '/#skills',
      terms: [
        'skills',
        'tools',
        'languages',
        'stack',
        'frontend',
        'backend',
        'full stack',
        'data analysis',
      ],
      passages: skillGroups.map(
        ({ title, items }) => `${title}: ${items.join(', ')}.`,
      ),
    },
    ...experience.map(({ title, description, period }, index) => ({
      id: 'experience-' + index,
      title,
      href: '/#journey',
      terms: [
        'experience',
        'employment',
        'work history',
        ...(index === 0
          ? [
              'flyrank',
              'internship',
              'intern',
              'model evaluation',
              'production data',
            ]
          : index === 1
            ? ['fine ecosystem', 'dashboards', 'reporting']
            : ['nordic business forum', 'event staff']),
      ],
      passages: [`${title} (${period}). ${description}`],
    })),
    {
      id: 'education',
      title: 'Education',
      href: '/#journey',
      terms: [
        'education',
        'degree',
        'studies',
        'study',
        'studying',
        'school',
        'haaga helia',
        'orchid science college',
        'graduation',
      ],
      passages: education.map(
        ({ title, period, description }) =>
          `${title}. ${description}${period ? '. ' + period : ''}.`,
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      href: '/#contact',
      terms: [
        'contact',
        'reach',
        'email',
        'linkedin',
        'github profile',
        'get in touch',
      ],
      passages: [
        `Samir’s public contact email is ${profile.email}. His GitHub and LinkedIn profiles are linked from the contact section.`,
      ],
    },
  ];
}
