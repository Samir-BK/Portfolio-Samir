# Portfolio reference analysis

## Review scope

| Reference | Reviewed revision | Local source snapshot |
| --- | --- | --- |
| Arjad | [`f3a06295ca16330bf17eaa53a19bc68351f5790d`](https://github.com/arjad/arjad-portfolio-/tree/f3a06295ca16330bf17eaa53a19bc68351f5790d) | `references/arjad-portfolio-/` |
| Akkilaa | [`fd1592e46ebb74fe4393e2b11c2bdea159fc93ab`](https://github.com/akkilaa/portfolio/tree/fd1592e46ebb74fe4393e2b11c2bdea159fc93ab) | `references/akkilaa-portfolio/` |

Both Git clones failed because the shell could not resolve GitHub. Chrome could reach GitHub, so I downloaded and extracted its source ZIPs. The archive metadata identifies both revisions. The snapshots have no Git history. Findings come from static review of routes, call sites, components, manifests, and migrations. Browser rendering, deployed behavior, test results, and dependency advisories were outside that verification.

**Implemented** means the feature has a reachable source path. **Documentation only** means a claim had no matching implementation in the inspected source. **Unknown** means the evidence needed to verify it was unavailable.

## Arjad

| Area | Source finding |
| --- | --- |
| Stack and layout | Vue 2.7, Vue Router 3, JavaScript single-file components, Vue CLI 3, Babel, Sass, AOS, Font Awesome, and Bootstrap 4.2.1 via CDN. `src/main.js` mounts the app. `src/App.vue` hosts navigation, routed views, and the chat embed. `src/views/` contains the home, project listing and project detail. `src/components/` contains section components. `src/data/projects.json` drives the project views. `public/` and `src/assets/` hold media. |
| UI and content | The current hero presents Right Click Solutions as an agency. The home composes a hero, about/services, process timeline, three featured projects, social stats and contact. The fixed translucent nav has a mobile slide drawer. Project listing routes filter by category or technology. Detail routes present screenshots, local video or a YouTube demo where configured. The contact CTA opens the visitor's mail client with a `mailto:` link. |
| Motion and effects | `App.vue` configures one-time AOS entrance effects and image zoom. `summary.vue` overlaps a looping video showcase across the hero boundary. `process.vue` draws scroll progress and applies bounded parallax to its step numbers. `about.vue` has a looping CSS marquee. AOS and process parallax check reduced motion. The hero autoplay and marquee need their own reduced-motion treatment in our design. |
| Backend, database, auth and admin | The checked-in app is a client-side SPA. Project content comes from local JSON. No application server, database integration, authentication or admin editor was found. |
| AI | `src/components/features/chatbot.vue` injects the hosted Chatling script from the app shell. The integration is implemented. Its knowledge base, model, retrieval behavior, answer quality and availability are unknown from this repository. |
| Maintenance | Vue 2 reached end of life and Vue CLI is in maintenance mode. The build sets `--openssl-legacy-provider`, the manifest includes older overlapping UI helpers, and the repository carries npm and Yarn lockfiles. The source snapshot expands to roughly 248 MiB, including two byte-identical copies of one 67 MiB video. The package scripts list no lint or test commands. Use one lockfile and optimized media in the new project. |
| License | No LICENSE/COPYING file or clear license grant was found. The README invites readers to edit the portfolio, but supplies no license terms. Reuse permission for code, logos, images, videos and text is unverified. |

The README's responsive layout and scroll animation claims have corresponding source. Its dark-mode claim is **documentation only** at this revision. The declared dark-mode package has no wired toggle in the inspected code. An independent cursor-driven background effect was also unverified. The main visible motion paths are scroll effects, a marquee, transition classes, and video. The README's email claim maps to `mailto:`, and its AI claim maps to a third-party widget whose behavior remains unknown.

Source entry points [Arjad manifest](https://github.com/arjad/arjad-portfolio-/blob/f3a06295ca16330bf17eaa53a19bc68351f5790d/package.json), [components](https://github.com/arjad/arjad-portfolio-/tree/f3a06295ca16330bf17eaa53a19bc68351f5790d/src/components), [views](https://github.com/arjad/arjad-portfolio-/tree/f3a06295ca16330bf17eaa53a19bc68351f5790d/src/views), [Vue 2 end of life](https://v2.vuejs.org/eol/), [Vue CLI maintenance status](https://cli.vuejs.org/guide/).

## Akkilaa

| Area | Source finding |
| --- | --- |
| Stack and layout | pnpm workspaces and Turborepo. `apps/web` is Next.js 16 App Router with React 19, TypeScript and Tailwind 4. `apps/api` is Express 5 with TypeScript and Zod. `packages/db` uses Prisma 7, the PostgreSQL adapter, schema files and SQL migrations. `packages/shared` holds domain types, DTOs and errors. Docker Compose defines a PostgreSQL 16 service and application deployment. |
| UI and motion | Public source covers home, about, project listing and detail, blog, recommendations, and contact. Components are grouped into atoms, molecules and organisms. The site wires a theme toggle, responsive drawer, active-section highlighting, pointer-reactive CSS background, project cards, markdown with syntax highlighting, image lightbox and chat panel. Motion is implemented through CSS and client hooks. No Motion package is declared. |
| Backend | Express routes are mounted under `/v1`. `server.ts` wires controllers, services, storage and email adapters, and Prisma repositories. Source covers project and post publishing, recommendations and moderation, contact persistence, media handling and AI chat. Sentry, Dockerfiles, deployment workflow and Vitest/Supertest tests are present. Test outcomes and production deployment are unverified. |
| Database | Checked-in migrations and Prisma repositories support projects, posts, tags, images and media, contacts, users, recommendations, chat logs and audit log structure. Project and post list queries apply publication filters. In the inspected public detail paths, slug lookups filter deleted records but omit publication checks. A shared published-only query rule would cover both reads. |
| AI | `ChatPanel` uses the AI SDK text-stream client. The ask controller validates and trims messages, then streams from a configurable OpenAI-compatible endpoint with an output cap. Its system prompt contains a hardcoded personal profile. The request path has no embedding, content search, pgvector, retrieval or structured citations. The Prisma logging path records prompts, answers and IPs. The configured provider's deployed health and model availability are unknown. |
| Auth and admin | Source includes admin sign-in and verification pages, project and blog editors, and recommendation moderation. Password verification triggers an emailed JWT link, followed by access and refresh cookies. GitHub and LinkedIn OAuth are wired for recommendation authors. The web proxy checks cookie presence. Static API review found missing server-side authorization on project and post admin reads and writes and on administrative contact actions. Media and recommendation admin routes have authentication middleware. A CSRF middleware file exists without route registration. Runtime behavior and exposure through production infrastructure were unverified. |
| Maintenance | The second deployable app, package boundaries and proxy/cookie forwarding increase the maintenance surface. Other patterns to review before reuse include custom JWT/session lifecycle, raw HTML enabled in Markdown rendering without a configured sanitization plugin in that renderer, process-local rate limiting, and a private-network default model endpoint. Match Node, framework and Prisma versions in CI and verify support and advisories during implementation. |
| License | The README says MIT is a placeholder, and there is no LICENSE/COPYING file in the snapshot. The manifest's `private: false` is a package publishing flag. Code and asset reuse permission remains unverified. |

### Documentation checked against source

| Claim | Status at the reviewed commit |
| --- | --- |
| README says the repository is in planning with no code | Stale. The frontend, backend, database, auth UI, and streaming chat are wired in source. |
| README shows a possible shared `packages/ui` package | Documentation only. UI components live under `apps/web/components/`. |
| PRD and roadmap describe R2/S3-compatible media uploads | Documentation only for object storage. The runnable storage factory selects local disk, and an interface exists for a future adapter. |
| Roadmap calls for contact persistence, captcha, and email | Partial. The submission endpoint validates, rate-limits and persists contacts. No captcha or outbound submission email is wired. Nodemailer is wired for the admin sign-in flow. |
| Roadmap calls for publishing-triggered revalidation and auth audit logging | The web read services use time-based revalidation. An audit model and repository exist. No publishing-triggered cache invalidation or auth audit event wiring was found in the inspected paths. |

Source entry points [README](https://github.com/akkilaa/portfolio/blob/fd1592e46ebb74fe4393e2b11c2bdea159fc93ab/README.md), [API routes](https://github.com/akkilaa/portfolio/tree/fd1592e46ebb74fe4393e2b11c2bdea159fc93ab/apps/api/src/routes), [API controllers](https://github.com/akkilaa/portfolio/tree/fd1592e46ebb74fe4393e2b11c2bdea159fc93ab/apps/api/src/controllers), [AI configuration](https://github.com/akkilaa/portfolio/blob/fd1592e46ebb74fe4393e2b11c2bdea159fc93ab/apps/api/src/constants/ai.ts), [database source](https://github.com/akkilaa/portfolio/tree/fd1592e46ebb74fe4393e2b11c2bdea159fc93ab/packages/db), [web components](https://github.com/akkilaa/portfolio/tree/fd1592e46ebb74fe4393e2b11c2bdea159fc93ab/apps/web/components).

## Direction for this portfolio

- **From Arjad, take the visual hierarchy.** Use a strong hero, an original project preview overlapping the section boundary, a small featured-project shortlist, and progressive case-study disclosure. Adapt the process timeline into a static-by-default experience timeline. Rebuild the mobile nav with actual links, a keyboard-operable drawer and focus restoration. Keep scroll entrances subtle and let visitors opt into video.
- **From Akkilaa, take the data and publishing boundaries.** Use typed inputs, focused content queries, testable integrations, slug-based case studies, and a draft/published workflow. Adapt the streaming chat interaction and maintain a separate retrieval step with real content and citations.
- **Keep operations small.** One Next.js deployment and one PostgreSQL database are enough initially. Defer Express, Turborepo, visitor accounts, recommendations, a separate vector service, and local model hosting until a concrete requirement justifies them.
- **Use original material.** Build the UI with your own layout details, copy, imagery and motion. Obtain an explicit license or written permission before reusing any identifiable code or assets from either reference. [GitHub guidance on repository licensing](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

See [the architecture](architecture.md) and [development roadmap](development-roadmap.md).
