# Design System

Single source of truth: the `@theme` block in `app/globals.css`.

## Color tokens
| Role | Tokens |
|---|---|
| Background | `navy-950` (page), `navy-900` (panel), `navy-800` (raised/hover) |
| Text & borders | `steel-100` (primary), `steel-300` (secondary), `steel-500` (muted), `steel-700` (borders) |
| Accent | `gold-400` (primary action), `gold-300` (hover/highlight) |
| Success | `emerald-200/300/400` |
| Danger | `danger-400`, `danger-500` |

Note: only emerald 200/300/400 are overridden; other emerald steps still use Tailwind defaults.

## Shape, elevation, motion
- Radius: `rounded-control` (0.25rem), `rounded-panel` (0.375rem)
- Shadow: `shadow-panel`, `shadow-glow`
- Motion: `--duration-fast/base/slow`, `--ease-standard`, `--ease-throw`, `--ease-gather`. Reduced-motion is honoured globally.

## Typography
`font-sans` (Inter) and `font-mono` (JetBrains Mono) are provided by `next/font` in `app/layout.tsx`. Controls and labels use mono, uppercase, wide tracking.

## Custom classes (globals.css)
`.graticule` · `.timeline-rail` · `.glow-card*` · `.bento-*` · `.card-spread*` · `.beam-ring` · `.brackets` (gold corner frame) · `.profile-halo` · `.donut-track` · `.account-icon-draw`

