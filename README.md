# Portfolio

A public, terminal-inspired developer portfolio with a homepage, project case studies, and a technical blog. Visitors can browse without signing in. The personalized project manifest is available for local review, and the development seed still provides labeled synthetic examples. A public AI assistant is planned for a later release. See the [roadmap](docs/development-roadmap.md).

## Requirements and installation

Use the exact Node.js version in `.node-version` and the pnpm version in `package.json`. With Corepack available, use:

```sh
corepack pnpm install --frozen-lockfile
```

Use PostgreSQL 17 locally. With a local role that can create databases, run:

```sh
createdb portfolio_dev
createdb portfolio_test
cp .env.example .env
cp .env.test.example .env.test
```

Set `DATABASE_URL` in `.env` to the connection URL for `portfolio_dev`. Set `TEST_DATABASE_URL` in `.env.test` to the URL for the empty `portfolio_test` database. Prefer a separate test role with no privileges on the development database. Then run:

```sh
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm dev
```

If `db:migrate` reports that `datasource.url` is required, check that `.env` exists at the project root and that `DATABASE_URL` has a value. Prisma's CLI configuration reads `.env` and exported environment variables.

Open http://localhost:3000. The optional seed inserts labeled demo data and preserves existing records, including edits and withdrawn content. It only accepts a local database ending in `_dev` and is blocked in production.

## Commands

| Command             | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`          | Start the development server.                                           |
| `pnpm lint`         | Run ESLint with warnings treated as errors.                             |
| `pnpm typecheck`    | Generate Next.js route types and run strict TypeScript checking.        |
| `pnpm test`         | Check contrast, filter parsing, Markdown safety, and metadata.          |
| `pnpm format`       | Format the project files with Prettier.                                 |
| `pnpm format:check` | Check formatting without writing files.                                 |
| `pnpm db:generate`  | Regenerate the typed Prisma client after a schema change.               |
| `pnpm db:migrate`   | Apply committed migrations to the configured database.                  |
| `pnpm db:seed`      | Insert demo data into the local development database.                   |
| `pnpm test:db`      | Migrate and test an isolated database against the built production app. |
| `pnpm build`        | Build for production.                                                   |
| `pnpm start`        | Serve the production build locally.                                     |

## Structure and environment

- `src/app/` contains the root layout and semantic CSS tokens. `src/app/(public)/` contains the homepage, project gallery and case studies, and technical blog.
- `src/components/` contains shared layout and content UI. `src/content/` holds content types and demo fixtures. `src/server/` owns database access, publication, Markdown rendering, and metadata.
- `prisma/` holds the schema, migrations, and demo seed. Installation generates the typed client from the schema.
- `tests/` contains the design and content checks. `.github/workflows/ci.yml` defines CI.
- `docs/` holds the reference analysis, architecture, and milestone plan. `references/` holds local reference snapshots and is ignored by Git and application tooling.

The theme defaults to your system preference. The header control can override it, and a small head script restores the saved choice before paint. To verify it manually, use your browser's color-scheme and reduced-motion emulation and Tab through the skip link and sample links.

Set `SITE_ORIGIN` in both the build and runtime environments. Canonical URLs, Open Graph URLs, and the sitemap use this value. Local builds use `http://localhost:3000` and tell crawlers to stay out. The gallery supports `technology` and `category` query parameters. The blog supports `tag`.

The demo fixtures have an explicit publication flag and their own labels. Blog posts accept Markdown prose and fenced code. TypeScript, JavaScript, and JSON receive syntax highlighting. Embedded HTML is discarded, and Markdown images render as their alternative text.

## Maintaining content locally

See the [personalization review and local import](docs/personalization.md) for the verified project sources and commands to preview them in a dedicated database.

- Edit the homepage profile, skills, experience, education, and contact links in `src/content/portfolio.ts`. Use only owner-approved copy and media. Review changes in Git and preview them locally.
- Prepare project and article updates in reviewable source files. Use a trusted local script with the helpers in `src/server/publication.ts` to save a draft, publish it, or withdraw it. Verify the change against a local or staging database before applying it to production. Keep credentials outside Git.
- Git tracks the reviewed content changes. The live project and blog routes read PostgreSQL, so their content changes when a database snapshot is published. The demo seed remains for local development. See the [content maintenance workflow](docs/architecture.md#content-maintenance).

## Database verification and deployment

```sh
corepack pnpm build
corepack pnpm test:db
```

If the build environment blocks Turbopack, use `corepack pnpm build --webpack`. The integration command accepts only a separate loopback database ending in `_test`. It applies the migrations, seeds and exercises the production app over HTTP, and removes its own test rows. Use a disposable database for each concurrent test run.

Provide `DATABASE_URL` at runtime. Set `DATABASE_MIGRATION_URL` in the migration environment when using a separate migration credential or a direct endpoint for a pooled database. Apply migrations to staging first, back up production, and run `corepack pnpm db:migrate` as a release step before starting the app. Demo data is never inserted by migrations or builds. Provision approved production content separately.

For a failed release, roll back the app only if it is compatible with the applied schema. Prefer a reviewed forward migration for schema corrections. For data loss or incompatible changes, use the tested backup and restore process. Do not edit an applied migration or run a migration reset against a deployed database.

Public content routes use fresh database reads. Draft edits preserve the published copy, and unpublishing or soft deletion hides content on subsequent requests. Files placed under `public/` are directly accessible and should contain approved media only. Content withdrawal removes public page references. Remove any static media files separately if they also need to be withdrawn.
