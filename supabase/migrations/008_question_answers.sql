-- Security: move every answer key and solution out of the public questions table.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.
-- Run it right after the new version of the site is live (the old code still reads the old columns).
--
-- Before: any signed-in student could read questions.correct_option with the public key.
-- After:  the key lives in question_answers. Only approved admins can read or change it from a browser.
--         Students get it only through the server, after they have submitted a test.

-- 1. The answer key table -----------------------------------------------------
create table if not exists public.question_answers (
  question_id     uuid primary key references public.questions (id) on delete cascade,
  correct_option  text not null check (correct_option in ('A', 'B', 'C', 'D')),
  explanation     text,
  updated_at      timestamptz not null default now()
);

drop trigger if exists question_answers_set_updated_at on public.question_answers;
create trigger question_answers_set_updated_at
  before update on public.question_answers
  for each row execute function public.set_updated_at();

-- 2. Copy the existing answers across (only while the old columns still exist) --
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'correct_option'
  ) then
    insert into public.question_answers (question_id, correct_option, explanation)
    select id, correct_option, explanation from public.questions
    on conflict (question_id) do nothing;
  end if;
end $$;

-- 3. Lock it down: admins only ------------------------------------------------
revoke all on public.question_answers from anon, authenticated;
grant select, insert, update, delete on public.question_answers to authenticated;

alter table public.question_answers enable row level security;

drop policy if exists question_answers_admin_all on public.question_answers;
create policy question_answers_admin_all on public.question_answers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4. Remove the key from the table every student can read ----------------------
alter table public.questions drop column if exists correct_option;
alter table public.questions drop column if exists explanation;
