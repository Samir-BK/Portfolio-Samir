import { isCitationPath } from '../../lib/chat.ts';
import type { Evidence } from './retrieval.ts';

const forbidden =
  /[<>\u0000-\u001f\u007f]|\b(?:https?:\/\/|www\.|javascript:|data:|postgres(?:ql)?:\/\/)|\]\(|\b(?:sk-|gsk_)[a-z0-9_-]{16,}/i;

function numbers(text: string) {
  return text.match(/\b\d+(?:[.,]\d+)*%?/g) ?? [];
}

export function groundedClaims(value: unknown, candidates: Evidence[]) {
  if (
    !value ||
    typeof value !== 'object' ||
    Object.keys(value).length !== 1 ||
    !('claims' in value) ||
    !Array.isArray(value.claims) ||
    value.claims.length > 3
  )
    return;

  const byId = new Map(candidates.map((item) => [item.id, item]));
  const claims = [];
  let length = 0;
  for (const claim of value.claims) {
    if (
      !claim ||
      typeof claim !== 'object' ||
      Object.keys(claim).length !== 2 ||
      typeof claim.text !== 'string' ||
      !Array.isArray(claim.ids) ||
      claim.ids.length < 1 ||
      claim.ids.length > 3 ||
      !claim.ids.every(Number.isSafeInteger)
    )
      return;
    const text = claim.text.trim();
    length += text.length;
    if (!text || text.length > 600 || length > 1_200 || forbidden.test(text))
      return;
    const cited: Evidence[] = [];
    for (const id of new Set<number>(claim.ids)) {
      const item = byId.get(id);
      if (!item || !isCitationPath(item.source.href)) return;
      cited.push(item);
    }
    const citedNumbers = new Set(cited.flatMap(({ text }) => numbers(text)));
    if (numbers(text).some((number) => !citedNumbers.has(number))) return;
    claims.push({ text, evidence: cited });
  }
  return claims;
}
