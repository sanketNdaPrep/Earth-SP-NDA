-- Task 2: a short description for each study material.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.

alter table public.resources add column if not exists description text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'resources_description_length') then
    alter table public.resources
      add constraint resources_description_length check (description is null or char_length(description) <= 300);
  end if;
end $$;
