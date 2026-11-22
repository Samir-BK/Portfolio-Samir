# Pre-deployment UI/UX audit

**November 21, 2026 · Portfolio revision `a651a72` · Audit only**

I found **3 medium and 5 low severity issues**. The most important are in the assistant composer and rate-limit recovery. All six approved project pages opened from the gallery, and no page exceeded its viewport width in the responsive matrix. The findings support targeted improvements within the existing terminal design.

## Coverage and evidence

- Chromium 157, using an optimized local Webpack production build and the approved personalization database with a read-only connection. All eight requested widths were tested in both dark and light themes for ten HTML routes, for 160 route, width and theme combinations.
- The matrix covered `/`, `/projects`, all six published project details, `/blog`, and the custom 404 at `/audit-unknown`. I separately checked unknown project and article slugs, `/robots.txt`, and `/sitemap.xml` over HTTP. The six detail slugs were `personal-trainer`, `flappy-bird-dqn`, `creator-scout`, `text-summarizer-app`, `mailbrief`, and `cnn-image-classification`.
- The widths were **320, 360, 390, 440, 768, 1024, 1280 and 1440 px**. The matrix used browser-rendered same-origin frames with exact CSS widths. Keyboard and interaction spot checks included 320 × 568, 390 × 844 and 1280 px.
- axe-core 4.14.1 ran 20 scans across the homepage, gallery, longest-titled detail, blog empty state and 404 at 320 and 1280 px in both themes. It reported zero violations in those scans. Manual findings below are separate from axe’s results. WCAG judgments use the [W3C WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/).
- The actual fake provider and chat handler ran in a loopback audit harness with read-only approved knowledge and in-memory admission. Controlled fixtures exercised delayed streaming, a long response, HTTP 429 and streamed provider failure. The disabled state was served by the actual app with the feature off. The audit made no Groq requests, wrote no database records, and sent no external demo forms.
- [Browser matrix trace](ui-audit-evidence/chromium-matrix.json) records the viewport, responsive treatment, heading, resources and axe results for each measured run. [Interaction and timing trace](ui-audit-evidence/interaction-trace.md) records the manual checks and measurements cited below.

### Checks that worked

| Area                          | Observed in the audit                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsive layout             | Document width matched viewport width in all 160 samples. The sticky header switched between mobile and desktop navigation across the tested widths. The project grid was one track through 768 px and three tracks from 1024 px in the requested sample. The longest approved titles and footer controls fit the tested viewports. No broken image elements were observed.                                 |
| Navigation                    | Skip link moved focus to main content. Mobile Escape closed the menu and restored focus. The active section followed anchor navigation. Gallery filtering returned 5 Python projects, 2 with Machine learning added, and 6 after clearing. Back and Forward restored filter URLs. All six case-study links and the 404 recovery CTA worked.                                                                 |
| External links                | GitHub and LinkedIn opened the expected profiles. Personal Trainer opened its demo frontend. MailBrief eventually opened its app after initially showing Render’s loading page. I verified the email URI without launching a mail client.                                                                                                                                                                   |
| Theme and visual system       | The selected theme persisted through reload. The terminal labels, borders, accents and card styles were consistent across the gallery and details. The unit contrast checks passed in both palettes. Primary action sizing and the base focus-ring styling were consistent.                                                                                                                                 |
| Chat                          | Desktop opened by default and closed with keyboard focus on the disclosure. Mobile started collapsed at the tested narrow width. Suggestions submitted, loading and completion status text updated, source links resolved, Stop and Clear returned focus to the composer, and the provider-error UI exposed Retry. A long unbroken fixture wrapped at 390 px and scrolled vertically inside the transcript. |
| Public route and build health | Homepage, gallery, empty blog, robots and sitemap returned 200. Unknown general, project and article paths returned 404. Sampled local console output showed no hydration or uncaught JavaScript errors. Webpack production build and all 8 existing unit tests passed.                                                                                                                                     |

