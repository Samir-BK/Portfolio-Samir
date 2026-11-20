export type QueryValue = string | string[] | undefined;

export function facetKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function readFacet(value: QueryValue) {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? facetKey(first) : '';
}

export function readingMinutes(markdown: string) {
  return Math.max(1, Math.ceil(markdown.trim().split(/\s+/).length / 220));
}
