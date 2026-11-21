import 'server-only';
import { siteConfiguration } from '../metadata.ts';

export type ChatLimits = {
  perMinute: number;
  perDay: number;
  perMonth: number;
  concurrent: number;
  timeoutMs: number;
};

export type ChatConfig = {
  origin?: string;
  limits: ChatLimits;
} & ({ mode: 'groq'; model: string; key: string } | { mode: 'fake' });

function integer(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  min: number,
  max: number,
) {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (
    !/^\d+$/.test(raw) ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error('Invalid assistant limit: ' + name);
  }
  return value;
}

export function chatConfig(env = process.env): ChatConfig | undefined {
  if (env.AI_CHAT_ENABLED !== 'true') return;
  const provider = env.AI_PROVIDER;
  const fake = provider === 'fake' && env.NODE_ENV === 'development';
  const key = env.GROQ_API_KEY?.trim();
  const model = env.GROQ_MODEL?.trim() || 'openai/gpt-oss-20b';
  if (
    !fake &&
    (provider !== 'groq' ||
      !key ||
      !/^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/i.test(model) ||
      model.length > 120)
  )
    return;
  const origin = env.SITE_ORIGIN
    ? siteConfiguration(env.SITE_ORIGIN).origin
    : undefined;
  if (!origin && env.NODE_ENV === 'production') return;
  const limits = {
    perMinute: integer(env, 'AI_CHAT_PER_MINUTE', 8, 1, 120),
    perDay: integer(env, 'AI_CHAT_PER_DAY', 50, 1, 10_000),
    perMonth: integer(env, 'AI_CHAT_PER_MONTH', 500, 1, 100_000),
    concurrent: integer(env, 'AI_CHAT_CONCURRENT', 2, 1, 20),
    timeoutMs: integer(env, 'AI_CHAT_TIMEOUT_MS', 20_000, 1_000, 60_000),
  };
  return fake
    ? { mode: 'fake', origin, limits }
    : { mode: 'groq', model, key: key!, origin, limits };
}

export function assistantMode() {
  try {
    return chatConfig()?.mode ?? 'disabled';
  } catch {
    return 'disabled';
  }
}
