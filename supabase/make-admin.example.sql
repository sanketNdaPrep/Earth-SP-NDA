-- Run this AFTER schema.sql succeeded. It makes your account an approved admin.
-- It sets app_metadata, which only the server and this SQL editor can change.
-- The trigger from schema.sql then creates your admin_profiles row.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin","is_approved":true}'::jsonb
where email = 'YOUR_ADMIN_EMAIL';

-- Check: this should return one row with is_approved = true.
select p.email, p.role, a.is_approved
from public.profiles p
join public.admin_profiles a on a.id = p.id
where p.email = 'YOUR_ADMIN_EMAIL';
