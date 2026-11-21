import { chatConfig } from '@/server/chat/config';
import { createChatHandler } from '@/server/chat/handler';
import { loadKnowledge } from '@/server/chat/knowledge';
import { admit } from '@/server/chat/limits';
import { makeProvider } from '@/server/chat/provider';

export const runtime = 'nodejs';
export const POST = createChatHandler({
  config: chatConfig,
  reserve: admit,
  knowledge: loadKnowledge,
  provider: makeProvider,
});
