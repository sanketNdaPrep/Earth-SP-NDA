-- Optional cover pictures for chapters and study files (stored in the subject-covers bucket).
alter table public.chapters add column if not exists cover_path text;
alter table public.resources add column if not exists cover_path text;
