# Portfolio

Milestone 1 establishes the App Router shell, design tokens and a temporary verification page at `/`.

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

- `src/app/` contains the root layout and semantic CSS tokens. `src/app/(public)/` contains the temporary verification page.
- `src/components/` contains shared presentation. Pages and components are Server Components by default. Add explicit client boundaries when browser state is needed.
- `tests/` contains the token contrast checks. `.github/workflows/ci.yml` defines CI.
- `docs/` holds the reference analysis, architecture, and milestone plan. `references/` holds local reference snapshots and is ignored by Git and application tooling.

This milestone requires no environment variables or external services. The light palette is selected by CSS when the system prefers light, so the initial paint needs no theme script. To verify it manually, use your browser's color-scheme and reduced-motion emulation and Tab through the skip link and sample links.

Future environment configuration should document variable names with nonsecret placeholders in `.env.example` and keep local secrets in `.env.local`. Use `NEXT_PUBLIC_` exclusively for values intended for browsers.
