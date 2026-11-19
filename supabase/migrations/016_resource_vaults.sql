-- Study files belong to a vault: PDF Notes, Formulas or Questions PDF. (Flashcards are the picture cards.)
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice. Needs migration 015.

alter table public.resources add column if not exists vault text not null default 'notes';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'resources_vault_check') then
    alter table public.resources add constraint resources_vault_check check (vault in ('notes', 'formulas', 'questions'));
  end if;
end $$;

-- Files uploaded before vaults existed: sort them by their old category words.
update public.resources set vault = 'formulas' where vault = 'notes' and category ilike '%formula%';
update public.resources set vault = 'questions' where vault = 'notes' and (category ilike '%paper%' or category ilike '%practice%' or category ilike '%question%');

create index if not exists resources_vault_idx on public.resources (vault, subject_id, chapter_id);
