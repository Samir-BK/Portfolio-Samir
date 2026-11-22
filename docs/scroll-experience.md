# Scroll experience

## Reference observations

I opened [yunwei.dev](https://www.yunwei.dev/) in Chromium and scrolled the rendered page at desktop width (1280 CSS px) and mobile width (390 CSS px). Desktop scrolling reached approximately 720 px. At mobile width, scrolling reached approximately 1564 px and moved the header above the viewport. The measured header used absolute positioning. The document root reported `scroll-behavior: auto` and `scroll-snap-type: none`.

The session did not establish custom scroll smoothing, section entrance transitions, other pinned sections, parallax, active navigation changes, animation timing or easing, or snapping inside individual containers. The mobile check used viewport emulation.

## Portfolio behavior

- Homepage links retain native fragments and history. The existing root scroll padding leaves room for the sticky header, and native smooth scrolling applies when the visitor allows motion. After fragment navigation, keyboard focus goes to the destination section. Escape closes the mobile menu and returns focus to its trigger.
- A viewport observer tracks the section crossing a line below the header in either direction. The footer can activate Contact when it is fully visible. The active link uses the existing neon-green style and `aria-current="location"`.
- Featured Projects, About, Skills, Experience, Education, and Contact reveal once. Grouped content and project cards stagger in their existing order. The gallery and related-project cards use the same animation.
- Section and card entrances move 18 px and fade from 0.8 to 1 over 500 ms. The child stagger is 45 ms, capped at 180 ms. Easing is `[0.2, 0.65, 0.3, 1]`. The existing hero treatment uses 12 px and 650 ms.
- Motion styles are applied only after initialization and cleared after completion. Server-rendered content starts visible. Reduced motion disables the reveals and smooth anchor scrolling. Wheel and touch input stay native.

## Verification

| Check                                                                 | Result                                                                                                                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium homepage at 320 × 568, 390 × 844, 768 × 1024, and 1280 × 900 | No horizontal overflow at the four sizes                                                                                                                                                                |
| Chromium keyboard navigation at 390 × 844                             | Enter opened and activated menu links, updated fragments, and moved focus. About settled roughly 15 px below the header. Escape closed the menu and restored trigger focus.                             |
| Chromium browser history                                              | Back and Forward updated the fragment and focus. Forward realigned About below the header. One Back traversal restored Skills farther below the header and left the previous active indicator selected. |
| Chromium desktop scrolling                                            | Native scroll input moved down and back up, and the active indicator changed between About and Home.                                                                                                    |
| Chromium mobile assistant and themes                                  | Opened the chat at 320 × 568 with the composer within the viewport. Switched to light and dark and restored the System setting. No paid requests were sent.                                             |
| Chromium project detail                                               | Loaded the Signal Desk fixture directly and scrolled to 720 px without horizontal overflow.                                                                                                             |
| Server-rendered HTML                                                  | All six homepage destinations were present without hidden attributes or inline styles on their section elements.                                                                                        |
| Automated checks                                                      | Lint, TypeScript, 12 unit tests, 6 PostgreSQL checks, 9 chat integration checks, Prettier, and the production build passed.                                                                             |

Firefox and WebKit, physical touch or trackpad gestures, virtual keyboard behavior, browser zoom, reduced-motion emulation, and JavaScript-disabled or delayed-hydration browser sessions were not exercised in this pass. The reduced-motion behavior was inspected in CSS and component code.

No dependency was added. Production chunk disk allocation measured 744 KiB before and after. This is an aggregate disk measurement. Transfer size, frame timing, and mobile hardware performance were not measured. UI-PERF-01 remains deferred.

## Back and Forward regression

### Reproduction and cause

At 390 × 844 in Chromium, open the mobile menu and activate About, Skills, then Projects with Enter. Go Back twice, then Forward twice. Before the fix, the first Back restored `#skills` and section focus but left Skills at 131 px from the top against a 67 px header. About remained highlighted. Forward also reproduced a stale highlight even when Skills aligned at 82 px.

The old hash handler issued another CSS-smoothed scroll during native history restoration. Also, its narrow IntersectionObserver band only refreshed the active section when an intersection changed. That notification could arrive before the destination reached the position used by the highlight calculation, with no further notification once the scroll settled.

### Fix and evidence

Hydrated section links now use native history entries and issue one smooth scroll. Back and Forward handle `popstate` and `hashchange` through one scheduled callback that aligns the latest fragment immediately. The browser still manages the history stack. Real anchor links provide navigation before hydration. One passive scroll listener schedules geometry updates at most once per frame. The same geometry calculation drives the highlight after a navigation, resize, or manual scroll. Manual scrolling leaves focus alone.

In the Chromium in-app browser against the production build, About → Skills → Projects → Back → Back → Forward → Forward settled correctly at 320 × 568, 390 × 844, and 1280 × 900. All 21 observations matched URL hash, focus, and highlight. Section tops were 82–83 px with the header ending at 67 px. Rapid mobile navigation ended on Projects. Escape restored focus to the menu trigger. At 390 × 844 the chat composer accepted text and kept it while scrolling in both directions, the mobile menu indicator updated, and page overflow was zero. No chat request was sent.

`tests/scroll-navigation.browser.mjs` automates the three viewport sequences, matching the hash, focus, active link, offset, and overflow. It also checks computed scrolling in both motion preferences, console errors, and native fragment navigation without JavaScript. With a local production server listening on port 3123 and Playwright available, run `node tests/scroll-navigation.browser.mjs`. Set `PORTFOLIO_URL` for a different server, or pass engine names to select a subset. The standalone runner could not launch its browsers under this environment's process restrictions. The 21 Chromium checks above were performed separately in the in-app browser. Firefox, WebKit, browser zoom, reduced-motion emulation, and delayed-hydration or JavaScript-disabled browser sessions remain unverified. The CSS media query and visible server markup were checked separately.

A fresh Chromium session reported zero console warnings or errors and zero horizontal overflow in the 320 × 568 navigation smoke check. Final lint, TypeScript, 12 unit tests, 6 PostgreSQL checks, 9 chat integration checks, Prettier, and the production build passed.
