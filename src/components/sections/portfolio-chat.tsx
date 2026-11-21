'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  isCitationPath,
  maxChatMessageLength,
  maxChatMessages,
  type ChatCitation,
  type ChatEvent,
} from '@/lib/chat';

const suggestions = [
  'What skills does Samir use?',
  'How does the Flappy Bird agent learn?',
  'What did Samir work on at FlyRank AI?',
];

type Turn = {
  id: number;
  question: string;
  answer: string;
  sources: ChatCitation[];
  problem?: string;
};

export function PortfolioChat({ testMode }: { testMode: boolean }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const details = useRef<HTMLDetailsElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const sequence = useRef(0);
  const active = useRef<AbortController | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 52rem)');
    const update = () => {
      if (details.current) details.current.open = media.matches;
    };
    update();
    media.addEventListener('change', update);
    return () => {
      media.removeEventListener('change', update);
      active.current?.abort();
      active.current = null;
    };
  }, []);

  useEffect(() => {
    if (follow.current && transcript.current)
      transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [turns]);

  async function send(question: string, retry = false) {
    const text = question.trim();
    if (!text || text.length > maxChatMessageLength || active.current) return;
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
    setDraft('');
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation.map((turn) => turn.question),
        }),
        signal: request.signal,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          typeof error?.error === 'string'
            ? error.error
            : 'Chat is unavailable. Try again.',
        );
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Chat is unavailable. Try again.');
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';
      let complete = false;
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          buffer += decoder.decode(part.value, { stream: true });
          if (buffer.length > 12_000)
            throw new Error('The response was too large. Try again.');
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
            } else if (event.type === 'error') throw new Error(event.message);
            else if (event.type === 'done') complete = true;
          }
        }
        if (!complete)
          throw new Error('The response was interrupted. Try again.');
      } finally {
        void reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
      if (active.current === request) setAnnouncement('Answer ready.');
    } catch (error) {
      if (request.signal.aborted) return;
      const problem =
        error instanceof Error
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
    setDraft('');
    setPending(false);
    setAnnouncement('Conversation cleared.');
    input.current?.focus({ preventScroll: true });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  const latest = turns.at(-1);
  return (
    <details className="terminal-panel chat-panel" ref={details}>
      <summary className="terminal-header chat-toggle">
        <span className="terminal-mark" aria-hidden="true">
          &gt;_
        </span>
        <span className="chat-title">~/portfolio-assistant</span>
        <span className="terminal-label">
          {testMode ? 'Test mode' : 'Chat'}
        </span>
      </summary>
      <div className="terminal-body chat-body">
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
                  onClick={() => {
                    input.current?.focus({ preventScroll: true });
                    void send(question);
                  }}
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
            onScroll={(event) => {
              const { scrollHeight, scrollTop, clientHeight } =
                event.currentTarget;
              follow.current = scrollHeight - scrollTop - clientHeight < 28;
            }}
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
        <p className="sr-only" role="status" aria-atomic="true">
          {announcement}
        </p>
        <form className="chat-form" onSubmit={submit}>
          <label htmlFor="portfolio-question">Your question</label>
          <textarea
            id="portfolio-question"
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            maxLength={maxChatMessageLength}
            required
          />
          <div className="chat-actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={pending || !draft.trim()}
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
                onClick={() => {
                  input.current?.focus({ preventScroll: true });
                  void send(latest.question, true);
                }}
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
