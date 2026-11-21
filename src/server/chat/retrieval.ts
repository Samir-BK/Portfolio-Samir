export type Source = {
  id: string;
  title: string;
  href: string;
  terms: string[];
  passages: string[];
};

export type Evidence = {
  id: number;
  source: Pick<Source, 'id' | 'title' | 'href'>;
  text: string;
};

const stop = new Set(
  'a an and are about be can could did do does for from had has have how i in is it me of on or samir s the this to us was were what when where which who will with would you your'.split(
    ' ',
  ),
);

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function keywords(value: string) {
  return [
    ...new Set(
      normalize(value)
        .split(' ')
        .filter((word) => word.length > 1 && !stop.has(word)),
    ),
  ];
}

export function retrieve(
  sources: Source[],
  question: string,
  previous?: string,
): Evidence[] {
  const normalized = ' ' + normalize(question) + ' ';
  const current = keywords(question);
  const followUp = /\b(it|that|this|there|they|its|those)\b/i.test(question);
  const rank = (query: string, words: string[]) =>
    sources.map((source) => {
      const heading = new Set(
        keywords([source.title, ...source.terms].join(' ')),
      );
      const body = new Set(keywords(source.passages.join(' ')));
      const phrase = source.terms.some((term) =>
        query.includes(' ' + normalize(term) + ' '),
      );
      return {
        source,
        score:
          (phrase ? 12 : 0) +
          words.reduce(
            (sum, word) =>
              sum + (heading.has(word) ? 4 : body.has(word) ? 1 : 0),
            0,
          ),
      };
    });
  const ranked = rank(normalized, current);
  const contextual =
    followUp && previous && !ranked.some(({ score }) => score >= 4)
      ? rank(' ' + normalize(previous) + ' ', keywords(previous))
      : ranked;

  const selected = contextual
    .filter(({ score }) => score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const evidence = selected.flatMap(({ source }) => {
    const passages = source.passages
      .filter(
        (text) =>
          !/(?:postgres(?:ql)?:\/\/|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b[A-Z_]*(?:API_KEY|SECRET_KEY|PASSWORD)\s*=|\b(?:sk-|gsk_)[a-z0-9_-]{16,})/i.test(
            text,
          ),
      )
      .map((text) => ({
        text,
        score: keywords(text).filter((word) => current.includes(word)).length,
      }))
      .sort((a, b) => b.score - a.score);
    return passages.slice(0, 3).map(({ text }) => ({
      source: {
        id: source.id,
        title: source.title.slice(0, 160),
        href: source.href,
      },
      text: text.slice(0, 600),
    }));
  });
  return evidence.map((entry, index) => ({ id: index + 1, ...entry }));
}

export function isInstructionOverride(question: string) {
  return (
    /\b(?:system prompt|developer message|api key|private (?:phone|email)|credentials?|secret (?:key|token))\b/i.test(
      question,
    ) ||
    /\b(?:ignore|override|disregard|forget|bypass)\b.{0,45}\b(?:instructions?|rules?|polic(?:y|ies)|previous|system)\b/i.test(
      question,
    )
  );
}

export const unsupported =
  'I don’t have enough published portfolio information to answer that.';
