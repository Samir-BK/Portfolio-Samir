export const maxChatMessages = 5;
export const maxChatMessageLength = 600;

export class ChatRequestError extends Error {}

export async function readChatConnection<T>(
  read: () => Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  try {
    return await read();
  } catch {
    signal.throwIfAborted();
    throw new ChatRequestError(
      'Connection lost. Check your internet connection and try again.',
    );
  }
}

export function isChatSubmitKey(
  event: Pick<
    KeyboardEvent,
    | 'key'
    | 'shiftKey'
    | 'altKey'
    | 'ctrlKey'
    | 'metaKey'
    | 'isComposing'
    | 'keyCode'
  >,
) {
  return (
    event.key === 'Enter' &&
    !event.shiftKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.isComposing &&
    event.keyCode !== 229
  );
}

export function chatRetryDeadline(
  status: number,
  retryAfter: string | null,
  now = Date.now(),
) {
  // The chat route sends Retry-After as a whole number of seconds.
  if (status !== 429 || !retryAfter || !/^\d+$/.test(retryAfter)) return null;
  const deadline = now + Number(retryAfter) * 1_000;
  return deadline > now && Number.isSafeInteger(deadline) && deadline <= 8.64e15
    ? deadline
    : null;
}

export type ChatCitation = { id: string; title: string; href: string };
export type ChatEvent =
  | { type: 'start' }
  | { type: 'delta'; text: string }
  | { type: 'sources'; sources: ChatCitation[] }
  | { type: 'done' }
  | { type: 'error'; message: string };

export function isCitationPath(href: string) {
  return (
    ['/projects', '/#about', '/#skills', '/#journey', '/#contact'].includes(
      href,
    ) || /^\/(?:projects|blog)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(href)
  );
}
