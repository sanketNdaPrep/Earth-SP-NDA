# CLAUDE.md — EARTH SP NDA

Read `AGENTS.md` first: this is Next.js 16 and its APIs differ from older versions. Check `node_modules/next/dist/docs/` before writing Next-specific code.

## Stack
Next.js 16.4 (App Router) · React 19.3 · TypeScript strict · Tailwind CSS v4 (CSS-first, tokens in `app/globals.css` `@theme`; **no `tailwind.config` file**) · framer-motion · Supabase · Vercel.

## Hard rules
1. **Do not alter protected logic**: `lib/supabaseClient.ts`, `components/landing-data.tsx`, every Supabase/auth call, and all hooks/parsers/scoring/storage files (see `COMPONENT_INVENTORY.md`). Restyle presentation only; never change props, state or data flow.
2. **No route changes** under `app/`.
3. **Tailwind tokens only** — no arbitrary values (`w-[13px]`, `text-[#fff]`). Add a token to `@theme` instead.
4. **Radix**: install individual headless `@radix-ui/react-*` packages only. Never `@radix-ui/themes`.
5. Use `cn()` from `@/lib/utils` for class composition; use primitives from `components/ui/`.
6. Icons come from `components/ui/icons.tsx`.
7. One component integration at a time; test, report, wait for "NEXT".
8. Install deps with `--legacy-peer-deps` (see `.npmrc`).
9. Every `app/dev/*/page.tsx` wraps its content in `bg-navy-950 text-steel-100` so previews and screenshots show the base dark tokens.

## Known issues / TODO
- // TODO: SECURITY FIX: Hardcoded passcode (`ADMIN_SECRET_PASSCODE` in `app/admin/signup/page.tsx`, readable in the client bundle). Deliberately untouched; fix after the redesign is complete.
- No `test` script in `package.json` (vitest tests exist in `tests/`).
- Legacy palettes (slate/zinc/amber) still present in auth/profile/quizzes pages; migrate to tokens during integration.
- Three duplicate icon sets (`components/icons.tsx`, `components/quiz/icons.tsx`, `components/admin/dashboard/icons.tsx`) to migrate into `components/ui/icons.tsx`.
- Stray `components/admin/seed/page.tsx` (not a route).
