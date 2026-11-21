export const maxChatMessages = 5;
export const maxChatMessageLength = 600;

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
