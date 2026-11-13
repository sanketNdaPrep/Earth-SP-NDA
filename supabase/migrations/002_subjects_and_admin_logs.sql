-- Milestone 2: subjects table and admin audit log.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.

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
