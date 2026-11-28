-- Subject-wise syllabus PDFs: one file per (exam, subject). Exam-wise PDFs stay in subjects.syllabus_path.
create table if not exists public.syllabus_files (
  id uuid primary key default gen_random_uuid(),
  exam text not null check (exam in ('nda', 'cds', 'afcat')),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  file_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam, subject_id)
);

alter table public.syllabus_files enable row level security;

drop policy if exists syllabus_files_read on public.syllabus_files;
create policy syllabus_files_read on public.syllabus_files for select to anon, authenticated using (true);

drop policy if exists syllabus_files_admin_write on public.syllabus_files;
create policy syllabus_files_admin_write on public.syllabus_files for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.syllabus_files to anon, authenticated;
grant insert, update, delete on public.syllabus_files to authenticated;
grant all on public.syllabus_files to service_role;
