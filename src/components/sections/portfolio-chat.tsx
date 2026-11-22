'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type UIEvent,
} from 'react';
import {
  chatRetryDeadline,
  ChatRequestError,
  isChatSubmitKey,
  isCitationPath,
  maxChatMessageLength,
  maxChatMessages,
  readChatConnection,
  type ChatCitation,
  type ChatEvent,
} from '@/lib/chat';

const suggestions = [
  'What skills does Samir use?',
  'How does the Flappy Bird agent learn?',
  'What did Samir work on at FlyRank AI?',
];
const desktopChat = '(min-width: 52rem)';
const disclosureId = 'portfolio-chat';

type ChatDisclosure = HTMLDetailsElement & { visitorToggledChat?: true };

// The native summary can be activated while the application bundle is loading.
const rememberNativeToggle = `(() => {
  const panel = document.currentScript.closest('details');
  panel.querySelector('summary').addEventListener('click', () => {
    panel.visitorToggledChat = true;
  }, { once: true });
})();`;

function subscribeToHydration() {
  return () => {};
}

function alignChat(panel: HTMLDetailsElement) {
  panel.scrollIntoView({ block: 'start', behavior: 'instant' });
}

type Turn = {
  id: number;
  question: string;
  answer: string;
  sources: ChatCitation[];
  problem?: string;
};

