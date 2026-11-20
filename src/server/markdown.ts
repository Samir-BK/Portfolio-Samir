import { marked, type MarkedToken, type Token } from 'marked';
import { createElement as element, Fragment, type ReactNode } from 'react';
import { httpUrl } from '../lib/urls.ts';

const codeLanguages: Record<string, string> = {
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  json: 'JSON',
};

const scriptSyntax =
  /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\x60(?:\\.|[^\x60\\])*\x60)|(?<keyword>\b(?:const|let|type|return|function|export|import|string|undefined|true|false|null|if|else|new)\b)|(?<number>\b\d+(?:\.\d+)?\b)/g;

const jsonSyntax =
  /(?<string>"(?:\\.|[^"\\])*")|(?<keyword>\b(?:true|false|null)\b)|(?<number>-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g;

function highlight(value: string, syntax: RegExp) {
  const parts: ReactNode[] = [];
  let offset = 0;
  for (const match of value.matchAll(syntax)) {
    const index = match.index;
    const kind = Object.keys(match.groups ?? {}).find(
      (key) => match.groups?.[key],
    );
    parts.push(
      value.slice(offset, index),
      element('span', { key: index, className: 'code-' + kind }, match[0]),
    );
    offset = index + match[0].length;
  }
  parts.push(value.slice(offset));
  return parts;
}

function codeBlock(value: string, info?: string) {
  const language = info?.toLowerCase().split(/\s+/, 1)[0] ?? '';
  const label = Object.hasOwn(codeLanguages, language)
    ? codeLanguages[language]
    : 'Plain text';
  const code =
    label === 'Plain text'
      ? value
      : highlight(value, language === 'json' ? jsonSyntax : scriptSyntax);

  return element(
    'figure',
    { className: 'code-sample' },
    element('figcaption', null, label),
    element(
      'pre',
      { tabIndex: 0, 'aria-label': label + ' code' },
      element('code', null, code),
    ),
  );
}

const textEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

function textValue(value: string) {
  // Marked escapes inline text for HTML output. React expects plain text and escapes it again.
  return value.replace(
    /&(amp|lt|gt|quot|apos);/g,
    (_, name: string) => textEntities[name],
  );
}

function markdownHref(value: string) {
  if (value.startsWith('#')) return value;
  if (/^\/(?![/\\])/.test(value) && !/[\u0000-\u0020\u007f\\]/.test(value))
    return value;
  return httpUrl(value)?.href;
}

function renderTokens(tokens: readonly Token[]): ReactNode {
  return tokens.map((item, index) =>
    element(Fragment, { key: index }, renderToken(item)),
  );
}

function renderToken(item: Token): ReactNode {
  // The lexer uses only built-in tokens because Markdown extensions are disabled.
  const token = item as MarkedToken;

  switch (token.type) {
    case 'heading':
      return element(
        'h' + Math.max(2, token.depth),
        null,
        renderTokens(token.tokens),
      );
    case 'paragraph':
      return element('p', null, renderTokens(token.tokens));
    case 'blockquote':
      return element('blockquote', null, renderTokens(token.tokens));
    case 'list':
      return element(
        token.ordered ? 'ol' : 'ul',
        token.ordered ? { start: token.start } : null,
        renderTokens(token.items),
      );
    case 'list_item':
      return element('li', null, renderTokens(token.tokens));
    case 'em':
    case 'strong':
    case 'del':
      return element(token.type, null, renderTokens(token.tokens));
    case 'link': {
      const href = markdownHref(token.href);
      const label = renderTokens(token.tokens);
      return href ? element('a', { href }, label) : label;
    }
    case 'image':
      return renderTokens(token.tokens);
    case 'codespan':
      return element('code', null, token.text);
    case 'code':
      return codeBlock(token.text, token.lang);
    case 'text':
      return token.tokens ? renderTokens(token.tokens) : textValue(token.text);
    case 'escape':
      return textValue(token.text);
    case 'br':
    case 'hr':
      return element(token.type);
    default:
      return null;
  }
}

export function renderMarkdown(markdown: string): ReactNode {
  return renderTokens(marked.lexer(markdown, { gfm: false, pedantic: false }));
}
