-- =============================================================================
-- EARTH SP NDA: clean database schema (fresh start)
-- Run the WHOLE file once in Supabase: SQL Editor, New query, paste, Run.
--
-- WARNING: section 1 deletes the old tables and everything in them.
-- Student and admin LOGIN ACCOUNTS (Authentication, Users) are kept.
--
-- Roles: student and admin only.
-- Admin status is stored in auth.users.raw_app_meta_data (role = 'admin',
-- is_approved = true), which only the server can write. Triggers copy it into
-- public.admin_profiles, and every admin-only policy checks that table through
-- public.is_admin().
-- =============================================================================


-- 1. RESET --------------------------------------------------------------------
drop table if exists public.admin_logs         cascade;
drop table if exists public.subjects           cascade;
drop table if exists public.test_attempts      cascade;
drop table if exists public.user_quiz_attempts cascade;
drop table if exists public.study_logs         cascade;
drop table if exists public.subject_progress   cascade;
drop table if exists public.student_queries    cascade;
drop table if exists public.admin_tasks        cascade;
drop table if exists public.questions          cascade;
drop table if exists public.resources          cascade;
drop table if exists public.mock_tests         cascade;
drop table if exists public.quizzes            cascade;
drop table if exists public.admin_profiles     cascade;
drop table if exists public.profiles           cascade;

drop function if exists public.handle_new_user()        cascade;
drop function if exists public.sync_admin_profile()     cascade;
drop function if exists public.is_admin()               cascade;
drop function if exists public.set_updated_at()         cascade;
drop function if exists public.increment_resource_downloads(uuid) cascade;

-- Remove any old trigger on auth.users so it cannot break signups.
do $$
declare t record;
begin
  for t in
    select tgname from pg_trigger
    where tgrelid = 'auth.users'::regclass and not tgisinternal
  loop
    execute format('drop trigger if exists %I on auth.users', t.tgname);
  end loop;
end $$;


-- 2. TABLES -------------------------------------------------------------------

-- Every signed-up user (student or admin) has one row here.
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text not null,
  full_name           text,
  avatar_url          text,
  avatar_id           smallint check (avatar_id between 1 and 10),
  phone_number        text,
  role                text not null default 'student' check (role in ('student', 'admin')),
  target_exam         text not null default 'NDA'     check (target_exam in ('NDA', 'CDS', 'AFCAT')),
  target_year         int  not null default 2027,
  daily_goal_minutes  int  not null default 120 check (daily_goal_minutes between 0 and 1440),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- One row per admin. Written only by the triggers below and by the server.
create table public.admin_profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text,
  phone_number  text,
  about         text,
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- A module (set of questions). The website calls these "quizzes".
create table public.quizzes (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  category         text not null,
  description      text not null default '',
  time_limit_mins  int  not null default 10 check (time_limit_mins > 0),
  created_by       uuid default auth.uid() references auth.users (id) on delete set null,
  created_at       timestamptz not null default now()
);

create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes (id) on delete cascade,
  question_text  text not null,
  option_a       text not null,
  option_b       text not null,
  option_c       text not null,
  option_d       text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  explanation    text,
  position       int,
  created_by     uuid default auth.uid() references auth.users (id) on delete set null,
  created_at     timestamptz not null default now()
);
create index questions_quiz_id_idx on public.questions (quiz_id, position);

create table public.resources (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  category         text,
  size             text,
  recommended_for  text,
  download_url     text not null,
  downloads        int  not null default 0 check (downloads >= 0),
  created_by       uuid default auth.uid() references auth.users (id) on delete set null,
  created_at       timestamptz not null default now()
);

-- Timed full-length papers shown on the exam pages.
create table public.mock_tests (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  code              text not null,
  target_exam       text not null check (target_exam in ('NDA', 'CDS', 'AFCAT')),
  total_questions   int  not null default 0 check (total_questions >= 0),
  duration_minutes  int  not null default 60 check (duration_minutes > 0),
  total_marks       int  not null default 0 check (total_marks >= 0),
  passing_marks     int  not null default 0 check (passing_marks >= 0),
  is_published      boolean not null default true,
  created_by        uuid default auth.uid() references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

create table public.user_quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  quiz_id          uuid not null references public.quizzes (id) on delete cascade,
  score            int  not null check (score >= 0),
  total_questions  int  not null check (total_questions >= 0),
  attempted_at     timestamptz not null default now(),
  check (score <= total_questions)
);
create index user_quiz_attempts_user_idx on public.user_quiz_attempts (user_id, attempted_at desc);
create index user_quiz_attempts_quiz_idx on public.user_quiz_attempts (quiz_id);

create table public.study_logs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject           text not null,
  minutes_studied   int  not null check (minutes_studied >= 0),
  questions_solved  int  not null default 0 check (questions_solved >= 0),
  notes             text,
  logged_at         timestamptz not null default now()
);
create index study_logs_user_idx on public.study_logs (user_id, logged_at desc);

