-- Picture flashcards: admins upload images filed under a subject and chapter, students browse them.
-- Also removes the upload size cap from the study material bucket.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.
-- Needs migration 013 (chapters).

-- 1. The pictures ------------------------------------------------------------------
create table if not exists public.flashcard_images (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects (id) on delete cascade,
  chapter_id  uuid,
  image_path  text not null unique,
  caption     text check (caption is null or char_length(caption) <= 120),
  created_by  uuid default auth.uid() references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  -- A chapter must belong to the subject it is filed under. If the chapter is deleted only chapter_id is cleared.
  foreign key (chapter_id, subject_id) references public.chapters (id, subject_id) on delete set null (chapter_id)
);
create index if not exists flashcard_images_recent_idx on public.flashcard_images (created_at desc);
create index if not exists flashcard_images_filed_idx on public.flashcard_images (subject_id, chapter_id);

grant select on public.flashcard_images to anon;
grant select, insert, update, delete on public.flashcard_images to authenticated;
alter table public.flashcard_images enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'flashcard_images' and policyname = 'flashcard_images_read') then
    create policy flashcard_images_read on public.flashcard_images for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'flashcard_images' and policyname = 'flashcard_images_admin_write') then
    create policy flashcard_images_admin_write on public.flashcard_images for all to authenticated
      using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- 2. Storage: a public bucket for the pictures, no size limit set by us --------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('flashcard-images', 'flashcard-images', true, null, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = null,
      allowed_mime_types = excluded.allowed_mime_types;

-- Study material bucket: remove the 20 MB cap too.
update storage.buckets set file_size_limit = null where id = 'study-materials';

-- Only approved admins can add, change or remove picture files. Anyone can open one from its public link.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'flashcard_images_admin_select') then
    create policy flashcard_images_admin_select on storage.objects for select to authenticated
      using (bucket_id = 'flashcard-images' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'flashcard_images_admin_insert') then
    create policy flashcard_images_admin_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'flashcard-images' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'flashcard_images_admin_update') then
    create policy flashcard_images_admin_update on storage.objects for update to authenticated
      using (bucket_id = 'flashcard-images' and public.is_admin())
      with check (bucket_id = 'flashcard-images' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'flashcard_images_admin_delete') then
    create policy flashcard_images_admin_delete on storage.objects for delete to authenticated
      using (bucket_id = 'flashcard-images' and public.is_admin());
  end if;
end $$;

-- 3. Let the admin log record picture uploads ------------------------------------------
alter table public.admin_logs drop constraint if exists admin_logs_entity_type_check;
alter table public.admin_logs add constraint admin_logs_entity_type_check
  check (entity_type in ('subject', 'question', 'resource', 'mock_test', 'flashcard_deck', 'flashcard_image'));