The desktop navigation’s 21 px-tall text targets were flagged for review by geometry alone. Their visible spacing and the clean axe results did not establish a WCAG 2.5.8 failure. Treat 44 px as an ergonomic enhancement where practical.

## 1. Broken functionality

No confirmed broken first-party page, project filter, gallery link or 404 recovery action. Chat interaction defects are listed below.

## 2. Responsive and layout problems

### UI-RSP-01 · Low · The composer stays below the fold when mobile chat opens

- **Route, viewport and theme** — `/` at 320 × 568, Light.
- **Reproduce** — Focus the mobile assistant summary and press Enter. Observe the panel before scrolling to the textarea.
- **Expected** — Opening the assistant places the composer within easy reach or makes its position obvious on a short screen.
- **Actual** — The composer occupied y=862–1020 against a 568 px viewport. It was reachable by scrolling. There was no horizontal overflow.
- **Evidence and likely cause** — [CHAT-04](ui-audit-evidence/interaction-trace.md). The inline disclosure stacks the introduction and three suggestion buttons before the composer. Expansion retains the current focus and scroll position.
- **Suggested fix and verification** — Keep the inline panel. Compact the suggestions on short viewports or let a user-initiated open bring the composer into view without automatically opening the software keyboard. Retest 320 × 568 and 390 px on a physical mobile device with the keyboard open.

## 3. Accessibility problems

### UI-A11Y-01 · Medium · Keyboard focus drops after Send

- **Route, viewport and theme** — `/` at 390 px, Light.
- **Reproduce** — Type a question, focus Send, and activate it with Enter during a slow fake response.
- **Expected** — Focus stays on a visible, useful control inside the assistant while waiting.
- **Actual** — DOM focus moved to `BODY`; there was no focused chat control while Stop was visible. Using Stop explicitly returned focus to the textarea.
- **Evidence and likely cause** — [CHAT-02](ui-audit-evidence/interaction-trace.md). The initiating Send button is disabled when pending starts, and submission has no matching focus handoff.
- **Suggested fix and verification** — Keep or restore focus within the composer on submit. Test keyboard-only sending, streaming, stopping and retrying. Focus should stay visible and the next Tab should predictably reach the chat controls. Relevant WCAG areas include focus order and visible focus.

### UI-A11Y-02 · Low · Mobile section navigation scrolls without focusing the destination

- **Route, viewport and theme** — `/#skills` at 390 px, Light.
- **Reproduce** — Open mobile navigation with Enter, focus Skills and activate it. Inspect focus after the hash changes, then press Tab.
- **Expected** — The section heading or landmark receives programmatic focus so the transition is evident without relying on scroll position.
- **Actual** — The menu closed, Skills scrolled into view and became current, and focus moved to `BODY`. The next Tab reached the email link farther down the page. The Skills section remained readable by scrolling or using heading navigation.
- **Evidence and likely cause** — [NAV-01](ui-audit-evidence/interaction-trace.md). The link closes the disclosure without placing focus on the non-focusable hash destination.
- **Suggested fix and verification** — For keyboard-activated in-page links, focus the destination with a programmatically focusable target while preserving the hash and header offset. Confirm Escape still restores menu-trigger focus. Validate heading announcement with a screen reader.

## 4. Visual inconsistencies

### UI-VIS-01 · Low · Theme icon and selected value suggest opposite meanings

- **Route, viewport and theme** — Shared header, reproduced on `/` at 1280 px in Light and Dark.
- **Reproduce** — Select Light, reload, then select Dark.
- **Expected** — The decoration consistently indicates the current mode or has an unambiguous neutral meaning.
- **Actual** — Light showed a moon and Dark showed a sun. The select value was accurate and persisted.
- **Evidence and likely cause** — [THEME-01](ui-audit-evidence/interaction-trace.md). CSS chooses the icon for the opposite mode, a pattern associated with a toggle action. The adjacent control displays the current value of a three-option select.
- **Suggested fix and verification** — Pair the icon with the displayed value or use a neutral appearance icon. Confirm Light, Dark and System remain distinguishable on every route and after reload.

