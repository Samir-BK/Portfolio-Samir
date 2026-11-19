# Technical architecture

## Deployment and stack

Use one Node.js deployment of **Next.js App Router** in strict **TypeScript**, with **Tailwind CSS** for styling and **Motion for React** for interaction and selective scroll reveals. Use managed **PostgreSQL** with **Prisma** and the **pgvector** extension. Confirm compatible supported versions, connection pooling, migration privileges and extension availability in staging before pinning them.

| Area | Proposed implementation |
| --- | --- |
| Public site | Server Components render the home, about, project list, project detail and blog. Use client components for filters that need local interaction, the navigation drawer, motion and the chat panel. Encode project filters in the URL so results are shareable. Generate page metadata, canonical links and a published-only sitemap. |
| Styling and motion | Use CSS variables for semantic colors, spacing and typography, and Tailwind for layout. Use Motion for one-time entrances and the drawer. Honor system reduced motion for nonessential transforms, smooth scrolling and video. Keep key text and navigation visible without client JavaScript. Use original optimized images and an optional user-initiated demo. |
| Content reads | Server Components call a server-only Prisma data layer directly. Begin with request-time reads for publication-sensitive content. Add caching only after measuring and verifying publish/unpublish invalidation across routes, feeds and previews. |
| Admin writes | Use Server Actions for same-origin editing and publication. Each action validates inputs, checks the active admin session, applies the transaction and revalidates any affected pages when caching is introduced. Use explicit allowlists for external URLs and Markdown without raw HTML by default. |
| Chat and HTTP | Use a same-origin `POST /api/chat` Route Handler for validated, bounded requests and a streamed response with typed events. Use an embeddings provider and a hosted generation provider from server-only modules. OpenAI is a candidate pending budget and data-policy approval. Keep a fake provider for deterministic tests. |
| Hosting | Prefer managed Node hosting and PostgreSQL in a region chosen with the owner. Start with approved media checked into the project or hosted on an approved media origin. Add object storage when browser uploads are needed. Keep a separate staging database and run production migrations as a release step with a separate credential. |

Indicative layout, to be created only after approval to implement

- `src/app/(public)/` holds public routes, with canonical case studies at `/projects/[slug]`.
- `src/app/admin/` holds sign-in, dashboard, and content editors. `src/app/api/chat/` serves the public chat stream.
- `src/components/` holds shared UI and client interaction. `src/server/` holds auth, content, retrieval and provider integrations.
- `prisma/` holds schema and migrations. `tests/` holds deterministic fixtures plus integration and browser suites.

Sources [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Tailwind Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [MotionConfig](https://motion.dev/docs/react-motion-config), [Prisma with Next.js](https://www.prisma.io/docs/guides/frameworks/nextjs).

## Content and admin

| Record | Ownership and visibility |
| --- | --- |
| `Profile`, `Experience`, `Education` | Public biography and career details, stored as structured fields with an explicit published version. Skills can start as an approved list. |
| `Project`, `Post`, `Tag` | Project and post drafts, slugs, summaries, Markdown and publication state. Include featured order for projects and a version for conflict detection. Separate draft edits from the published snapshot so saving a draft leaves the live page intact. |
| `ContentChunk` | Derived searchable text, parent source ID, source version, chunk ordinal, embedding model, vector and content hash. Resolve canonical citation labels and URLs from the published source. |
| `IndexJob` | Durable outbox for reindexing after publication, with deduplication, retry status and timestamps. |
| `AdminIdentity`, `Session`, `AuditEvent` | Explicit authorized identities, revocable sessions and audit records for content mutations and relevant authentication events. Exclude credentials and session tokens from audit payloads. |

Use a maintained authentication integration and a managed OAuth/OIDC identity provider with MFA or passkeys. Default to one pre-provisioned owner identity, mapped to the provider's stable issuer and subject, with no public signup. Require an active, revocable session and current admin grant on every protected read and mutation. The auth library should manage callbacks and use short-lived, secure, HttpOnly cookies with a SameSite policy compatible with its login flow. Use framework/library CSRF defenses and same-origin protections for mutations. Test expiry, revocation, wrong-account sign-in and direct invocation of protected operations. If considering Auth.js, verify the current Prisma adapter and version compatibility before choosing a session adapter. [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication), [Auth.js](https://authjs.dev/getting-started), [Prisma Auth.js guide](https://www.prisma.io/docs/guides/authentication/authjs/nextjs).

Public pages, metadata and chat all apply a common visibility rule to the current published version. For an edit, use optimistic concurrency on the draft. Publish the reviewed version, write its audit event and enqueue an index job in one database transaction. Unpublishing updates the live visibility immediately for subsequent reads. Keep the data layer authoritative for every server entry point.

## Retrieval and chat

1. **Index only approved public content.** Use published project case studies, profile sections, experience and posts. Chunk by meaningful headings and embed with a pinned model and vector dimension. Commit chunks only for the expected current published version. Key writes by source, version, model and chunk ordinal so retries stay idempotent. A scheduler polls database jobs, and a manual reindex path can repair failures. Remove superseded chunks after successful updates.
2. **Retrieve from PostgreSQL.** Start with exact cosine ranking over the small corpus and tune the score threshold and context size on a fixed evaluation set. Prisma handles normal data access. Use a custom migration and parameterized SQL for pgvector. Join chunks back to current published source versions before scoring or returning hits so stale, unpublished and deleted content is ineligible even if indexing lags. Add lexical matching for names and acronyms only if evaluation shows a gap.
3. **Ground answers in evidence.** Send only capped conversation context and the selected published excerpts to the generation provider. Treat visitor messages and excerpts as data. Supply no tools, admin endpoints or write access to the model. Use an allowlist of retrieved source IDs and resolve citation URLs on the server. If retrieval is weak or a citation is invalid, return a short fallback with project links. Stream verified units of text and citation IDs so the client never displays an unchecked URL.
4. **Bound spend and retention.** Validate message count, length and request size. Use a shared rate limiter for multiple instances, a concurrency cap, per-request time and token limits, and a global spend guard. Abort work on cancellation when supported. Keep conversation history transient and log aggregate usage, latency and errors by default. Confirm provider retention and disclose what the chat sends before launch.
5. **Handle failure openly.** A database, embedding or generation failure should leave the portfolio navigable and give the visitor a useful fallback. Track indexing lag, retrieval misses, provider failures and cost. A feature flag should allow chat to be disabled independently.

Sources [Prisma PostgreSQL extensions](https://www.prisma.io/docs/postgres/database/postgres-extensions), [pgvector](https://github.com/pgvector/pgvector), [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data).

## Decisions to confirm

- Which audience should the home page prioritize, and which two or three projects should anchor it?
- Which résumé, experience, education, project material, blog excerpts and contact details are approved for public pages and chat?
- Which owner identity provider and account should administer the site? Which hosting region and monthly budget fit the project?
- Is sending visitor messages and selected public excerpts to a hosted model acceptable? What provider retention and spend limits are acceptable?
- Is email contact sufficient for launch, or is a submission form required? Does the first admin release need browser uploads?

Until these are decided, the proposal assumes a single owner, an email contact link, no visitor accounts, managed hosting and an optional, public-content-only chat. See the [reference audit](reference-analysis.md) and [roadmap](development-roadmap.md).
