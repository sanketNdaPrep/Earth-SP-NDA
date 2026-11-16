-- Chapters: each subject can have chapters, and flashcard decks and study material can be filed under a subject and chapter.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.
-- Needs migration 011 (flashcards) and the resources table. Existing starter decks are filed under NDA automatically.

-- 1. Chapters ---------------------------------------------------------------------
create table if not exists public.chapters (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects (id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 60),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  unique (id, subject_id)
);
create unique index if not exists chapters_subject_name_key on public.chapters (subject_id, lower(name));
create index if not exists chapters_subject_idx on public.chapters (subject_id, sort_order);

grant select on public.chapters to anon;
grant select, insert, update, delete on public.chapters to authenticated;
alter table public.chapters enable row level security;

drop policy if exists chapters_read on public.chapters;
create policy chapters_read on public.chapters for select to anon, authenticated using (true);
drop policy if exists chapters_admin_write on public.chapters;
create policy chapters_admin_write on public.chapters for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 2. File decks and study material under a subject and chapter (both optional) ----------
alter table public.flashcard_decks add column if not exists subject_id uuid references public.subjects (id) on delete set null;
alter table public.flashcard_decks add column if not exists chapter_id uuid;
alter table public.resources       add column if not exists subject_id uuid references public.subjects (id) on delete set null;
alter table public.resources       add column if not exists chapter_id uuid;

-- A chapter must belong to the subject it is filed under. If a chapter is deleted, only chapter_id is cleared.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'flashcard_decks_chapter_fk') then
    alter table public.flashcard_decks add constraint flashcard_decks_chapter_fk
      foreign key (chapter_id, subject_id) references public.chapters (id, subject_id) on delete set null (chapter_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'resources_chapter_fk') then
    alter table public.resources add constraint resources_chapter_fk
      foreign key (chapter_id, subject_id) references public.chapters (id, subject_id) on delete set null (chapter_id);
  end if;
end $$;

create index if not exists flashcard_decks_subject_idx on public.flashcard_decks (subject_id, chapter_id);
create index if not exists resources_subject_idx on public.resources (subject_id, chapter_id);

-- 3. File the starter decks under NDA, one chapter per old category ----------------------
insert into public.chapters (subject_id, name, sort_order)
select s.id, c.name, c.ord
from public.subjects s,
     (values ('Maths', 1), ('Physics', 2), ('Chemistry', 3), ('General Awareness', 4)) as c(name, ord)
where s.slug = 'nda'
  and exists (select 1 from public.flashcard_decks d where d.subject_id is null and d.category = c.name)
on conflict do nothing;

update public.flashcard_decks d
set subject_id = ch.subject_id, chapter_id = ch.id
from public.chapters ch
join public.subjects s on s.id = ch.subject_id and s.slug = 'nda'
where d.subject_id is null and d.chapter_id is null and lower(d.category) = lower(ch.name);