## Primitives (`components/ui/`)
- **Button** — variants `primary | secondary | ghost | danger`; sizes `sm | md | lg | icon`; `loading`; `asChild` (Radix Slot, for `<Link>`).
- **Badge** — variants `neutral | gold | emerald | danger | outline`.
- **Card** — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Input / Label** — form controls with gold focus ring; `aria-invalid` shows the danger border.
- **BorderBeam** — decorative light lapping a `relative overflow-hidden` rounded parent; props `duration`, `size`, `delay`, `reverse`, `className`. Hidden under reduced motion.
- **Tabs** — headless `@radix-ui/react-tabs` styled with tokens; active tab uses a gold underline via `data-[state=active]`.
- **Select** — styled native select with chevron.
- **BrandMark** — local icon + "EARTH SP NDA" wordmark.
- **AuthForm** — Sign In / Sign Up card (presentational). Signup fields: full name, email, password, confirm, target entry (NDA, CDS, AFCAT, ACC). Calls `onSubmit({ mode, email, password, fullName?, targetExam? })`; the page owns Supabase.
- **FeatureCard / FeatureCardFan** (Tier 2) — spring-scale cards with token gradient art; hover (mouse only) and keyboard focus raise and scale the card; optional `href` makes it a link; reduced motion disables springs and entrance. Fan tilt uses Tailwind classes on the outer wrapper, motion on the inner one.
- **FeatureCardFace / FEATURE_CARD_SHELL** — the shared look of a track card (gradient art, icon, category, title, marking-scheme badges). Used by FeatureCard and CardSpread.
- **CardSpread** — deck of cards that fans out; native checkbox with `role="switch"` and a constant label; pure CSS using `:has()`, any count via `--n` and `--i`; stacked cards come to the front on focus. Browsers without `:has()` show a plain grid.
- **ShinyChecklistCard** (Tier 2) — checklist card with a gold glow that follows the mouse (`hooks/use-mouse-position.ts`, one update per animation frame). Steps take `title`, `time`, optional `done`; screen readers hear "Completed:" or "To do:". The glow is decorative and hover-only.
- **GlowCard** (Tier 1) — card whose border glows toward the pointer; accents `gold | emerald | steel | danger` map to theme tokens; hover and focus-within are pure CSS; `rounded-panel` corners.
- **PerformanceBento** (Tier 2) — five-card cadet performance grid driven entirely by props (scores, subject stats, log, rings, daily counts, subject chips). Never feed it simulated numbers; set `sample` to show a "Sample data" badge. The score chart is a `role="slider"` (arrow keys, Home, End) with a hidden data table.
- **Timeline** (Tier 2) — vertical timeline: ordered list, sticky titles from `md`, scroll-driven gold beam on a faded rail (`.timeline-rail`); reduced motion shows the beam full length. Entries are `{ title, content }`.
- **StatsGrid** (Tier 1, server component) — row of key figures as a `<dl>`; stacked on phones, equal columns from `sm` for any count. `stats` is required (never invents numbers). Each stat: `title`, `value`, optional `description`, `icon` (by name), `trend { direction: up | down | flat, text }` shown with icon, colour and screen-reader text. DaisyUI is not used in this project.
- **AlertDialog** (Tier 1, client component, Radix `@radix-ui/react-alert-dialog`) — modal that needs an explicit answer. Parts: `AlertDialog`, `Trigger`, `Content`, `Header`, `Title`, `Description`, `Footer`, `Cancel`, `Action`. `Content tone="danger"` adds a warning icon and turns `Action` red. Cancel is focused on open; with no Cancel (information-only) the Action is focused. Escape cancels, overlay click does not. Open and close animate with CSS keyframes on `data-state` (`dialog-in`, `dialog-out`).
- **Accordion** (Tier 1, client component, Radix `@radix-ui/react-accordion`) — expandable sections. Parts: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`; `AccordionList` is the prop-driven wrapper (`items`, `type` single or multiple, `defaultOpen`). Disabled items are dimmed, not focusable, and can show a visible note such as "Coming soon". Height animates with CSS keyframes (`accordion-down`, `accordion-up`).
- **Toast** (Tier 1, client component, Radix `@radix-ui/react-toast`) — transient messages. Call `toast.add({ type, title, description, priority, duration })` from anywhere; mount `<Toaster />` once (not yet in the real layout). Types: default, success, info, warning, error, each with icon, colour bar and screen-reader prefix. `priority: "high"` is announced assertively. Defaults: 5s, errors 8s, `duration: 0` is sticky. Maximum three visible; the oldest is dismissed when a fourth arrives. Pauses on hover and focus, swipe right to dismiss, F8 jumps to the toast area. Dismissing the focused toast blurs it first so later timers are not left paused.
- **Progress** (Tier 1, server component) — `div` with `role="progressbar"`. Props: `label` (required, the accessible name), `value` (omit for indeterminate), `max` (default 100), `tone` (neutral, gold, emerald, danger), `size` (sm, md), `showValue` (visible percent, hidden from screen readers because the bar already announces it). Values are clamped between 0 and `max`. Fills its container; the caller sets the width.
- **RadialProgress** (Tier 1, server component) — circular `role="progressbar"`. Props: `label` (required, the accessible name), `value` (required), `max` (default 100), `tone` (neutral, gold, emerald, danger), `size` (sm, md, lg), `thickness` (thin, regular), `valueText` (spoken value override), `children` (centre content, default the percent). Arc starts at 12 o'clock and runs clockwise. Values are clamped. Centre text and SVG are hidden from screen readers.
- **Skeleton** (Tier 1, server components) — loading placeholders. `Skeleton` is one decorative block (`aria-hidden`, `animation` pulse, shimmer or none). `SkeletonGroup` wraps blocks with `role="status"`, `aria-busy` and a hidden `label` (default "Loading") so the area is announced once. Presets: `SkeletonCard` (`lines`, `media`), `SkeletonList` (`rows`), `SkeletonText` (`lines`). Render only while loading and swap for real content. Animations stop under reduced motion.
- **SkeletonMediaCard** (Tier 1, server component) — image-first loading tile: 16:9 media block, short title bar, `lines` text lines. Props: `label`, `lines`, `bordered` (wraps in `Card`), `animation`. Reuses `Skeleton` and `SkeletonGroup`; fills its container; row heights match a `leading-6` title and `leading-5` text so the loaded tile does not jump.
- **Badge, extended** (component 17) — variants `neutral` (default), `gold`, `emerald`, `danger`, `outline`, `ghost`; aliases `secondary` (neutral) and `destructive` (danger). `solid` gives a solid fill with near-black text for gold, emerald and danger (ignored by the others). `dot` adds a decorative leading dot in the badge colour: keep the meaning in the text, never colour alone.
- **NotFoundSection** (Tier 1, server component) and **GoBackButton** (client) — 404 screen. Props: `code`, `title`, `description`, `homeHref`, `links` (helpful pages), `showBack`. Fills its parent's height; render inside the root layout. `GoBackButton` goes back only if there is an earlier same-site page, otherwise to `homeHref`. Used by `app/not-found.tsx`.
- **LayoutTextFlip** (Tier 1, client component) — a fixed phrase followed by a rotating word in a pill. Props: `text`, `words` (required), `interval` (ms, minimum 500), `paused`, `showControl` (visible pause/play button), `fixedWidth` (reserve the longest word's width), `className`. Pauses on hover, focus and hidden tab; shows the first word with no timer under reduced motion. Screen readers read one static sentence.
- **StackedSections / StackedSection** (Tier 1, server components) — full-height cards that stick to the top so the next slides over the previous. Pure CSS `sticky` (no scroll library, no client JS). `StackedSection` props: `heading`, `headingLevel` (`h2` default, `h3`, `h4`; the page owns the one `h1`), `tone` (`dark`, `raised`, `light`), `roundedTop` (rounded corners and a top edge), `children`. Uses the `.stack-grid` texture class. Not sticky under reduced motion. Keep content shorter than the screen.
- **Dock / DockItem** (Tier 1, client components) — a row of icon links that grow near the mouse pointer. `Dock` props: `label` (required, names the `nav`), `className`, `children`. `DockItem` props: `label` (required: tooltip and accessible name), `href` (link) or `onClick` (button), `current` (sets `aria-current` and shows a dot), `children` (decorative icon). Magnification is mouse-only; keyboard focus enlarges the focused item; touch and reduced motion keep a fixed size. Constant height, inline (no `fixed`); leave free space above for the tooltip.
- **Footer** (Tier 1, server component) — up to four link columns in a bordered grid (stacked on phones), with optional brand block, optional legal text and a copyright line. Props: `columns` (`title`, `links`, optional `highlight` row with an arrow), `brand`, `legal`, `year` (required), `owner` (required), `credit`. Each column is a `nav` named by its title. No built-in links. Does not replace `site-footer.tsx` yet.
- **Fab** (Tier 1, client component) — a round toggle that fans two to four round actions out in an arc. Props: `label` (required, names the toggle), `actions` (each: `label` required, `icon`, and `href` or `onClick`), `direction` (`up-left` default, `up`, `up-right`), `className` (place it yourself; no built-in `fixed`). Real button with `aria-expanded`; Escape, outside tap, tab-away or choosing an action closes it and returns focus. Closed actions are `inert`. Tooltips on hover and focus; touch screens rely on distinct icons.
- **HeroSplit** (Tier 1, server component) — text on one side and a free `visual` slot on the other (stacked on phones). Props: `heading` (required, plain text), `accent` (last words, solid gold), `headingLevel` (`h1` default, or `h2`), `eyebrow` (`text`, optional `href` makes the pill a link), `description`, `actions` (use `Button asChild` with `Link`), `stats` (`value`, `label`, plain text, not animated), `visual`. All parts except `heading` are optional; with no `visual` the text takes the full width. No animation. Does not replace `components/hero.tsx` yet.
- **HeroCentered / InlinePill** (Tier 1, server components) — a centred hero, dark only, no animation. `HeroCentered` props: `heading` (ReactNode, may contain pills), `headingLevel` (`h1` default, or `h2`), `description`, `actions` (use `Button asChild` with `Link`), `note`, `grid` (faint `.stack-grid` texture). `InlinePill` props: `label` (stays in the heading text), `icon` (decorative), `tone` (`neutral`, `gold`, `emerald`), `suffix` (punctuation kept on the same line). Pill size is in em (`.inline-pill` classes in `globals.css`), so it scales with the heading. Does not replace `components/hero.tsx` yet.
- **Icons** — `Icons.*` object (logo, spinner, chevronRight, book, component, brand marks).
- **`cn()`** — `clsx` + project-aware `tailwind-merge` (`lib/utils.ts`).

## Tiers
Tier 1 (global primitives) must look identical everywhere. Tier 2 (hero, record board, quiz player) keep their distinct identity but use tokens.