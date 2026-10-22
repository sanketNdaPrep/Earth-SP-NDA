# EARTH SP NDA — Admin Question Seeding Portal

The Seeding Portal is a high-speed data entry, validation, and batch ingestion engine designed to populate Supabase quiz modules with precision.

## Key Features
- **Single Question Entry**: Form with live symbol helpers, interactive student preview, and real-time quality checklists.
- **Bulk Parser**: Batch paste text blocks (`Q:`, `A:`, `Ans:`, `Exp:`) or JSON to seed up to 200 questions simultaneously.
- **Module Inventory**: Read-only viewer for existing questions linked via `quiz_id`.
- **Autosave Buffer**: Local storage draft preservation across browser reloads.
- **Supabase Active**: Live integration with core database tables (`quizzes`, `questions`, `resources`).

## Tech Standards
- Next.js 16 (App Router)
- Tailwind CSS v4 custom tactical military palette (`bg-navy-950`, `bg-navy-900`, `border-steel-700`, `emerald-400`, `gold-400`)
- TypeScript Strict Type Checking