-- Milestone 1: let each user pick one of 10 predefined avatars.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.

alter table public.profiles
  add column if not exists avatar_id smallint
  check (avatar_id between 1 and 10);

-- Users may change their own avatar. role and email stay locked.
grant update (avatar_id) on public.profiles to authenticated;
