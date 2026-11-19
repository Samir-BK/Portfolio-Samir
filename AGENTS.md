# Portfolio development

- Use the architecture and acceptance gates in `docs/architecture.md` and `docs/development-roadmap.md`. Start each new milestone only with the owner's approval.
- Keep a single Next.js App Router application. Use strict TypeScript, pnpm, and the committed pnpm lockfile. Keep app-wide styles and semantic tokens in `src/app/globals.css`.
- Default to Server Components. Use explicit client boundaries for browser interaction. Keep future data access and provider credentials in server-only modules under `src/server/`.
- Organize public pages under `src/app/(public)/`. Add admin routes, API handlers, and Prisma only in their approved milestones.
- Milestone 1 is the shell, tokens, verification page, and quality tooling. The real homepage, navigation, portfolio content, database, auth, admin, and chat are later work.
- Treat `references/` as read-only. Use original source and assets and check permissions before any reuse.
- Run format, lint, type, test, and build checks before completing a milestone. Record which checks were actually run.
