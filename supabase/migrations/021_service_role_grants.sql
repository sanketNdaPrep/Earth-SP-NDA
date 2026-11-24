-- The server-only service_role had no permission on the public tables, so tests could not start,
-- results could not be saved, and practice grading / admin signup / approvals failed.
-- This is the standard Supabase default. It adds nothing for anon or authenticated.
-- (Already applied to the live project.)
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
