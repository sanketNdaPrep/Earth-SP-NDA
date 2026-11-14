-- Question Seeding Portal: a topic for each question (for example "Algebra").
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.
-- The question form still saves without it; the topic is simply not stored until this runs.

alter table public.questions add column if not exists topic text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'questions_topic_length') then
    alter table public.questions
      add constraint questions_topic_length check (topic is null or char_length(topic) <= 60);
  end if;
end $$;
