# Portfolio

Milestone 2 adds a single-page developer portfolio at `/` using clearly labeled sample content.

## Requirements and installation

Use the exact Node.js version in `.node-version` and the pnpm version in `package.json`. With Corepack available, use:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. Use pnpm for dependency changes and commit only `pnpm-lock.yaml` as the lockfile. On the initial checkout, if the lockfile has yet to be generated, run `pnpm install --lockfile-only` before the frozen install.

## Commands

| Command             | Purpose                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `pnpm dev`          | Start the development server.                                    |
| `pnpm lint`         | Run ESLint with warnings treated as errors.                      |
| `pnpm typecheck`    | Generate Next.js route types and run strict TypeScript checking. |
| `pnpm test`         | Check design-token contrast in both palettes.                    |
| `pnpm format`       | Format the project files with Prettier.                          |
| `pnpm format:check` | Check formatting without writing files.                          |
| `pnpm build`        | Build for production.                                            |
| `pnpm start`        | Serve the production build locally.                              |

## Structure and environment

- `src/app/` contains the root layout and semantic CSS tokens. `src/app/(public)/` contains the homepage.
- `src/components/` contains layout, homepage sections, and shared UI. `src/content/portfolio.ts` contains the sample profile, projects, and timeline. Pages and components are Server Components by default. Add explicit client boundaries when browser state is needed.
- `tests/` contains the token contrast checks. `.github/workflows/ci.yml` defines CI.
- `docs/` holds the reference analysis, architecture, and milestone plan. `references/` holds local reference snapshots and is ignored by Git and application tooling.

This milestone requires no environment variables or external services. The theme defaults to your system preference. The header control can override it, and a small head script restores the saved choice before paint. To verify it manually, use your browser's color-scheme and reduced-motion emulation and Tab through the skip link and sample links.

Future environment configuration should document variable names with nonsecret placeholders in `.env.example` and keep local secrets in `.env.local`. Use `NEXT_PUBLIC_` exclusively for values intended for browsers.
