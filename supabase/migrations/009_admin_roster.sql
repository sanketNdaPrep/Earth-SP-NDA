-- Admin Overview and Student Roster: real numbers from profiles and user_quiz_attempts.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.
--
-- Both functions return rows only to an approved admin (public.is_admin()). A student, or a
-- signed-out visitor, calls them and gets an empty result, so no student data leaks.

-- One row per student, with their test totals -------------------------------------
create or replace function public.admin_student_roster()
returns table (
  id            uuid,
  full_name     text,
  email         text,
  target_exam   text,
  created_at    timestamptz,
  tests_taken   bigint,
  correct       bigint,
  questions     bigint,
  last_attempt  timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.full_name, p.email, p.target_exam, p.created_at,
    count(a.id)                          as tests_taken,
    coalesce(sum(a.score), 0)::bigint           as correct,
    coalesce(sum(a.total_questions), 0)::bigint as questions,
    max(a.attempted_at)                  as last_attempt
  from public.profiles p
  left join public.user_quiz_attempts a on a.user_id = p.id
  where p.role = 'student' and public.is_admin()
  group by p.id
  order by p.created_at desc;
$$;

-- One row per target exam ---------------------------------------------------------
create or replace function public.admin_exam_summary()
returns table (
  target_exam  text,
  enrolled     bigint,
  tests_taken  bigint,
  correct      bigint,
  questions    bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.target_exam,
    count(distinct p.id)                        as enrolled,
    count(a.id)                                 as tests_taken,
    coalesce(sum(a.score), 0)::bigint           as correct,
    coalesce(sum(a.total_questions), 0)::bigint as questions
  from public.profiles p
  left join public.user_quiz_attempts a on a.user_id = p.id
  where p.role = 'student' and public.is_admin()
  group by p.target_exam;
$$;

revoke all on function public.admin_student_roster() from public, anon;
revoke all on function public.admin_exam_summary() from public, anon;
grant execute on function public.admin_student_roster() to authenticated;
grant execute on function public.admin_exam_summary() to authenticated;
