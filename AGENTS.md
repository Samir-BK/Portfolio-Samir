# Portfolio development

- Follow `docs/architecture.md` and `docs/development-roadmap.md`. Milestones 1–5 are complete. Milestone 6 covers the public assistant. Begin the Rahti deployment milestone only with the owner's approval.
- Keep the portfolio publicly accessible without sign-in. Authentication, registration, user accounts, sessions, OAuth, an admin dashboard, and admin audit logging are outside scope.
- Keep one Next.js App Router application with strict TypeScript, pnpm, and the committed pnpm lockfile. Preserve the terminal-inspired design and semantic tokens in `src/app/globals.css`.
- Default to Server Components and use explicit client boundaries for browser interaction. Keep public pages in `src/app/(public)/` and database access and provider credentials server-only under `src/server/`.
- Maintain content through Codex, Git, and trusted local tools. Keep the existing PostgreSQL and Prisma setup. Use the publication helpers for database updates so draft edits leave the published snapshot intact. Keep demo seeding local.
- Treat `references/` as read-only. Use original source and assets and check permissions before any reuse.
- Run format, lint, type, test, and build checks before completing an implementation milestone. Record the checks actually run.
