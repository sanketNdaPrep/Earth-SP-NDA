-- Task 4: the mock test engine (server-scored attempts).
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.
-- Run migration 006 first.

-- 1. Attempts can now belong to a mock test, not only to a practice module ----
alter table public.user_quiz_attempts alter column quiz_id drop not null;

alter table public.user_quiz_attempts
  add column if not exists attempt_kind text not null default 'practice';
alter table public.user_quiz_attempts
  add column if not exists mock_test_id uuid references public.mock_tests (id) on delete set null;
alter table public.user_quiz_attempts
  add column if not exists time_taken_seconds int;
alter table public.user_quiz_attempts
  add column if not exists details jsonb;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'attempts_kind_check') then
    alter table public.user_quiz_attempts
      add constraint attempts_kind_check check (attempt_kind in ('practice', 'mock'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'attempts_time_check') then
    alter table public.user_quiz_attempts
      add constraint attempts_time_check check (time_taken_seconds is null or time_taken_seconds >= 0);
  end if;
end $$;

create index if not exists user_quiz_attempts_mock_idx on public.user_quiz_attempts (mock_test_id);
create index if not exists user_quiz_attempts_kind_idx on public.user_quiz_attempts (user_id, attempt_kind, attempted_at desc);

-- 2. Only the server can record a mock attempt ---------------------------------
--    Cadets may still log a practice attempt from the browser, as before.
--    A mock attempt is scored on the server, which uses the service role and skips this policy.
drop policy if exists attempts_insert_own on public.user_quiz_attempts;
create policy attempts_insert_own on public.user_quiz_attempts for insert to authenticated
  with check (user_id = auth.uid() and attempt_kind = 'practice' and mock_test_id is null);

-- 3. When each cadet started each mock test (the server keeps the clock) -------
create table if not exists public.mock_test_sessions (
  user_id       uuid not null references auth.users (id) on delete cascade,
  mock_test_id  uuid not null references public.mock_tests (id) on delete cascade,
  started_at    timestamptz not null default now(),
  primary key (user_id, mock_test_id)
);
-- Row Level Security on with no policies: browsers cannot read or write it, only the server can.
alter table public.mock_test_sessions enable row level security;
