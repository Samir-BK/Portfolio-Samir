export type Post = {
  slug: string;
  title: string;
  summary: string;
  tags: readonly string[];
  published: boolean;
  publishedAt: string;
  markdown: string;
};

export const postFixtures: readonly Post[] = [
  {
    slug: 'url-filters-without-client-state',
    title: 'Put gallery filters in the URL',
    summary:
      'A native form can give a project gallery linkable filters, refresh persistence, and a working no-JavaScript path.',
    tags: ['Next.js', 'TypeScript', 'Accessibility'],
    published: true,
    publishedAt: '2026-11-12',
    markdown: [
      '## Start with a shareable state',
      '',
      'A filter changes which results someone can see. A URL gives that selection a durable home: people can share the result, refresh it, and step back through their previous choices. This synthetic example uses a native GET form and a server-owned content reader.',
      '',
      '## Normalize at the boundary',
      '',
      'Read the recognized keys once, then pass a small filter object into the content layer. Empty values should behave like a cleared filter. Repeated keys should have a predictable interpretation.',
      '',
      '```ts',
      'function firstFilter(value: string | string[] | undefined) {',
      '  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;',
      '}',
      '```',
      '',
      '## Treat empty results as a real state',
      '',
      'A shared link can outlive the tag it uses. Keep the requested value visible, explain that the combination returned no matches, and offer a link that clears the filters.',
      '',
      'Test a direct URL and a reload with scripts disabled. Then check keyboard access to every filter and confirm that a bookmarked result matches what the form produced.',
      '',
      'The [project gallery](/projects) demonstrates the pattern with sample data.',
    ].join('\n'),
  },
  {
    slug: 'readable-trace-waterfalls',
    title: 'Make a trace waterfall readable',
    summary:
      'A sample request trace illustrates how to show offsets, parallel work, and missing spans.',
    tags: ['Observability', 'TypeScript'],
    published: true,
    publishedAt: '2026-11-07',
    markdown: [
      '## Agree on a clock and a unit',
      '',
      'Each span needs a start offset and duration in the same unit. Choose a trace-wide origin before calculating any positions. This illustrative dataset shows one request; it does not describe a real service.',
      '',
      '```json',
      '{',
      '  "span": "lookup",',
      '  "startMs": 18,',
      '  "durationMs": 42,',
      '  "incomplete": false',
      '}',
      '```',
      '',
      '## Preserve the parent relationship',
      '',
      'Two spans can overlap even when one starts earlier. Group spans by parent and make ordering deterministic for ties. If the parent is missing, show the detached span and identify the gap in the trace.',
      '',
      '## Make the timing available as text',
      '',
      'The visual bars give a quick overview. A label with the start offset and duration lets a reader compare spans without interpreting color, width, or position.',
      '',
      'Add fixtures for parallel spans, clock skew, and missing parents. Compare the numbers in the text view with the positions used by the chart.',
    ].join('\n'),
  },
  {
    slug: 'accessible-code-examples',
    title: 'Code examples that survive a narrow screen',
    summary:
      'Keep fenced code readable and keyboard-scrollable while preserving the surrounding article layout.',
    tags: ['Accessibility', 'Markdown'],
    published: true,
    publishedAt: '2026-11-02',
    markdown: [
      '## Keep prose and code in separate layouts',
      '',
      'Let paragraphs wrap naturally. Give a long code sample a scroll container so a single line cannot widen the whole page. In this synthetic example, a language label tells readers what the block contains.',
      '',
      '## Make the reading order explicit',
      '',
      'A code block should sit directly after the idea it demonstrates. When it scrolls horizontally, make the region keyboard focusable and give it an accessible name.',
      '',
      '```ts',
      '// Keep the display name separate from the language identifier.',
      'const language = { id: "ts", label: "TypeScript" };',
      '```',
      '',
      '## Keep Markdown inert',
      '',
      'Use Markdown for the article structure and choose a limited set of rendered elements. Plain code should be escaped even when it looks like a tag, and a link should stay within the URL schemes you explicitly support.',
      '',
      'Check contrast in both themes and read the article without highlighting. Color can help scan syntax, while the text and punctuation still carry the meaning.',
    ].join('\n'),
  },
  {
    slug: 'draft-post',
    title: 'Private article fixture',
    summary: 'An unpublished fixture for visibility tests.',
    tags: ['Draft tag', 'TypeScript'],
    published: false,
    publishedAt: '2026-11-18',
    markdown: '## Unpublished example',
  },
];

export type PublishedPost = Omit<Post, 'published'> & { isDemo: boolean };
