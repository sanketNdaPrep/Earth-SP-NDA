# Component Inventory

Status: ✅ done · 🟡 planned · 🔒 protected logic (do not modify)

## Final state (cleanup and audit)
The PDF-to-Quiz and AI Tutor features are dropped permanently and the redesign is closed. `app/dev` (28 preview pages) and every link to `/dev` and `/ui-demo` were removed after checking that nothing outside `app/dev` imported from it. Every `/dev/...` mention below is historical. `tsc` is clean, `eslint` has 0 errors (2 warnings), and `next build` passes.

This file lists what is built and what is on a live page. See "Final status of the 26 reference components" below. Known gaps that remain are listed at the end of that section.

## Foundation (Phase 2)
| File | Status |
|---|---|
| `lib/utils.ts` (`cn`) | ✅ |
| `components/ui/icons.tsx` (reference #1) | ✅ added (+ user, mail, lock, check, target, calculator, shield, plane, checkCircle, sigma, triangle, atom, flask, globe, landmark, users, trendUp, trendDown icons); call-site migration 🟡 |
| `components/ui/icons-demo.tsx` (reference #1 demo) | ✅ Integrated and Verified; dev-only gallery at `/dev/icons` (404 in production) |
| `components/ui/button.tsx` | ✅ added; adoption 🟡 |
| `components/ui/badge.tsx` | ✅ added; adoption 🟡 |
| `components/ui/card.tsx` (Card, Header, Title, Description, Content, Footer) | ✅ |
| `components/ui/input.tsx`, `components/ui/label.tsx` | ✅ |
| `components/ui/border-beam.tsx` (+ CSS in globals.css) | ✅ |
| `components/ui/login-card-demo.tsx` (reference #2) | ✅ presentational; dev preview `/dev/login-card`; real login pages not yet migrated 🟡 |
| `components/ui/tabs.tsx` (Radix), `components/ui/select.tsx`, `components/ui/brand-mark.tsx` | ✅ |
| `components/ui/auth-form.tsx` (reference #3) | ✅ presentational; dev preview `/dev/auth-form`; real login/signup pages not yet migrated 🟡 |
| `components/ui/feature-cards.tsx` (FeatureCard, FeatureCardFan), `components/ui/feature-cards-demo.tsx` (reference #4, Tier 2) | ✅ dev preview `/dev/feature-cards`; not yet placed on the landing page 🟡 |
| `components/ui/feature-card-face.tsx` (shared card look: Feature type, `FeatureCardFace`, `FEATURE_CARD_SHELL`) | ✅ extracted from feature-cards |
| `components/ui/card-spread.tsx`, `components/ui/card-spread-demo.tsx` (reference #5) | ✅ pure CSS, any card count; dev preview `/dev/card-spread`; not yet on the landing page 🟡 |
| `hooks/use-mouse-position.ts` (new top-level hooks folder) | ✅ |
| `components/ui/shiny-checklist-card.tsx` (reference #6, renamed from GithubCardShiny) | ✅ "Daily mission" checklist; dev preview `/dev/shiny-card`; not yet placed on a page 🟡 |
| `hooks/use-animated-number.ts` | ✅ |
| `components/ui/glow-card.tsx` (Tier 1: pointer-glow card, rounded-panel) | ✅ |
| `components/ui/performance-bento.tsx` (reference #7, repurposed from the tech stack bento) | ✅ prop-driven, no timers or random data; dev preview `/dev/performance-bento` with sample data; wiring to real dashboard data is a later approved step 🟡 |
| `components/ui/timeline.tsx`, `components/ui/timeline-demo.tsx` (reference #8, Tier 2) | ✅ written from scratch (only the demo was provided); dev preview `/dev/timeline`; `components/journey.tsx` deliberately untouched, restyle on this Timeline is a later step 🟡 |
| `components/ui/stats-grid.tsx` (reference #9, Tier 1, server component) | ✅ rebuilt from DaisyUI classes with Tailwind tokens; `stats` required, no built-in numbers; dev preview `/dev/stats-grid`; not yet used on the dashboard. ✅ Integrated and Verified 🟡 |
| `components/ui/alert-dialog.tsx`, `alert-dialog-demo.tsx` (reference #10, client) | ✅ built on `@radix-ui/react-alert-dialog`; `tone="danger"`, Cancel focused first, info-only mode focuses the action; dev preview `/dev/alert-dialog`; not yet used in real flows 🟡 |
| `components/ui/accordion.tsx`, `accordion-demo.tsx` (reference #11, client) | ✅ built on `@radix-ui/react-accordion`; `AccordionList` is prop-driven, supports single and multiple, disabled items show a visible note; dev preview `/dev/accordion`; `components/faq.tsx` untouched 🟡 |
| `components/ui/toast.tsx`, `toast-demo.tsx` (reference #12, client) | ✅ built on `@radix-ui/react-toast` with a global `toast.add({ type, title, description, priority, duration })` store; max 3 visible; dev preview `/dev/toast` mounts its own `Toaster`; NOT mounted in `app/layout.tsx` yet 🟡 |
| `components/ui/progress.tsx`, `progress-demo.tsx` (reference #13, Tier 1, server component) | ✅ rebuilt from DaisyUI classes as `role="progressbar"` div; required `label`, tones, `showValue`, indeterminate; dev preview `/dev/progress`; `cadet-profile-card.tsx` untouched 🟡 |
| `components/ui/radial-progress.tsx`, `radial-progress-demo.tsx` (reference #14, Tier 1, server component) | ✅ rebuilt from DaisyUI `radial-progress` as an SVG ring inside `role="progressbar"`; required `label`, tones, sizes, thickness, custom centre; dev preview `/dev/radial-progress`; `performance-bento.tsx` and `subject-breakdown.tsx` rings untouched 🟡 |
| `components/ui/skeleton.tsx`, `skeleton-card.tsx`, `skeleton-demo.tsx` (reference #15, Tier 1; demo is client) | ✅ `Skeleton`, `SkeletonGroup`, `SkeletonCard`, `SkeletonList`, `SkeletonText`; announced once via `role="status"`; pulse or shimmer, off under reduced motion; dev preview `/dev/skeleton`; `vault.tsx`, `site-header.tsx`, `app/quizzes/page.tsx` loading placeholders untouched 🟡 |
| `components/ui/skeleton-media-card.tsx` (reference #16, Tier 1, server component; toggle demo added to `skeleton-demo.tsx`) | ✅ `SkeletonMediaCard`: image-first tile placeholder reusing `Skeleton` and `SkeletonGroup`; fills its container; optional `bordered` Card; dev preview `/dev/skeleton-media-card`; `vault.tsx` placeholders untouched 🟡 |
| `components/ui/badge-variants.tsx` (reference #17, demo only) and extended `components/ui/badge.tsx` | ✅ existing variants unchanged (class strings verified identical); added `ghost`, `solid`, `dot`, aliases `secondary` and `destructive`; dev preview `/dev/badge` 🟡 |
| `app/not-found.tsx`, `components/ui/not-found-section.tsx`, `go-back-button.tsx` (reference #18) | ✅ branded 404 (new file, no existing route changed); section is a server component, only `GoBackButton` is client; real quick links `/quizzes`, `/#vault`, `/dashboard`; dev preview `/dev/not-found` 🟡 |
| `components/ui/layout-text-flip.tsx`, `layout-text-flip-demo.tsx` (reference #19) | ✅ built from scratch on the installed framer-motion; client component; rotating word in a pill; pauses on hover, focus, hidden tab; optional `showControl` button and `paused` prop; `fixedWidth` mode; static first word under reduced motion; dev preview `/dev/layout-text-flip` 🟡 |
| `components/ui/stacked-sections.tsx`, `stacked-sections-demo.tsx` (reference #20) | ✅ server components, CSS `sticky` only (no `lenis`, no client JS); `StackedSections` + `StackedSection` (`tone`, `roundedTop`, `heading`, `headingLevel`); `.stack-grid` texture class in `globals.css`; not sticky under reduced motion; dev preview `/dev/stacked-sections` 🟡 |
| `components/ui/dock.tsx`, `dock-demo.tsx` (reference #21) | ✅ built from scratch (the reference's `@/registry/magicui/dock` was not supplied) on framer-motion; client component; `Dock` (`nav` + list, required `label`) and `DockItem` (link via `href` or button via `onClick`, required `label`, optional `current`); magnifies for mouse only, keyboard focus enlarges, fixed size on touch and under reduced motion; constant height; icons `home`, `clipboardCheck`, `layoutDashboard` added; dev preview `/dev/dock` 🟡 |
| `components/ui/footer.tsx`, `footer-demo.tsx` (reference #22) | ✅ prop-driven server component (`columns`, `brand`, `legal`, required `year` and `owner`, optional `credit`); each column is a named `nav`; optional highlight row with `arrowRight`; 1 to 4 columns, stacked on phones; no built-in links; `arrowRight` icon added; dev preview `/dev/footer` 🟡 |
| `components/ui/fab.tsx`, `fab-demo.tsx` (reference #23) | ✅ client component, no DaisyUI and no `lucide-react`; `Fab` (required `label`, 2 to 4 `actions` each with required `label`, `icon` and `href` or `onClick`, `direction` up-left, up or up-right); real toggle button with `aria-expanded`; closes on Escape, outside tap, tab-away and choosing an action; closed actions `inert`; inline (no `fixed`); `plus` icon added; dev preview `/dev/fab` 🟡 |
| `components/ui/hero-split.tsx`, `hero-split-demo.tsx` (reference #24) | ✅ prop-driven server component (`heading` required; `accent`, `headingLevel`, `eyebrow` with optional `href`, `description`, `actions`, `stats`, `visual` all optional); no globe, no `BlurFade`, no `NumberTicker`, no animation; uses `Badge`, `Button asChild`, `RadialProgress` in the demo; dev preview `/dev/hero-split` 🟡 |
| `components/ui/hero-centered.tsx`, `hero-centered-demo.tsx` (reference #25) | ✅ server components `HeroCentered` (`heading` as ReactNode, `headingLevel`, `description`, `actions`, `note`, `grid`) and `InlinePill` (`label`, decorative `icon`, `tone` neutral, gold or emerald, `suffix`); dark only; no animation; em-based `.inline-pill` classes added to `globals.css`; dev preview `/dev/hero-centered` 🟡 |
| Dialog, Toast | 🟡 |

## Protected (🔒)
- `lib/supabaseClient.ts`, `components/landing-data.tsx`
- `components/quiz/`: `scoring.ts`, `use-quiz-session.ts`, `storage.ts`, `attempt-detail.ts`, `question-loader.ts`, `use-countdown.ts`, `types.ts`, `quiz-player.tsx`
- `components/dashboard/`: `analytics.ts`, `use-dashboard-data.ts`, `types.ts`
- `components/results/`: `review.ts`, `rank-estimate.ts`, `speed.ts`, `use-attempt-results.ts`, `types.ts`
- `components/admin/seed/`: `use-seed-form.ts`, `use-bulk-import.ts`, `bulk-parser.ts`, `validators.ts`, `use-module-questions.ts`, `draft-storage.ts`, `data.ts`, `types.ts`
- `components/admin/dashboard/`: queries in `dashboard.tsx`, `types.ts`; `lib/admin-preview-data.ts`
- Auth calls in `app/login`, `signup`, `profile`, `admin/login`, `admin/signup`

## Presentation (styleable)
Landing: `site-header`, `hero`, `forces-info`, `cadet-snapshot`, `about`, `journey`, `books`, `vault`, `faq`, `site-footer`, `record-board`, `icons`.
Quiz: `briefing-screen`, `dialog`, `question-card`, `question-palette`, `quiz-timer`, `submit-dialog`, `styles`, `icons`, `math-text`.
Dashboard: `dashboard-view`, `cadet-profile-card`, `attempt-log`, `quick-launch`, `subject-breakdown`, `section-card`, `top-bar`.
Results: `results-view`, `scorecard`, `question-list`, `solution-drawer`, `speed-meter`, `filter-tabs`.
Admin: all non-hook files in `admin/seed/` and `admin/dashboard/`.
Pages: `login`, `signup`, `profile`, `quizzes`, `admin/login`, `admin/signup` (markup only).

## Integration queue (26 reference components)
### Final status of the 26 reference components
**Integrated** = used by a live page. **Built, not placed** = finished and tested but no live page uses it. **Not provided** = never supplied.

| # | Component | Final status | Where it is used |
|---|---|---|---|
| 1 | Icons & Visual Assets | Integrated | App-wide (the 3 older icon sets are still in the repo) |
| 2 | Border Beam Login Card | Built, not placed | - |
| 3 | Tabbed Auth Form | Built, not placed | - |
| 4 | Feature Cards | Built, not placed | - |
| 5 | Card Spread | Built, not placed | - |
| 6 | Shiny Checklist Card | Built, not placed | - |
| 7 | Performance Bento | Integrated | Homepage, dashboard |
| 8 | Timeline | Integrated | Homepage (placeholder copy) |
| 9 | Stats Grid | Integrated | Homepage, dashboard, analytics, mock result |
| 10 | Alert Dialog | Integrated | Admin resources, admin question bank |
| 11 | Accordion | Built, not placed | - |
| 12 | Toast | Mounted, never called | `Toaster` is in `app/layout.tsx`; nothing calls `toast.add` yet |
| 13 | Progress | Integrated | Dashboard subject breakdown |
| 14 | Radial Progress | Integrated | Analytics |
| 15 | Skeleton | Integrated | Quizzes, study tracker, study material, header actions |
| 16 | Skeleton Media Card | Built, not placed | - |
| 17 | Badge | Integrated | Many pages |
| 18 | Not Found | Integrated | `app/not-found.tsx` |
| 19 | Layout Text Flip | Built, not placed | - |
| 20 | Stacked Sections | Integrated | Homepage (placeholder copy) |
| 21 | Dock | Built, not placed | - |
| 22 | Modern Footer | Built, not placed | - |
| 23 | FAB | Built, not placed | - |
| 24 | Hero Split | Built, not placed | - |
| 25 | Hero Centered | Built, not placed | - |
| 26 | (never supplied) | Not provided | - |

Why not all 26 say "Integrated": 12 are on live pages (counting Toast as mounted), 13 are built but unused, and #26 was never given to me. Marking them Integrated would make this file wrong.

### Known gaps in the final state
- `/dashboard/analytics` shows hard-coded sample numbers, not the student's own results.
- `/admin` (Overview) and `/admin/students` show sample students and exam stats; `/admin/dashboard` shows preview figures while `SHOW_SAMPLE_DATA` is on.
- The homepage Timeline and Stacked Sections carry placeholder copy.
- `/mocks/[id]` is a demo runner with 4 fixed questions; `mock_tests` rows are not linked to questions.
- The sidebar "Mock Tests" link, the dashboard button and links on `/exams/[id]` point to `/dashboard/mocks` and `/dashboard/mocks/{id}`, which do not exist.
- Two lint warnings: `app/error.tsx` (window.location.href) and `app/signup/page.tsx` (unused `data`).
- Next.js 16.4.0 reports a security advisory; the upgrade has not been run.

### Build notes (kept for reference)
1. Icons & Visual Assets (+ demo) — ✅ Integrated and Verified; migrating the 3 old icon sets and pruning unused brand icons is pending

2. Border Beam Login Card — ✅ built, awaiting your confirmation; adoption into `app/login` and `app/admin/login` is a separate approved step.

3. Tabbed Auth Form — ✅ built (no username/photo fields: backend does not accept them); adoption into `app/login` and `app/signup` is a separate approved step.

4. Spring Interactive Feature Cards — ✅ built (framer-motion, token art instead of photos, NDA Maths / GAT / CDS and AFCAT copy); placement on the landing page is a separate approved step.

5. Interactive Card Spread — ✅ built from `card-spread.css` only (the .tsx was not provided); generalised with --n and --i; switch toggle with a constant label; Feature Cards refactored to share the card face.

6. Shiny Workflow Card + useMousePosition — ✅ built as `ShinyChecklistCard` (Daily mission). Fixed the glow offset bug, replaced lucide icon, semantic list with screen-reader status, optional `done` flag, glow tinted gold.

7. Interactive Tech Stack Bento Grid — ✅ built as `PerformanceBento` (Cadet performance). Removed fake live numbers and timers, rebuilt GlowCard on `useMousePosition` + CSS variables, keyboard-scrubbable chart with hidden data table, subject chips as links.

8. Timeline — ✅ built with placeholder "Preparation roadmap" content (no personal journey data, no photos, no emoji). Scroll beam is a scaled element; reduced motion shows it static.

9. Statistics Grid — ✅ built as `StatsGrid` (DaisyUI not installed, so the look was rebuilt in Tailwind). Required `stats`, structured `trend` with icon, colour and screen-reader text, `<dl>` markup, icons by name.

10. Feedback Dialogs / Alert Dialog — ✅ built. The reference demo imported a primitive that was not supplied, so `alert-dialog.tsx` was written from scratch on headless Radix. Cadet placeholder copy, `tone="danger"` (warning icon, red action), CSS keyframes on `data-state`, no overlay-click close, reduced-motion safe.

11. Accordion with Disabled Item — ✅ built. The reference imported a primitive that was not supplied, so `accordion.tsx` was written from scratch on headless Radix. Prep-portal placeholder copy, visible "Coming soon" note on the disabled item, CSS height keyframes, `chevronDown` icon added.

12. Toast Notifications — ✅ built. The reference used a Base UI style `toast.add` API with no module supplied, so a small global store plus a Radix Toast `Toaster` was written to keep the same call. Added optional `title`, five types with icon and text (never colour alone), `priority: "high"` is assertive, 5s default and 8s for errors, `duration: 0` sticky, three visible at most. Icons `info`, `xCircle`, `close` added.

13. Progress Neutral Bar — ✅ built as `Progress`. DaisyUI is not installed and native `<progress>` cannot be styled with utilities, so it is a `div` with `role="progressbar"`, `aria-valuenow/min/max`, a required accessible `label`, tones neutral, gold, emerald and danger, optional visible percent, clamping, custom `max`, and an indeterminate loading mode.

14. Radial Progress — ✅ built as `RadialProgress`. DaisyUI is not installed, so the ring is SVG with `stroke-dasharray`, inside a `role="progressbar"` div with a required accessible `label` (the reference had none), tones neutral, gold, emerald and danger, sizes sm, md and lg, thin or regular ring, percent in the centre by default with a `children` override and `valueText`, clamping, custom `max`, and no built-in data.

15. Skeleton Card — ✅ built. The reference imported a `Skeleton` primitive that was not supplied, so `Skeleton` and `SkeletonGroup` were written from scratch, plus `SkeletonCard` (fills its container, no fixed width), `SkeletonList` and `SkeletonText`. Placeholders are decorative; the group announces one hidden message. Header row heights match a real title and description so the loaded card does not jump (tested: zero height change).

16. Skeleton Card Demo — ✅ built as `SkeletonMediaCard` (a variant, not a copy of `SkeletonCard`). Image-first layout with a 16:9 media block, short title bar and text lines; announced once through `SkeletonGroup`; fills its container (no `w-52`); `rounded-control`; optional `bordered`; row heights match real text so the loaded tile does not jump (tested, both variants).

17. Badge Variants — ✅ extended, not replaced. `Badge` already existed from Phase 2, so the reference was mapped onto it: Default and Secondary are `neutral`, Destructive is `danger`, Outline is `outline`. Added the missing `ghost`, a boolean `solid` (gold, emerald, danger; near-black text, contrast 5.2:1 or better), a decorative `dot`, and the aliases `secondary` and `destructive`. Every existing call site is unaffected.

18. Not Found Page — ✅ built. Rebuilt from `gray-*`/`blue-*`/`dark:` classes and `lucide-react` onto our tokens; `app/not-found.tsx` is new (before this the app showed Next's unbranded default 404); the section fills the layout's height instead of nesting `min-h-screen`; `GoBackButton` goes back only when there is an earlier page on this site (Navigation API, history length fallback) and otherwise goes home; `arrowLeft` icon added.

19. Layout Text Flip — ✅ built. Written from scratch on framer-motion (the reference used `motion`, not installed) and our tokens only. Screen readers get one static sentence; the animated copy is `aria-hidden`. Rotation pauses on hover, focus, hidden tab, the `paused` prop and an optional visible pause/play button. Reduced motion shows the first word with no timer. `fixedWidth` reserves the longest word's width to stop layout shift. `pause` and `play` icons added. Not used on any real page yet.

20. Stacked Scroll Sections — ✅ built. The reference needed `lenis` (scroll hijacking) and used `slate`/`neutral` colours, arbitrary gradient and size values, `h-screen`, emoji, three `h1`s and its own `<main>`. Rebuilt with plain CSS `sticky` on our tokens: no new dependency and no client JavaScript. The grid became a `.stack-grid` class that follows the section's text colour, so it stays faint on dark and light tones. Sections use `min-h-dvh`, render `h2` by default, and stop being sticky under reduced motion. Keep section content short: a section taller than the screen cannot show its bottom before the next covers it. Not used on any real page yet.

21. Navigation / Layout (Dock) — ✅ built. The reference file was only a demo importing a `Dock` that was not included, so `Dock` and `DockItem` were written from scratch on the installed framer-motion. Brand icons (GitHub, Notion, Google Drive, WhatsApp, with hardcoded hex colours and a hook called inside an object) were dropped for single-colour `currentColor` icons. Every item is a real link or button with a required label that doubles as tooltip and accessible name. The row never changes height; items grow upward, so the tooltip needs free space above the dock. The component is inline (no `fixed`). Not added to `site-header.tsx` or any real page.

22. Modern Footer — ✅ built as a generic primitive; the live `components/site-footer.tsx` is untouched. The reference used shadcn tokens (`muted-foreground`, `accent`), a `theme(backgroundColor.white/8%)` call that does not exist in Tailwind v4, an arbitrary radial gradient, `lucide-react`, placeholder `#` links and `new Date().getFullYear()`. All replaced: our tokens, no gradient (dropped by decision), `Icons.arrowRight`, real routes only, and the year is a required prop so the server render never depends on the date. Column titles are `p` elements inside `nav` landmarks, not orphan headings. External `https` links open in a new tab with hidden text saying so. More than four columns are not rendered. Swapping `site-footer.tsx` over to this is a separate approved step.

23. Radial Floating Action Button — ✅ built. The reference relied entirely on DaisyUI classes (`fab`, `fab-flower`, `btn-circle`), which are not installed, and `lucide-react`; its toggle was a `div role="button"` opened by `:focus`, so Enter and Space did nothing, there was no `aria-expanded` and no way to close it. Rebuilt with our tokens and a real open state. The separate "main action" button was dropped (the toggle only toggles). Actions sit on an arc at a fixed radius, set by inline transforms, so no arbitrary classes. The toggle comes first in the DOM so Tab moves from it into the open actions (a first version had the actions first and Tab skipped them). The action pointing straight up shows its tooltip above, so it never touches a neighbour. On touch screens there is no hover, so the icons alone carry meaning. Four actions is the limit. Not placed on any real page.

24. Global Infrastructure Hero — ✅ built as a generic layout; the reference's cloud-hosting pitch was not used. Its three imports (`velora/globe`, `blur-fade`, `number-ticker`) were not supplied, a real globe needs a new canvas or WebGL library, and the subject (edge regions, latency, uptime) means nothing to a prep portal. The right column became a `visual` slot (the demo puts a `RadialProgress` there). Dropped: the globe, fade-in wrappers, count-up numbers (stats are plain text), the gradient-clipped headline (the `accent` words are solid `gold-300`), the radial wash, `lucide-react`, dead `#` links, and the non-token classes (`brand`, `muted-foreground`, `bg-radial-[...]`). Stats are a `dl` with the label first in the DOM and shown under the number. Pass `headingLevel="h2"` when the page has its own h1. Demo stats are sample data. `components/hero.tsx` is untouched: it carries the real story and routes, and adopting this layout there is a separate approved step.

25. Centred Hero with Inline Pills — ✅ built as a generic layout. The reference was a light-only incident-alerting hero with brand logos and colours (Discord, Telegram, WhatsApp, Google Chat, Mattermost), `motion/react`, `lucide-react`, a `background-cubes-grid` that was not supplied, many arbitrary values, `href="#"` links, invented claims, and an entrance animation that left the paragraph and buttons at opacity 0 until JavaScript ran (plus a stray `customDelay` prop that does nothing). Kept the one good idea: a pill inside the headline. `InlinePill` is sized entirely in em through `.inline-pill` classes (so it scales with the heading with no arbitrary Tailwind values) and its `suffix` keeps a comma on the same line as the pill. The pill's label stays in the heading text for screen readers; its icon is `aria-hidden`. The optional `grid` prop reuses `.stack-grid`. Everything renders immediately. Demo copy makes no claims. `components/hero.tsx` is untouched.

#26: never supplied.