export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  technologies: readonly string[];
  published: boolean;
  featured: boolean;
  visual: 'queue' | 'trace' | 'notes';
  overview: string;
  problem: string;
  approach: string;
  decisions: string;
  challenges: string;
  lessons: string;
  media?: readonly {
    src: `/${string}`;
    alt: string;
    width: number;
    height: number;
  }[];
  repositoryUrl?: string;
  demoUrl?: string;
};

export const projectFixtures: readonly Project[] = [
  {
    slug: 'signal-desk',
    title: 'Signal Desk',
    summary:
      'A concept for sorting incoming support requests and making the next action clear.',
    category: 'Workflow',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL'],
    published: true,
    featured: true,
    visual: 'queue',
    overview:
      'An illustrative support inbox that groups synthetic requests into a triage queue. A detail view would keep the original request and its status history together.',
    problem:
      'A shared inbox obscures ownership when several people can update the same request. The queue should make it obvious which items still need a decision and who last changed them.',
    approach:
      'Start with an unassigned view, then add explicit assignment and status actions. Exercise each transition with sample requests, including duplicate submits and two open browser tabs.',
    decisions:
      'Use server-rendered queue reads and a transactional write for the change and its audit event. A version column provides a clear conflict signal when a request changes after it was opened.',
    challenges:
      'Filtering can hide a request immediately after an update. Preserve the user’s filter, confirm the update in context, and offer a link to reopen the request from its new state.',
    lessons:
      'The design exercise shows why an explicit state transition is easier to reason about than an editable status field. Throughput and response times remain unmeasured.',
  },
  {
    slug: 'traceboard',
    title: 'Traceboard',
    summary:
      'A concept for exploring request traces and finding where a service call slows down.',
    category: 'Developer tooling',
    technologies: ['React', 'Node.js', 'OpenTelemetry', 'TypeScript'],
    published: true,
    featured: true,
    visual: 'trace',
    overview:
      'A trace explorer designed around a synthetic request that passes through a gateway, a service, and a database. The waterfall and a text summary tell the same timing story.',
    problem:
      'A total request duration rarely identifies where work accumulated. The representation needs to show wait time, parallel spans, and incomplete instrumentation clearly.',
    approach:
      'Normalize spans into a common format, build the parent-child tree, then render elapsed time against one trace-wide scale. Include fixtures for parallel calls and missing spans.',
    decisions:
      'Separate trace decoding from presentation. Keep timings in a consistent unit and expose an ordered text view so the graph is optional for understanding a trace.',
    challenges:
      'Clock skew can make child spans appear to start before their parent. Flag the inconsistency and keep the source timestamps visible so the viewer can distinguish instrumentation issues from application behavior.',
    lessons:
      'The synthetic examples favor clear handling of missing or inconsistent data over a denser graph. Production traces and performance benchmarks are outside this example.',
  },
  {
    slug: 'field-notes',
    title: 'Field Notes',
    summary:
      'A concept for organizing technical notes with tags, Markdown, and quick search.',
    category: 'Knowledge tools',
    technologies: ['TypeScript', 'Tailwind CSS', 'Markdown'],
    published: true,
    featured: true,
    visual: 'notes',
    overview:
      'A small notebook concept that makes a note easy to find by title, topic, or a memorable phrase. All example notes are synthetic.',
    problem:
      'Useful notes become hard to rediscover once filenames and folder placement stop matching how people remember them.',
    approach:
      'Define a consistent note shape, normalize tags, and start with deterministic text matching. Use a small Markdown subset that supports technical examples without executing embedded content.',
    decisions:
      'Keep title, tags, and body separate from the search view. Prefer an explicit relevance rule that can be tested with a short, representative set of queries.',
    challenges:
      'An acronym may match many notes while a title query has an obvious intended result. Weight exact title matches above partial tag and body matches, then keep ties stable.',
    lessons:
      'With a small fixture set, transparent scoring is easy to explain and test. A larger corpus would justify evaluating a dedicated text index against real queries.',
  },
  {
    slug: 'draft-project',
    title: 'Private project fixture',
    summary: 'An unpublished fixture for visibility tests.',
    category: 'Draft category',
    technologies: ['Draft technology'],
    published: false,
    featured: true,
    visual: 'notes',
    overview: '',
    problem: '',
    approach: '',
    decisions: '',
    challenges: '',
    lessons: '',
  },
];

export type PublishedProject = Omit<Project, 'published'> & { isDemo: boolean };
