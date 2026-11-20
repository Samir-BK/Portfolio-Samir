export function localDatabaseUrl(
  value: string | undefined,
  mode: 'dev' | 'test',
) {
  const variable = mode === 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
  const message = `${variable} must point to a local PostgreSQL database ending in _${mode}. The only supported URL option is sslmode=disable.`;
  let url: URL;
  try {
    url = new URL(value ?? '');
  } catch {
    throw new Error(message);
  }

  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    !new RegExp(`^/[a-z][a-z0-9_]*_${mode}$`).test(url.pathname) ||
    (url.search !== '' && url.search !== '?sslmode=disable') ||
    url.hash
  )
    throw new Error(message);

  return url.href;
}
