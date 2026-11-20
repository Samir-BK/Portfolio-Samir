import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderMarkdown } from '../src/server/markdown.ts';

function html(markdown) {
  return renderToStaticMarkup(renderMarkdown(markdown));
}

test('preserves prose, formatting and allowed internal and external links', () => {
  const output = html(
    '# Article section\n\nA &amp; B **bold** [gallery](/projects) [external](https://example.com/path).\n\n1. First\n2. Second',
  );
  assert.match(output, /<h2>Article section<\/h2>/);
  assert.match(output, /A &amp; B <strong>bold<\/strong>/);
  assert.match(output, /<a href="\/projects">gallery<\/a>/);
  assert.match(output, /<a href="https:\/\/example.com\/path">external<\/a>/);
  assert.match(output, /<ol start="1"><li>First<\/li><li>Second<\/li><\/ol>/);
});

test('drops raw HTML and embeds, preserving labels of rejected links and images', () => {
  const output = html(
    [
      '<script>alert("script")</script>',
      '<iframe src="https://example.com"></iframe>',
      '',
      'Here is <img src=x onerror=alert(1)> [unsafe](javascript:alert%281%29), [obfuscated](javascript&#58;alert%281%29), [external relative](//example.com), and ![diagram](https://example.com/diagram.svg).',
    ].join('\n'),
  );
  assert.doesNotMatch(output, /<script|<iframe|<img|onerror|href=|src=/i);
  assert.match(output, /unsafe, obfuscated, external relative, and diagram/);
});

test('fenced code is labeled, keyboard-focusable, highlighted and escaped', () => {
  const fence = String.fromCharCode(96).repeat(3);
  const output = html(fence + 'ts\nconst sample = "<img src=x>";\n' + fence);
  assert.match(output, /<figcaption>TypeScript<\/figcaption>/);
  assert.match(output, /<pre tabindex="0" aria-label="TypeScript code"><code>/);
  assert.match(output, /<span class="code-keyword">const<\/span>/);
  assert.match(output, /&lt;img src=x&gt;/);
  assert.doesNotMatch(output, /<img/);
});