## 5. AI chat UI issues

### UI-CHAT-01 · Medium · Enter and Shift+Enter both insert a newline

- **Route, viewport and theme** — `/` at 390 px, Light, with a keyboard.
- **Reproduce** — Open chat, type a valid question, and press Enter. Then press Shift+Enter.
- **Expected** — Enter submits and Shift+Enter adds a line break, as specified in the audit interaction contract.
- **Actual** — Both inserted line breaks and neither sent a request. The Send button worked.
- **Evidence and likely cause** — [CHAT-01](ui-audit-evidence/interaction-trace.md). The textarea uses native multiline behavior and only the form’s submit handler starts a request.
- **Suggested fix and verification** — Add the shortcut with visible help text. Verify plain Enter sends once, Shift+Enter retains a newline, composing with an IME does not submit, and an in-flight request prevents duplicate submissions.

### UI-CHAT-02 · Medium · Rate-limit errors offer immediate retry during the cooldown

- **Route, viewport and theme** — `/` at 390 px, Light.
- **Reproduce** — Return the controlled HTTP 429 with `Retry-After: 30` after a chat submission.
- **Expected** — Show a useful retry time. Prevent repeated submissions while the server says the request cannot be admitted.
- **Actual** — The live region and transcript said to try again shortly. Retry was immediately enabled.
- **Evidence and likely cause** — [CHAT-03](ui-audit-evidence/interaction-trace.md). The client takes the JSON error text and renders the generic Retry action without using the response status and retry header.
- **Suggested fix and verification** — Apply a local cooldown from the retry header, announce availability without narrating every second, and preserve provider-error Retry. Test the 429 fixture for both Retry and composer submission before and after expiry.

### UI-CHAT-03 · Low · Disabled-state copy implies the assistant has never launched

- **Route, viewport and theme** — `/` at 1280 px, System setting, with the feature disabled.
- **Reproduce** — Load the homepage with the chat feature off.
- **Expected** — The running portfolio states that the assistant is currently unavailable and offers an obvious path to project content.
- **Actual** — It showed “Offline” and “Preview · AI assistant coming soon,” with no composer. That wording is misleading if the operator temporarily disables an already-released assistant.
- **Evidence and likely cause** — [CHAT-06](ui-audit-evidence/interaction-trace.md). The original preview copy is reused for any off state.
- **Suggested fix and verification** — Use availability wording suitable after launch and provide a nearby project link. Verify the disabled build has no chat inputs and the enabled build still exposes the normal disclosure.

## 6. Performance issues

### UI-PERF-01 · Low · Content routes load a sizable JavaScript baseline

