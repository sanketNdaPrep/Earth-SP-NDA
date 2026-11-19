-- Study subjects: real subjects (Mathematics, Biology, ...) kept apart from the entry schemes (NDA, CDS, AFCAT).
-- Adds exam tags, a cover picture per subject, and moves the filing of existing content.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.
-- Needs migrations 013 and 014.

-- 1. Subjects: kind, exam tags, cover picture -------------------------------------------------
alter table public.subjects add column if not exists kind text not null default 'exam';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'subjects_kind_check') then
    alter table public.subjects add constraint subjects_kind_check check (kind in ('exam', 'subject'));
  end if;
end $$;
alter table public.subjects add column if not exists cover_path text;
alter table public.subjects add column if not exists exams text[] not null default '{}';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'subjects_exams_check') then
    alter table public.subjects add constraint subjects_exams_check check (exams <@ array['nda', 'cds', 'afcat']);
  end if;
end $$;

-- Pictures and study files can be tagged for an exam too. Empty means "not tied to one exam".
alter table public.flashcard_images add column if not exists exams text[] not null default '{}';
alter table public.resources add column if not exists exams text[] not null default '{}';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'flashcard_images_exams_check') then
    alter table public.flashcard_images add constraint flashcard_images_exams_check check (exams <@ array['nda', 'cds', 'afcat']);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'resources_exams_check') then
    alter table public.resources add constraint resources_exams_check check (exams <@ array['nda', 'cds', 'afcat']);
  end if;
end $$;

-- 2. The three entry schemes stay "exam"; everything else becomes a study subject ----------------
update public.subjects set kind = 'subject' where slug not in ('nda', 'cds', 'afcat');

-- 3. Seed the subjects the three syllabi cover (names are kept if they already exist) -----------
insert into public.subjects (slug, name, description, icon_name, kind, is_active, sort_order, exams)
values
  ('mathematics',     'Mathematics',                 '', 'calculator', 'subject', true, 10, array['nda', 'cds', 'afcat']),
  ('english',         'English',                     '', 'book',       'subject', true, 20, array['nda', 'cds', 'afcat']),
  ('physics',         'Physics',                     '', 'atom',       'subject', true, 30, array['nda']),
  ('chemistry',       'Chemistry',                   '', 'flask',      'subject', true, 40, array['nda']),
  ('biology',         'Biology',                     '', 'users',      'subject', true, 50, array['nda']),
  ('general-science', 'General Science',             '', 'atom',       'subject', true, 60, array['nda', 'cds']),
  ('history',         'History',                     '', 'landmark',   'subject', true, 70, array['nda', 'cds', 'afcat']),
  ('geography',       'Geography',                   '', 'globe',      'subject', true, 80, array['nda', 'cds', 'afcat']),
  ('polity-economy',  'Polity & Economy',            '', 'landmark',   'subject', true, 90, array['nda', 'cds']),
  ('current-affairs', 'Current Affairs',             '', 'target',     'subject', true, 100, array['nda', 'cds', 'afcat']),
  ('reasoning',       'Reasoning & Verbal Ability',  '', 'triangle',   'subject', true, 110, array['afcat'])
on conflict (slug) do update
  set kind = 'subject', is_active = true, sort_order = excluded.sort_order, exams = excluded.exams;

-- 4. Move the old "NDA > Maths/Physics/..." chapters (and their text decks) to the real subjects ---
create temp table chapter_move on commit drop as
  select c.id as chapter_id, t.id as new_subject
  from public.chapters c
  join public.subjects o on o.id = c.subject_id and o.slug = 'nda'
  join (values ('maths', 'mathematics'), ('physics', 'physics'), ('chemistry', 'chemistry'), ('general awareness', 'current-affairs')) m(name, slug)
    on lower(c.name) = m.name
  join public.subjects t on t.slug = m.slug;

create temp table deck_move on commit drop as
  select d.id as deck_id, cm.chapter_id, cm.new_subject
  from public.flashcard_decks d join chapter_move cm on cm.chapter_id = d.chapter_id;

update public.flashcard_decks set chapter_id = null where id in (select deck_id from deck_move);
update public.chapters c set subject_id = cm.new_subject from chapter_move cm where c.id = cm.chapter_id;
update public.flashcard_decks d set subject_id = dm.new_subject, chapter_id = dm.chapter_id from deck_move dm where d.id = dm.deck_id;

-- 5. Pictures filed straight under an entry scheme go to "Unsorted", tagged with that exam ------
insert into public.subjects (slug, name, description, icon_name, kind, is_active, sort_order, exams)
values ('unsorted', 'Unsorted', 'Pictures waiting to be filed under a subject and chapter.', 'book', 'subject', true, 999, '{}')
on conflict (slug) do nothing;

update public.flashcard_images i
set exams = array[o.slug], subject_id = (select id from public.subjects where slug = 'unsorted'), chapter_id = null
from public.subjects o
where o.id = i.subject_id and o.kind = 'exam';

-- 6. Cover pictures for subjects ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('subject-covers', 'subject-covers', true, null, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = null, allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'subject_covers_admin_select') then
    create policy subject_covers_admin_select on storage.objects for select to authenticated
      using (bucket_id = 'subject-covers' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'subject_covers_admin_insert') then
    create policy subject_covers_admin_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'subject-covers' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'subject_covers_admin_update') then
    create policy subject_covers_admin_update on storage.objects for update to authenticated
      using (bucket_id = 'subject-covers' and public.is_admin())
      with check (bucket_id = 'subject-covers' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'subject_covers_admin_delete') then
    create policy subject_covers_admin_delete on storage.objects for delete to authenticated
      using (bucket_id = 'subject-covers' and public.is_admin());
  end if;
end $$;
