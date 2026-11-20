# Technical architecture

## Public site and deployment

The portfolio is publicly accessible. Visitors can browse the site without signing in or registering. The owner maintains content through Codex, Git, and trusted local tools. Accounts, OAuth, sessions, an admin dashboard, and admin audit logging are outside the project scope.

Use one Node.js deployment of **Next.js App Router** in strict **TypeScript**, with **Tailwind CSS** and **Motion for React**. Retain the existing **PostgreSQL** database, **Prisma** client, models, and migrations.

| Area                 | Design                                                                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public routes        | Server Components render the homepage, project gallery, case studies, and technical blog. Project and blog filters use shareable URL query parameters. Page metadata, canonical URLs, and the sitemap reflect published content.                                    |
| UI and accessibility | Keep the responsive terminal-inspired design, semantic CSS tokens, visible keyboard focus, accessible navigation, and reduced-motion support. Use Client Components where browser interaction requires them.                                                        |
| Content reads        | Server Components call the server-only Prisma data layer. Lists, detail pages, metadata, and the sitemap apply the same published-only visibility rules. Keep publication-sensitive reads fresh. Verify publish and withdrawal behavior before introducing caching. |
| Content maintenance  | Keep approved source material and reviewed content changes in Git. Apply database changes through trusted local or release tools using the existing publication helpers. Database credentials remain server-side.                                                   |
| Hosting              | Prefer managed Node.js hosting and PostgreSQL. Use separate development, testing, staging, and production databases. Apply Prisma migrations as a release step. Keep approved media in the project or on an approved media origin.                                  |

Public routes live in `src/app/(public)/`. Shared UI lives in `src/components/`. The homepage profile lives in `src/content/portfolio.ts`. Database access and publication helpers live in `src/server/`. Prisma schema, migrations, and the development-only seed live in `prisma/`.

## Content maintenance

1. **Edit and review in Git.** Use Codex and local tools to update the homepage bio, skills, experience, education, résumé, and public contact links. Prepare approved project and article copy, slugs, and media in reviewable files. Commit material only after it is cleared for everyone who can access that repository.
2. **Preview with a local database.** The running site reads projects and posts from PostgreSQL. Editing a fixture file or committing copy does not update those rows. A trusted local script can call the existing server-side draft and publication helpers in `src/server/publication.ts`. The current `db:seed` command inserts synthetic data for development.
3. **Publish an approved snapshot.** Exercise the exact data change in staging before applying it in the intended environment. Save drafts with the expected version to catch conflicting edits. Publishing replaces the live snapshot atomically. Saving a draft leaves the live version intact. Unpublishing or soft deletion removes the content from subsequent public reads.
4. **Verify or restore.** Check the listing, direct URL, metadata, and sitemap after publishing or withdrawing content. Git records the reviewed source changes. Restore a prior database snapshot by republishing verified earlier content or using the documented backup and restore process. Use `public/` only for approved assets because direct file URLs remain accessible until the files are removed from the deployment.

## Future public AI assistant

The assistant is a later milestone and will answer questions using approved portfolio material. Its retrieval method and provider will be selected in that milestone after reviewing corpus size, privacy, and cost.

- Retrieve from approved homepage facts and current published project and article versions. Check publication eligibility on every request, including when an index contains older content.
- Ground answers in retrieved excerpts and cite verified public URLs. Give a clear fallback when evidence is insufficient. Keep provider credentials server-side and give the assistant read-only access to approved content.
- Validate and bound requests, rate-limit public access, cap spending, and keep conversation context transient. Plan an independent way to disable the assistant and preserve normal browsing when the provider is unavailable.
- Test source selection, unsupported questions, draft and withdrawn content exclusion, accessibility, and provider failure before public enablement.

See the [development roadmap](development-roadmap.md) and the [local setup and deployment instructions](../README.md).
