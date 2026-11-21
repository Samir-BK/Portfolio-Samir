import 'server-only';
import {
  isCitationPath,
  maxChatMessageLength,
  maxChatMessages,
  type ChatEvent,
} from '../../lib/chat.ts';
import { groundedClaims } from './answer.ts';
import type { ChatConfig } from './config.ts';
import type { admit } from './limits.ts';
import type { Provider } from './provider.ts';
import {
  isInstructionOverride,
  retrieve,
  unsupported,
  type Source,
} from './retrieval.ts';

type Dependencies = {
  config: () => ChatConfig | undefined;
  reserve: typeof admit;
  knowledge: () => Promise<Source[]>;
  provider: (config: ChatConfig) => Provider;
};

const maxBodyBytes = 8_192;
const encoder = new TextEncoder();
const noCache = { 'Cache-Control': 'no-store' };

function failure(message: string, status: number, retry?: number) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        ...noCache,
        ...(retry === undefined ? {} : { 'Retry-After': String(retry) }),
      },
    },
  );
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort));
  });
}

class RequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function readMessages(request: Request) {
  const invalid =
    'Send one to five nonempty questions of at most 600 characters each.';
  const tooLarge = 'The chat request is too large.';
  const declared = request.headers.get('content-length');
  if (
    declared &&
    (!/^\d+$/.test(declared) || Number(declared) > maxBodyBytes)
  ) {
    throw new RequestError(tooLarge, 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(invalid, 400);
  const body = new Uint8Array(maxBodyBytes);
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(5_000)]);
  let length = 0;
  let finished = false;
  try {
    while (true) {
      const chunk = await abortable(reader.read(), signal);
      if (chunk.done) {
        finished = true;
        break;
      }
      if (length + chunk.value.length > maxBodyBytes)
        throw new RequestError(tooLarge, 413);
      body.set(chunk.value, length);
      length += chunk.value.length;
    }
    const parsed: unknown = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(
        body.subarray(0, length),
      ),
    );
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Object.keys(parsed).length !== 1 ||
      !('messages' in parsed) ||
      !Array.isArray(parsed.messages) ||
      parsed.messages.length < 1 ||
      parsed.messages.length > maxChatMessages ||
      !parsed.messages.every(
        (entry) =>
          typeof entry === 'string' &&
          entry.trim() &&
          entry.length <= maxChatMessageLength,
      )
    ) {
      throw new RequestError(invalid, 400);
    }
    return (parsed.messages as string[]).map((message) => message.trim());
  } catch (error) {
    if (error instanceof RequestError) throw error;
    if (signal.aborted)
      throw new RequestError('The chat request took too long.', 408);
    throw new RequestError(invalid, 400);
  } finally {
    if (!finished) void reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export function createChatHandler(deps: Dependencies) {
  return async function POST(request: Request): Promise<Response> {
    let config;
    try {
      config = deps.config();
    } catch {
      return failure('The portfolio assistant is unavailable.', 503);
    }
    if (!config) return failure('The portfolio assistant is unavailable.', 503);

    const requestUrl = new URL(request.url);
    const origin = config.origin ?? requestUrl.origin;
    if (
      request.headers.get('origin') !== origin ||
      (config.mode === 'fake' &&
        !['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname))
    ) {
      return failure('Chat is available from the portfolio website only.', 403);
    }
    if (
      request.headers
        .get('content-type')
        ?.split(';', 1)[0]
        .trim()
        .toLowerCase() !== 'application/json'
    ) {
      return failure('Send the chat request as JSON.', 415);
    }
    let messages;
    try {
      messages = await readMessages(request);
    } catch (error) {
      if (error instanceof RequestError)
        return failure(error.message, error.status);
      return failure('Invalid chat request.', 400);
    }

    let admission;
    try {
      admission = await deps.reserve(config.limits);
    } catch {
      return failure(
        'The portfolio assistant is temporarily unavailable.',
        503,
      );
    }
    if (!admission.accepted) {
      const message =
        admission.reason === 'budget'
          ? 'The assistant’s usage limit has been reached.'
          : admission.reason === 'busy'
            ? 'The assistant is busy. Try again shortly.'
            : 'Too many chat requests. Try again shortly.';
      return failure(message, 429, admission.retryAfter);
    }

    const abort = new AbortController();
    const deadline = AbortSignal.timeout(config.limits.timeoutMs);
    const signal = AbortSignal.any([request.signal, abort.signal, deadline]);
    const activeConfig = config;
    const release = admission.release;
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (event: ChatEvent) => {
          if (!cancelled && !request.signal.aborted)
            controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        };
        try {
          signal.throwIfAborted();
          emit({ type: 'start' });
          const question = messages.at(-1)!;
          const prior = messages.at(-2);
          const evidence = isInstructionOverride(question)
            ? []
            : retrieve(
                await abortable(deps.knowledge(), signal),
                question,
                prior && !isInstructionOverride(prior) ? prior : undefined,
              ).filter(({ source }) => isCitationPath(source.href));
          const claims = evidence.length
            ? groundedClaims(
                await abortable(
                  deps.provider(activeConfig)(question, evidence, signal),
                  signal,
                ),
                evidence,
              )
            : [];
          signal.throwIfAborted();
          if (!claims?.length) emit({ type: 'delta', text: unsupported });
          else {
            const sources = claims
              .flatMap(({ evidence }) => evidence)
              .map(({ source }) => source)
              .filter(
                (source, index, all) =>
                  all.findIndex(({ href }) => href === source.href) === index,
              );
            emit({ type: 'sources', sources });
            for (const [index, { text }] of claims.entries()) {
              emit({ type: 'delta', text: (index ? '\n\n' : '') + text });
            }
          }
          emit({ type: 'done' });
        } catch {
          emit({
            type: 'error',
            message: deadline.aborted
              ? 'The assistant took too long. Try again.'
              : 'The assistant couldn’t answer right now. Try again.',
          });
        } finally {
          if (!cancelled) controller.close();
          // An expired lease provides recovery if the instance disappears.
          await release().catch(() => undefined);
        }
      },
      cancel() {
        cancelled = true;
        abort.abort();
      },
    });

    return new Response(stream, {
      headers: {
        ...noCache,
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Accel-Buffering': 'no',
      },
    });
  };
}
