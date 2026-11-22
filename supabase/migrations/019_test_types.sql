-- Step 3: full mock tests, subject-wise tests and chapter-wise tests share one table.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice. Purely additive.

-- 1. Marks can have decimals (2.5 per question, 0.83 taken off) ----------------------------------
alter table public.mock_tests alter column total_marks type numeric(10, 2);
alter table public.mock_tests alter column passing_marks type numeric(10, 2);

-- 2. Test type, filing, marking and cutoff. The site checks that a subject-wise or chapter-wise test is filed. --------------------------------------------------------
alter table public.mock_tests add column if not exists kind text not null default 'mock';
alter table public.mock_tests add column if not exists subject_id uuid references public.subjects (id) on delete set null;
alter table public.mock_tests add column if not exists chapter_id uuid references public.chapters (id) on delete set null;
alter table public.mock_tests add column if not exists marks_per_correct numeric(6, 2) not null default 1;
alter table public.mock_tests add column if not exists negative_marks numeric(6, 2) not null default 0;
alter table public.mock_tests add column if not exists cutoff_min numeric(10, 2);
alter table public.mock_tests add column if not exists cutoff_max numeric(10, 2);
-- The PDF the admin uploaded, so students can download exactly that file (used in a later step).
alter table public.mock_tests add column if not exists source_pdf text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'mock_tests_kind_check') then
    alter table public.mock_tests add constraint mock_tests_kind_check check (kind in ('mock', 'subject', 'chapter'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'mock_tests_marking_check') then
    alter table public.mock_tests add constraint mock_tests_marking_check
      check (marks_per_correct > 0 and negative_marks >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'mock_tests_cutoff_check') then
    alter table public.mock_tests add constraint mock_tests_cutoff_check
      check (cutoff_min is null or cutoff_max is null or cutoff_max >= cutoff_min);
  end if;
end $$;

create index if not exists mock_tests_kind_idx on public.mock_tests (kind, is_published);
create index if not exists mock_tests_subject_idx on public.mock_tests (subject_id, chapter_id);
