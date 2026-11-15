-- Task 3: attach questions to mock tests.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.

-- 1. Which questions belong to which mock test (and in what order) -----------
create table if not exists public.test_questions (
  mock_test_id  uuid not null references public.mock_tests (id) on delete cascade,
  question_id   uuid not null references public.questions (id) on delete cascade,
  position      int  not null default 1 check (position >= 1),
  added_at      timestamptz not null default now(),
  primary key (mock_test_id, question_id)
);
create index if not exists test_questions_question_idx on public.test_questions (question_id);
create index if not exists test_questions_order_idx on public.test_questions (mock_test_id, position);

grant select, insert, update, delete on public.test_questions to authenticated;

alter table public.test_questions enable row level security;

-- Signed-in cadets see the questions of published tests; admins see everything.
drop policy if exists test_questions_read on public.test_questions;
create policy test_questions_read on public.test_questions for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.mock_tests t where t.id = mock_test_id and t.is_published)
  );

-- Only approved admins add, reorder or remove questions.
drop policy if exists test_questions_admin_write on public.test_questions;
create policy test_questions_admin_write on public.test_questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 2. Audit log: allow "mock_test" as something an admin can act on -----------
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.admin_logs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%entity_type%'
  loop
    execute format('alter table public.admin_logs drop constraint %I', c.conname);
  end loop;
  alter table public.admin_logs
    add constraint admin_logs_entity_type_check
    check (entity_type in ('subject', 'question', 'resource', 'mock_test'));
end $$;
