-- Mentorship: students ask a mentor a question from the dashboard; admins reply from Admin Suite > Overview > helpdesk.
-- The student_queries table and its access rules already exist. This adds three safeguards.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.

-- 1. Question length: 10 to 1000 characters ---------------------------------------
alter table public.student_queries drop constraint if exists student_queries_text_length;
alter table public.student_queries
  add constraint student_queries_text_length check (char_length(query_text) between 10 and 1000) not valid;
-- "not valid" leaves any older rows alone and checks every new or changed row.

-- 2. At most 5 unanswered questions per student, so the inbox cannot be flooded ---
create or replace function public.limit_pending_queries()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.student_id is not null
     and (select count(*) from public.student_queries
          where student_id = new.student_id and status = 'pending') >= 5 then
    raise exception 'You already have 5 questions waiting for a reply. Please wait for an answer first.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists student_queries_limit_pending on public.student_queries;
create trigger student_queries_limit_pending
  before insert on public.student_queries
  for each row execute function public.limit_pending_queries();

-- 3. Stamp the reply time when an admin resolves a question -----------------------
create or replace function public.stamp_query_resolved()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'resolved' and old.status is distinct from 'resolved' then
    new.resolved_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists student_queries_stamp_resolved on public.student_queries;
create trigger student_queries_stamp_resolved
  before update on public.student_queries
  for each row execute function public.stamp_query_resolved();