create table public.subject_progress (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_name                text not null,
  total_questions_attempted   int  not null default 0 check (total_questions_attempted >= 0),
  correct_answers             int  not null default 0 check (correct_answers >= 0),
  accuracy_percentage         numeric(5, 2) not null default 0 check (accuracy_percentage between 0 and 100),
  time_spent_minutes          int  not null default 0 check (time_spent_minutes >= 0),
  last_studied_at             timestamptz not null default now(),
  unique (user_id, subject_name)
);

create table public.student_queries (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid default auth.uid() references auth.users (id) on delete set null,
  student_name    text,
  student_email   text,
  query_text      text not null,
  status          text not null default 'pending' check (status in ('pending', 'resolved')),
  admin_response  text,
  resolved_by     uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);
create index student_queries_status_idx on public.student_queries (status, created_at desc);

create table public.admin_tasks (
  id                uuid primary key default gen_random_uuid(),
  assigned_to       uuid not null references auth.users (id) on delete cascade,
  assigned_by       uuid default auth.uid() references auth.users (id) on delete set null,
  task_title        text not null,
  task_description  text,
  status            text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at        timestamptz not null default now()
);
create index admin_tasks_assigned_idx on public.admin_tasks (assigned_to);


-- 3. FUNCTIONS AND TRIGGERS ---------------------------------------------------

-- True when the signed-in user is an approved admin. Reads admin_profiles, so
-- approving or revoking an admin takes effect on the very next request.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and is_approved
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- A new login account gets its rows automatically, even before it confirms email.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_is_admin boolean := coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin';
  exam text := coalesce(new.raw_user_meta_data ->> 'target_exam', 'NDA');
begin
  if exam not in ('NDA', 'CDS', 'AFCAT') then
    exam := 'NDA';
  end if;

  insert into public.profiles (id, email, full_name, phone_number, role, target_exam)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone_number', ''),
    case when meta_is_admin then 'admin' else 'student' end,
    exam
  )
  on conflict (id) do nothing;

  if meta_is_admin then
    insert into public.admin_profiles (id, email, full_name, phone_number, about, is_approved)
    values (
      new.id,
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'phone_number', ''),
      nullif(new.raw_user_meta_data ->> 'about', ''),
      coalesce((new.raw_app_meta_data ->> 'is_approved')::boolean, false)
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keeps admin_profiles and profiles.role in step when app_metadata changes
-- (for example when you approve an admin from the dashboard).
create function public.sync_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_is_admin boolean := coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin';
  approved boolean := coalesce((new.raw_app_meta_data ->> 'is_approved')::boolean, false);
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when meta_is_admin then 'admin' else 'student' end
  )
  on conflict (id) do update
    set role = excluded.role;

  if meta_is_admin then
    insert into public.admin_profiles (id, email, full_name, phone_number, about, is_approved)
    values (
      new.id,
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'phone_number', ''),
      nullif(new.raw_user_meta_data ->> 'about', ''),
      approved
    )
    on conflict (id) do update
      set is_approved = excluded.is_approved,
          email = excluded.email;
  else
    delete from public.admin_profiles where id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_app_metadata_changed
  after update of raw_app_meta_data on auth.users
  for each row
  when (old.raw_app_meta_data is distinct from new.raw_app_meta_data)
  execute function public.sync_admin_profile();