- **Route, viewport and theme** — `/`, `/projects`, CNN Image Classification and `/blog` at 390 × 844, Light, in the local Chromium performance run.
- **Reproduce** — Record script resources on the production build at 390 px and total their decoded sizes.
- **Expected** — Reading routes have a measured client-JavaScript budget proportionate to their interactions.
- **Actual** — The empty blog loaded about 449 KiB decoded JavaScript, the gallery and detail about 463 KiB each, and the homepage about 540 KiB. Local timing was fast and no long-task or layout-shift entries surfaced in the short trace. The concern is payload cost on lower-powered devices, which this loopback sample cannot establish.
- **Evidence and likely cause** — [Local timing sample](ui-audit-evidence/interaction-trace.md#390-px-local-browser-timing-sample). The same sizable framework and hydration baseline appears on reading routes. The incremental cost of chat, Motion, and the shared client header needs attribution with a bundle report.
- **Suggested fix and verification** — Measure a production cold load under mobile throttling and attribute chunks before changing boundaries. Set a budget based on that baseline. Preserve theme, menu and skip-link behavior if any client code is deferred.

## Remaining verification

- Standalone Chromium, Firefox and WebKit automation launches failed in the audit environment. The completed browser matrix and interactions used Chromium 157 in the in-app browser. Safari and Firefox results are unverified.
- Native 200% and 400% browser zoom, an actual mobile software keyboard, screen-reader speech, and reduced-motion emulation were unavailable in the completed browser session. Narrow CSS reflow was exercised down to 320 px. The reduced-motion CSS and Motion guard were inspected in source. The accessibility tree and live-region text were inspected, which does not verify spoken announcements.
- The blog had no approved articles. The blog empty state and unknown article 404 were exercised. Live article rendering and code-block scrolling were out of scope for this content snapshot. Source inspection found scoped horizontal scrolling on code blocks and the existing Markdown unit checks passed.
- No authenticated demo workflow, email client, signed-in LinkedIn state, or unlinked résumé download was executed. The server-wide content error boundary was inspected in source without forcing a database outage. Local measurements are neither deployment timings nor Lighthouse or field Core Web Vitals scores.

## Initial remediation order

The remaining findings review below supersedes the release timing for open items.

1. Fix Send focus loss and Enter/Shift+Enter together. Retest Stop, Clear, Retry and IME input.
2. Respect the server cooldown after a rate limit. Confirm provider failures still allow retry.
3. Improve composer discovery on short mobile screens, then test a real software keyboard and browser zoom.
4. Set focus on mobile anchor destinations. Retest skip navigation and heading announcements with assistive technology.
5. Resolve theme-icon and disabled-copy ambiguity. Then establish the mobile performance baseline and complete Firefox and Safari verification before release.

No application code, database content, migrations or deployment configuration changed during this audit.

## Remediation batch 1 · Medium-severity chat controls

Reproduced all three findings on the original build before editing. The browser regression used Chromium 157, the same read-only approved content and fake-provider setup, and controlled chat failures. No live Groq requests were sent.

| Issue      | Correction                                                                                                                                                                                               | Verification                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI-A11Y-01 | Accepted submissions move focus to the textarea before Send becomes disabled. Send, suggestions and Retry use the same focus path.                                                                       | At 390 px in Light, keyboard activation of Send retained composer focus during a slow response. A second Enter added no turn. Stop and Clear returned focus to the textarea. At 390 px in Dark, the provider error and retry path also retained composer focus.                                                                                                                                                                        |
| UI-CHAT-01 | Plain Enter submits. Shift+Enter inserts a newline. A visible hint is associated with the input. The shortcut ignores modified keys and IME composition.                                                 | At 390 px in Light, Shift+Enter inserted a newline without submitting. At 390 px in Dark, plain Enter created one turn. At 1280 px in Dark, the fake stream returned the Flappy Bird DQN citation. Unit tests cover the key combinations and composition guards.                                                                                                                                                                       |
| UI-CHAT-02 | For HTTP 429 with a positive `Retry-After` in seconds, the UI shows the local retry time and blocks all submission paths until that time. The live region announces availability when the cooldown ends. | At 390 px in Light, a 20-second cooldown disabled Send and Retry, and Enter did not submit. Expiry removed the notice and re-enabled both controls. Retry then streamed a valid Skills citation. At 390 px in Dark, Clear preserved the cooldown and disabled all suggestions. A streamed provider error still offered immediate Retry. Unit tests cover the server header format, missing and invalid values, and a month-long delay. |

**Browser evidence** — [Before](ui-audit-evidence/chat-cooldown-before.jpg) and [after](ui-audit-evidence/chat-cooldown-after.jpg) screenshots show the chat composer after the mocked 429 in Light at 390 px. Dark remained within the 390 px viewport. The 1280 px desktop check showed no console warnings or errors. The keyboard rules were exercised in Chromium and in unit tests. Native IME entry, physical touch and spoken live-region announcements were not retested.

**Checks passed** — `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test` (10 tests), `corepack pnpm build` (Turbopack), `corepack pnpm test:db` (5 checks), `corepack pnpm test:chat` (9 checks), and `corepack pnpm exec prettier --check .`. Both PostgreSQL suites used the isolated test database. No regressions were observed in the exercised interactions.

**Remaining findings** — UI-RSP-01, UI-A11Y-02, UI-VIS-01, UI-CHAT-03 and UI-PERF-01 remain open for a later batch. This batch is ready for a focused audit pass. It did not change verified portfolio content, the provider, database schema, migrations, or deployment configuration.

## Remaining findings review · November 21, 2026

Reviewed the production Turbopack build after remediation batch 1 in Chromium 157. The homepage used the existing local test setup with read-only approved content. The disabled assistant was rendered by a separate local instance of the same build. No assistant questions were submitted. All five findings retain **Low** severity. Release timing below reflects visitor impact and the risk of each change.

| Issue      | Current reproduction and affected component                                                                                                                                                                                                                                                                                      | Visitor impact                                                                                                                                                 | Estimated complexity and regression risk                                                                                                                                   | Recommended disposition                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| UI-RSP-01  | **Reproduced.** Homepage `PortfolioChat`. At 320 × 568 in Light, opening the disclosure left the textarea at y=879–949. Focusing it scrolled it into view at y=304–373. At 390 × 844 in Dark, the textarea fit at y=742–812, but the form extended below the fold to y=900. Neither viewport had page-level horizontal overflow. | People on short screens can open chat without seeing where to type. The composer works when reached by scrolling or keyboard focus.                            | **Small** if addressed with focused layout or scroll changes. **Moderate regression risk** around focus, scroll position, reduced motion and the mobile software keyboard. | **Fix before deployment.** Affects discovery of a prominent homepage interaction.                                         |
| UI-A11Y-02 | **Reproduced.** Homepage `SiteHeader` mobile menu and the Skills section at 390 px in Light. Activating Skills closed the menu, set `#skills` and scrolled the section to y=88. Focus went to `BODY`; the next Tab reached the contact email. Escape separately closed the menu and restored trigger focus.                      | Keyboard and assistive-technology users can miss the destination when moving from the menu to page content.                                                    | **Small** scope. **Moderate regression risk** around hash scrolling, history, active-section styling and the distinction between activation and Escape.                    | **Fix before deployment.** Improves a shared, first-party navigation path.                                                |
| UI-VIS-01  | **Reproduced.** Shared `ThemeSwitcher` on `/projects` at 1280 px. Light persisted across reload with a moon; Dark showed a sun. The select value and page theme agreed.                                                                                                                                                          | A momentary visual ambiguity. The named select still communicates the active preference and functions correctly.                                               | **Small, low risk** if limited to icon selection. Preserve System mode and theme persistence.                                                                              | **Fix after deployment.** The control works and communicates its setting in text.                                         |
| UI-CHAT-03 | **Reproduced.** Homepage `AssistantPreview` in `hero.tsx` with chat disabled at 1280 px. It showed “Offline” and “Preview · AI assistant coming soon,” with no composer and no link within the panel. The usual site navigation remained available.                                                                              | Visitors who encounter the off state can mistake a temporary shutdown for an unreleased feature. The preview gives them no direct path to the project gallery. | **Small, low risk.** Local copy and link change in the disabled branch.                                                                                                    | **Fix before deployment.** Make the operational fallback accurate from launch.                                            |
| UI-PERF-01 | **Payload reproduced.** Shared framework and hydration baseline on `/`, `/projects`, CNN Image Classification and `/blog` at 390 × 844. Measured decoded script totals of 569,045 B, 489,694 B, 489,694 B and 474,847 B respectively. Local largest paint entries ranged from 72 to 128 ms.                                      | A larger script payload can increase cost on slower networks and devices. This run did not demonstrate a user-visible slowdown.                                | **Medium or larger** after measurement. **Moderate regression risk** if bundle or client-boundary changes affect navigation, theme, Motion or chat.                        | **Fix after deployment.** Measure on representative hardware and network conditions before revising component boundaries. |

### Acceptance criteria

- **UI-RSP-01** — At 320 × 568 and 390 × 844, opening chat makes the composer visible or gives a visible, direct way to reach it. Verify keyboard access to the input and Send, no horizontal overflow, no automatic software-keyboard opening, and a usable composer when the keyboard is deliberately opened. Check Light, Dark, reduced motion and desktop disclosure behavior.
- **UI-A11Y-02** — Keyboard activation of an in-page mobile link closes the menu and moves focus to its section heading or landmark. The destination remains visible below the sticky header, the hash and active state agree, Back and Forward work, and Escape still restores focus to the trigger. Verify a heading announcement with a screen reader.
- **UI-VIS-01** — Icon and select have a consistent meaning in Light, Dark and System. The current preference stays clear by text and survives reload.
- **UI-CHAT-03** — The disabled panel describes current unavailability and links to the working project gallery. It exposes no chat composer. The enabled panel and its controls behave as before.
- **UI-PERF-01** — Record repeatable cold-cache, mobile-throttled measurements for the same four routes, with transfer size and decoded JavaScript kept separate. Attribute meaningful costs before setting a reduction target. Retest keyboard navigation, theme, Motion and fake-provider chat if bundle changes follow.

**Limitations** — This was a Chromium follow-up. Physical touch, the mobile software keyboard, spoken screen-reader output and cross-browser behavior were not tested. Performance was sampled over unthrottled loopback with a shared browser cache. These are local measurements, and the earlier Webpack baseline used a different build pipeline. No application code, portfolio content, database, provider or deployment settings were changed.

## Remediation batch 2 · Approved pre-deployment findings

This batch covered UI-RSP-01, UI-A11Y-02 and UI-CHAT-03. UI-VIS-01 and UI-PERF-01 remain deferred. The baseline build reproduced all three approved findings before any edits.

| Issue      | Root cause and before                                                                                                                                        | Implemented fix and files                                                                                                                                                                                                                                                                                                                                                                                                                | Acceptance status                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI-RSP-01  | The native disclosure expanded in document flow without a viewport budget or an independent mobile history area. At 320 × 568 the textarea started at y=878. | `portfolio-chat.tsx` and `home.css` keep the inline disclosure and align it below the sticky header on mobile open. The panel budgets for the visual viewport, safe-area insets and close control. A scrollable mobile history sits above the composer, which can scroll independently if the viewport temporarily becomes very short. Opening the panel does not focus the textarea. Desktop keeps its original transcript scroll area. | **Browser-verified. Device verification pending.** Chromium verified the layout, keyboard path and simulated resize below. A physical software keyboard, hardware safe areas and active reduced-motion settings remain unverified. Panel alignment is immediate.                                                                                            |
| UI-A11Y-02 | Closing the disclosure hid the focused link. The section moved into view, but focus fell back to `BODY`.                                                     | `site-header.tsx` uses native mobile fragment links and focuses the existing named section after the fragment moves. The existing `tabIndex={-1}` targets do not add a Tab stop. Same-fragment activation also focuses its section. Escape still restores the menu trigger.                                                                                                                                                              | **Browser-verified. Spoken announcement pending.** At 390 px, Skills and About received visible focus, their hashes and active styles agreed, and their sections stayed below the sticky header on keyboard navigation and Back/Forward. The About link from `/projects` focused About on the homepage. A spoken screen-reader announcement was not tested. |
| UI-CHAT-03 | The disabled branch still rendered its original prelaunch preview, with no direct link to the gallery.                                                       | `hero.tsx` now shows current unavailability and a keyboard-accessible **Explore projects** action using the existing terminal panel. `home.css` removes the obsolete demo-prompt styles. `database.integration.mjs` checks the disabled production HTML and gallery destination.                                                                                                                                                         | **Resolved.** The disabled panel had no composer. Enter on its link reached `/projects`. The production integration test passed. Enabled suggestions and keyboard submission still worked with a fake provider.                                                                                                                                             |

### Browser evidence

Chromium 157 ran against the local Turbopack production build. These bounds are CSS pixels in the viewport after opening the assistant. The sticky header ended at 67 px in the narrow checks. The assistant closed successfully in all 12 viewport and theme combinations. It opened by default at 1280 px and started collapsed at the other tested widths. Document widths matched the viewports.

| Viewport   | Panel bottom, Light / Dark | Send bottom, Light / Dark |
| ---------- | -------------------------: | ------------------------: |
| 320 × 568  |                  558 / 558 |                 545 / 545 |
| 360 × 640  |                  618 / 618 |                 605 / 605 |
| 390 × 844  |                  556 / 556 |                 543 / 543 |
| 440 × 956  |                  533 / 534 |                 520 / 521 |
| 768 × 1024 |                  487 / 487 |                 474 / 474 |
| 1280 × 900 |                  664 / 664 |                 634 / 634 |

- **Short viewport** — Shrinking an open and focused 320 px frame from 568 px to 300 px left the 44 px textarea and summary within the viewport. In a separate 300 px keyboard check, moving focus to Send scrolled the composer internally and brought the full button into view at y=233–277. The resize simulated available-height changes. It did not open a physical software keyboard.
- **Scrolling and submission** — At 320 px, a suggested question streamed a Skills citation and returned focus to the composer. Shift+Enter inserted a line break. Enter submitted the next question once the first response ended. A long unbroken fixture wrapped at 286 px. The mobile history scrolled while the composer remained visible. Desktop retained its own scrollable transcript, at 256 px high with 689 px of content and no horizontal overflow in the long-answer check.
- **Keyboard and navigation** — At 360 px the Tab sequence from the open summary reached the three suggestions and then the textarea. Closing returned focus to the summary. At 390 px, keyboard navigation and Back/Forward focused Skills or About at y=81–83 with the menu closed. Escape restored focus without navigating. From `/projects`, the mobile About link focused the homepage section at y=98.
- **Scope and regressions** — The initial browser pass caught a fragment history alignment problem and a textarea shrinking to 18 px in the simulated short viewport. Both were corrected and retested. No regressions remained in the exercised scenarios. No local Groq credits were used.

**Automated checks passed** — `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test` (10 tests), `corepack pnpm test:db` (6 checks), `corepack pnpm test:chat` (9 checks), `corepack pnpm exec prettier --check .`, and `corepack pnpm build`. The integration suites used the isolated test database. Browser checks used read-only approved development content and the deterministic fake-provider harness. Deployment configuration and case-study content were preserved.

## Remediation batch 3 · Final QA follow-ups

- **QA-01** — The responsive mount effect overwrote the native disclosure choice. The chat now hydrates from the current DOM state and remembers early activation on the disclosure. The composer stays disabled until ready. Delayed-JavaScript checks preserved mobile open and close choices and the desktop default. A Chromium keyboard activation before hydration and a Safari same-node check verified that the panel stayed open.
- **QA-02** — Transport rejections leaked their raw messages into the transcript. The chat now uses a plain-language connection message and leaves Retry available. Browser recovery preserved the prior turn. Two new unit tests cover network failure, successful retry, interrupted reads and Stop.
- **QA-03** — Firefox relocated the page to the focused input during a short resize, pushing the summary behind the sticky header even when scroll anchoring was disabled. After viewport resize, the chat realigns only when the focused composer’s panel is obscured. The Firefox, Chromium and Safari simulations passed. Physical mobile verification remains open.

The batch changed `src/components/sections/portfolio-chat.tsx`, `src/lib/chat.ts` and `tests/chat-controls.test.mjs`. Lint, TypeScript, 12 unit tests, 6 database checks, 9 chat checks, Prettier and the production build passed. See [final QA remediation evidence](pre-deployment-qa.md#remediation-verification--november-22-2026) for browser versions, measured bounds and limits. UI-VIS-01 and UI-PERF-01 remain deferred.