export function PortfolioChat({ testMode }: { testMode: boolean }) {
  // Use the browser's native state if it changed between SSR and hydration.
  const [initialOpen] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.getElementById(disclosureId)?.hasAttribute('open') === true,
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const details = useRef<ChatDisclosure>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const chatHistory = useRef<HTMLDivElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const sequence = useRef(0);
  const active = useRef<AbortController | null>(null);

  const attachInput = useCallback((element: HTMLTextAreaElement | null) => {
    input.current = element;
    if (element?.value) setDraft(element.value);
  }, []);

  function clearDraft() {
    if (input.current) input.current.value = '';
    setDraft('');
  }

  useEffect(() => {
    const panel = details.current;
    if (!panel) return;
    const media = window.matchMedia(desktopChat);
    const viewport = window.visualViewport;
    let resizeFrame: number | undefined;
    const updateHeight = () => {
      if (viewport && !media.matches)
        panel.style.setProperty(
          '--chat-viewport-height',
          `${viewport.height}px`,
        );
      else panel.style.removeProperty('--chat-viewport-height');
    };
    const onBreakpoint = () => {
      panel.open = media.matches;
      updateHeight();
    };
    const onViewportResize = () => {
      updateHeight();
      if (
        media.matches ||
        !panel.open ||
        document.activeElement !== input.current
      )
        return;
      if (resizeFrame !== undefined) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = undefined;
        // Firefox can scroll the page to the focused input during a viewport resize.
        const headerBottom =
          document.querySelector('.site-header')?.getBoundingClientRect()
            .bottom ?? 0;
        const visibleTop = Math.max(headerBottom, viewport?.offsetTop ?? 0);
        if (
          !media.matches &&
          panel.open &&
          document.activeElement === input.current &&
          panel.getBoundingClientRect().top < visibleTop
        )
          alignChat(panel);
      });
    };
    updateHeight();
    if (media.matches && !panel.visitorToggledChat) panel.open = true;
    if (!media.matches && panel.open) alignChat(panel);
    media.addEventListener('change', onBreakpoint);
    viewport?.addEventListener('resize', onViewportResize);
    return () => {
      media.removeEventListener('change', onBreakpoint);
      viewport?.removeEventListener('resize', onViewportResize);
      if (resizeFrame !== undefined) window.cancelAnimationFrame(resizeFrame);
      active.current?.abort();
      active.current = null;
    };
  }, []);

  useEffect(() => {
    if (follow.current && transcript.current) {
      const history = chatHistory.current;
      const scroller = history?.clientHeight ? history : transcript.current;
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [turns]);

  function updateFollow(event: UIEvent<HTMLDivElement>) {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    follow.current = scrollHeight - scrollTop - clientHeight < 28;
  }

  useEffect(() => {
    if (retryAt === null) return;
    const deadline = retryAt;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function checkRetryTime() {
      const remaining = deadline - Date.now();
      if (remaining > 0) {
        // The monthly limit can outlast a single browser timeout.
        timer = setTimeout(checkRetryTime, Math.min(remaining, 2_147_483_647));
      } else {
        setRetryAt(null);
        setAnnouncement('You can send questions again.');
      }
    }
    checkRetryTime();
    return () => clearTimeout(timer);
  }, [retryAt]);

  async function send(question: string, retry = false) {
    const text = question.trim();
    if (
      !hydrated ||
      !text ||
      text.length > maxChatMessageLength ||
      active.current ||
      retryAt !== null
    )
      return;
    input.current?.focus({ preventScroll: true });
    const prior = retry ? turns.slice(0, -1) : turns;
    const next: Turn = {
      id: ++sequence.current,
      question: text,
      answer: '',
      sources: [],
    };
    const conversation = [...prior, next].slice(-maxChatMessages);
    const request = new AbortController();
    active.current = request;
    follow.current = true;
    setTurns(conversation);
    clearDraft();
    setPending(true);
    setAnnouncement('Looking for relevant portfolio information.');

    function update(fields: Partial<Turn>) {
      if (active.current === request) {
        setTurns((current) =>
          current.map((turn) =>
            turn.id === next.id ? { ...turn, ...fields } : turn,
          ),
        );
      }
    }

    try {
      const response = await readChatConnection(
        () =>
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: conversation.map((turn) => turn.question),
            }),
            signal: request.signal,
          }),
        request.signal,
      );
      if (!response.ok) {
        const deadline = chatRetryDeadline(
          response.status,
          response.headers.get('Retry-After'),
        );
        const error = await response.json().catch(() => null);
        if (active.current === request && deadline !== null)
          setRetryAt(deadline);
        throw new ChatRequestError(
          typeof error?.error === 'string'
            ? error.error
            : 'Chat is unavailable. Try again.',
        );
      }
      const reader = response.body?.getReader();
      if (!reader)
        throw new ChatRequestError('Chat is unavailable. Try again.');
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';
      let complete = false;
      try {
        while (true) {
          const part = await readChatConnection(
            () => reader.read(),
            request.signal,
          );
          if (part.done) break;
          buffer += decoder.decode(part.value, { stream: true });
          if (buffer.length > 12_000)
            throw new ChatRequestError(
              'The response was too large. Try again.',
            );
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line) continue;
            const event: ChatEvent = JSON.parse(line);
            if (event.type === 'delta') {
              answer += event.text;
              update({ answer });
            } else if (event.type === 'sources') {
              update({
                sources: event.sources.filter(({ href }) =>
                  isCitationPath(href),
                ),
              });
            } else if (event.type === 'error')
              throw new ChatRequestError(event.message);
            else if (event.type === 'done') complete = true;
          }
        }
        if (!complete)
          throw new ChatRequestError(
            'The response was interrupted. Try again.',
          );
      } finally {
        void reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
      if (active.current === request) setAnnouncement('Answer ready.');
    } catch (error) {
      if (request.signal.aborted) return;
      const problem =
        error instanceof ChatRequestError
          ? error.message
          : 'Chat is unavailable. Try again.';
      update({ problem });
      setAnnouncement(problem);
    } finally {
      if (active.current === request) {
        active.current = null;
        setPending(false);
      }
    }
  }

  function stop() {
    active.current?.abort();
    active.current = null;
    setPending(false);
    setTurns((current) =>
      current.map((turn, index) =>
        index === current.length - 1
          ? { ...turn, problem: 'Generation stopped.' }
          : turn,
      ),
    );
    setAnnouncement('Generation stopped.');
    input.current?.focus({ preventScroll: true });
  }

  function clear() {
    active.current?.abort();
    active.current = null;
    setTurns([]);
    clearDraft();
    setPending(false);
    setAnnouncement('Conversation cleared.');
    input.current?.focus({ preventScroll: true });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input.current?.value ?? '');
  }

  const latest = turns.at(-1);
  const coolingDown = retryAt !== null;
  const retryTime = coolingDown
    ? new Date(retryAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';
  return (
    <details
      className="terminal-panel chat-panel"
      id={disclosureId}
      open={initialOpen}
      ref={details}
      onToggle={(event) => {
        if (event.currentTarget.open && !window.matchMedia(desktopChat).matches)
          alignChat(event.currentTarget);
      }}
    >
      <summary className="terminal-header chat-toggle">
        <span className="terminal-mark" aria-hidden="true">
          &gt;_
        </span>
        <span className="chat-title">~/portfolio-assistant</span>
        <span className="terminal-label">
          {testMode ? 'Test mode' : 'Chat'}
        </span>
      </summary>
      <script dangerouslySetInnerHTML={{ __html: rememberNativeToggle }} />
      <div className="terminal-body chat-body">
        <div className="chat-history" ref={chatHistory} onScroll={updateFollow}>
          <p className="terminal-intro">
            Ask about Samir’s published work, skills, education or contact
            details. Avoid sharing personal information.
          </p>
          {turns.length === 0 && (
            <ul className="chat-suggestions" aria-label="Suggested questions">
              {suggestions.map((question) => (
                <li key={question}>
                  <button
                    type="button"
                    disabled={!hydrated || coolingDown}
                    onClick={() => void send(question)}
                  >
                    {question}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {turns.length > 0 && (
            <div
              className="chat-transcript"
              tabIndex={0}
              role="region"
              aria-label="Conversation"
              ref={transcript}
              onScroll={updateFollow}
            >
              <ol>
                {turns.map(({ id, question, answer, sources, problem }) => (
                  <li key={id} className="chat-turn">
                    <p>
                      <strong>You</strong> {question}
                    </p>
                    {(answer || problem || (pending && id === latest?.id)) && (
                      <div>
                        <strong>Assistant</strong>
                        {answer && <p className="chat-answer">{answer}</p>}
                        {problem && <p className="chat-error">{problem}</p>}
                        {pending && id === latest?.id && !answer && (
                          <p>Looking up published sources…</p>
                        )}
                        {sources.length > 0 && (
                          <ul className="chat-sources" aria-label="Sources">
                            {sources.map((source) => (
                              <li key={source.href}>
                                <a href={source.href}>{source.title}</a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <p className="sr-only" role="status" aria-atomic="true">
          {announcement}
          {coolingDown && ` You can try again at ${retryTime}.`}
        </p>
        <form className="chat-form" onSubmit={submit}>
          {!hydrated && (
            <p className="chat-hint">
              You can type now. Sending requires JavaScript.
            </p>
          )}
          <label htmlFor="portfolio-question">Your question</label>
          <textarea
            id="portfolio-question"
            ref={attachInput}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (!isChatSubmitKey(event.nativeEvent)) return;
              event.preventDefault();
              void send(event.currentTarget.value);
            }}
            aria-describedby={
              coolingDown
                ? 'portfolio-question-hint portfolio-chat-cooldown'
                : 'portfolio-question-hint'
            }
            rows={2}
            maxLength={maxChatMessageLength}
            required
          />
          <p id="portfolio-question-hint" className="chat-hint">
            Enter sends. Shift+Enter adds a new line.
          </p>
          {coolingDown && (
            <p id="portfolio-chat-cooldown" className="chat-hint">
              You can try again at {retryTime}.
            </p>
          )}
          <div className="chat-actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={!hydrated || pending || coolingDown || !draft.trim()}
            >
              Send
            </button>
            {pending && (
              <button
                className="button button--secondary"
                type="button"
                onClick={stop}
              >
                Stop
              </button>
            )}
            {!pending && latest?.problem && (
              <button
                className="button button--secondary"
                type="button"
                disabled={coolingDown}
                onClick={() => void send(latest.question, true)}
              >
                Retry
              </button>
            )}
            {turns.length > 0 && (
              <button
                className="button button--secondary"
                type="button"
                onClick={clear}
              >
                Clear conversation
              </button>
            )}
          </div>
        </form>
      </div>
    </details>
  );
}