-- Lets any visitor count a download without being allowed to edit resources.
create function public.increment_resource_downloads(p_resource_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.resources set downloads = downloads + 1 where id = p_resource_id;
$$;
revoke all on function public.increment_resource_downloads(uuid) from public;
grant execute on function public.increment_resource_downloads(uuid) to anon, authenticated;


-- 4. PRIVILEGES ---------------------------------------------------------------
-- Start from nothing, then grant only what each table needs. Row Level Security
-- (section 5) then narrows these further, row by row.
revoke all on all tables in schema public from anon, authenticated;

grant select on public.quizzes, public.resources, public.mock_tests to anon;

grant select, insert, update, delete on public.quizzes, public.questions, public.resources, public.mock_tests to authenticated;
grant select on public.admin_profiles to authenticated;
grant select, insert on public.profiles to authenticated;
-- Users may edit these profile fields only. role and email are not on the list.
grant update (full_name, avatar_url, avatar_id, phone_number, target_exam, target_year, daily_goal_minutes)
  on public.profiles to authenticated;
grant select, insert on public.user_quiz_attempts to authenticated;
grant select, insert, update, delete on public.study_logs to authenticated;
grant select, insert, update on public.subject_progress to authenticated;
grant select, insert, update on public.student_queries to authenticated;
grant select, insert, update, delete on public.admin_tasks to authenticated;


-- 5. ROW LEVEL SECURITY -------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.admin_profiles     enable row level security;
alter table public.quizzes            enable row level security;
alter table public.questions          enable row level security;
alter table public.resources          enable row level security;
alter table public.mock_tests         enable row level security;
alter table public.user_quiz_attempts enable row level security;
alter table public.study_logs         enable row level security;
alter table public.subject_progress   enable row level security;
alter table public.student_queries    enable row level security;
alter table public.admin_tasks        enable row level security;

-- profiles: you see your own row, admins see everyone. Self-created rows must be students.
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (id = auth.uid() and role = 'student');
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- admin_profiles: read only. Writes happen through the triggers and the server.
create policy admin_profiles_select on public.admin_profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- quizzes and resources: public to read, admins write.
create policy quizzes_read on public.quizzes for select to anon, authenticated using (true);
create policy quizzes_admin_write on public.quizzes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy resources_read on public.resources for select to anon, authenticated using (true);
create policy resources_admin_write on public.resources for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- questions: logged-in users read, admins write.
create policy questions_read on public.questions for select to authenticated using (true);
create policy questions_admin_write on public.questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- mock_tests: published papers are public, admins see and write everything.
create policy mock_tests_read on public.mock_tests for select to anon, authenticated
  using (is_published or public.is_admin());
create policy mock_tests_admin_write on public.mock_tests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- attempts: you read and add your own, admins read all. Nobody edits or deletes.
create policy attempts_select on public.user_quiz_attempts for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy attempts_insert_own on public.user_quiz_attempts for insert to authenticated
  with check (user_id = auth.uid());

-- study_logs and subject_progress: private to the student.
create policy study_logs_own on public.study_logs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy subject_progress_own on public.subject_progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- student_queries: students ask and read their own, admins read and answer all.
create policy queries_select on public.student_queries for select to authenticated
  using (student_id = auth.uid() or public.is_admin());
create policy queries_insert_own on public.student_queries for insert to authenticated
  with check (student_id = auth.uid() and status = 'pending');
create policy queries_admin_update on public.student_queries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- admin_tasks: admins only.
create policy admin_tasks_admin_all on public.admin_tasks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- 6. BACKFILL -----------------------------------------------------------------
-- Give every existing login account its profile row (admins are handled in the
-- second file, 02_make_me_admin.sql).
insert into public.profiles (id, email, full_name, role, target_exam)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  'student',
  case when u.raw_user_meta_data ->> 'target_exam' in ('NDA', 'CDS', 'AFCAT')
       then u.raw_user_meta_data ->> 'target_exam' else 'NDA' end
from auth.users u
on conflict (id) do nothing;


-- 7. SUBJECTS AND ADMIN AUDIT LOG (Milestone 2) ---------------------------------
-- Subjects (the entry schemes shown on the homepage) -------------------------
create table if not exists public.subjects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 60),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  code         text,
  description  text not null default '' check (char_length(description) <= 300),
  icon_name    text not null default 'shield',
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists subjects_set_updated_at on public.subjects;
create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

-- Audit log: one row per admin action. Rows can be added and read, never edited.
create table if not exists public.admin_logs (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid default auth.uid() references public.admin_profiles (id) on delete set null,
  action       text not null check (action in ('added', 'edited', 'deleted', 'activated', 'deactivated')),
  entity_type  text not null check (entity_type in ('subject', 'question')),
  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists admin_logs_created_idx on public.admin_logs (created_at desc);

-- Privileges
grant select on public.subjects to anon;
grant select, insert, update, delete on public.subjects to authenticated;
grant select, insert on public.admin_logs to authenticated;

-- Row Level Security
alter table public.subjects   enable row level security;
alter table public.admin_logs enable row level security;

drop policy if exists subjects_read on public.subjects;
create policy subjects_read on public.subjects for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists subjects_admin_write on public.subjects;
create policy subjects_admin_write on public.subjects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_logs_read on public.admin_logs;
create policy admin_logs_read on public.admin_logs for select to authenticated
  using (public.is_admin());

drop policy if exists admin_logs_insert on public.admin_logs;
create policy admin_logs_insert on public.admin_logs for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

-- Starter subjects: the three schemes the homepage already shows
insert into public.subjects (name, slug, code, description, icon_name, sort_order) values
  ('National Defence Academy', 'nda', 'NDA / NA',
   'Maths (300 Marks) & GAT (600 Marks) complete syllabus preparation.', 'shield', 1),
  ('Combined Defence Services', 'cds', 'CDS (IMA/INA/AFA/OTA)',
   'English, General Knowledge, and Elementary Mathematics test series.', 'target', 2),
  ('Air Force Common Admission Test', 'afcat', 'AFCAT Flying & Ground Duty',
   'Verbal Ability, Numerical Ability, Reasoning, and Military Aptitude.', 'plane', 3)
on conflict (slug) do nothing;
