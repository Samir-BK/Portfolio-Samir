import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chatRetryDeadline,
  ChatRequestError,
  isChatSubmitKey,
  readChatConnection,
} from '../src/lib/chat.ts';

test('submits only plain Enter outside IME composition', () => {
  const enter = {
    key: 'Enter',
    keyCode: 13,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    isComposing: false,
  };
  assert.equal(isChatSubmitKey(enter), true);
  for (const flag of [
    'shiftKey',
    'ctrlKey',
    'altKey',
    'metaKey',
    'isComposing',
  ]) {
    assert.equal(isChatSubmitKey({ ...enter, [flag]: true }), false, flag);
  }
  assert.equal(isChatSubmitKey({ ...enter, keyCode: 229 }), false);
  assert.equal(isChatSubmitKey({ ...enter, key: 'Escape' }), false);
});

test('applies the route’s Retry-After seconds only to HTTP 429', () => {
  const now = Date.UTC(2026, 10, 21);
  assert.equal(chatRetryDeadline(429, '3', now), now + 3_000);
  assert.equal(chatRetryDeadline(429, '2678400', now), now + 2_678_400_000);
  assert.equal(chatRetryDeadline(503, '30', now), null);
  for (const header of [
    null,
    '',
    '0',
    '-1',
    '3.5',
    'later',
    '9999999999999999',
  ])
    assert.equal(chatRetryDeadline(429, header, now), null, String(header));
});

test('chat reports a dropped connection safely and can retry', async () => {
  let attempts = 0;
  const request = async () => {
    if (++attempts === 1) throw new TypeError('Failed to fetch');
    return new Response('Fake provider reply');
  };
  await assert.rejects(
    readChatConnection(request, new AbortController().signal),
    {
      message: 'Connection lost. Check your internet connection and try again.',
    },
  );
  const response = await readChatConnection(
    request,
    new AbortController().signal,
  );
  assert.equal(await response.text(), 'Fake provider reply');
  assert.equal(attempts, 2);
});

test('chat distinguishes a dropped response stream from Stop', async () => {
  const reader = new ReadableStream({
    start(controller) {
      controller.error(new TypeError('Socket closed'));
    },
  }).getReader();
  await assert.rejects(
    readChatConnection(() => reader.read(), new AbortController().signal),
    ChatRequestError,
  );
  reader.releaseLock();

  const controller = new AbortController();
  const stop = new DOMException('Visitor stopped generation', 'AbortError');
  controller.abort(stop);
  await assert.rejects(
    readChatConnection(
      () => Promise.reject(new TypeError()),
      controller.signal,
    ),
    (error) => error === stop,
  );
});
