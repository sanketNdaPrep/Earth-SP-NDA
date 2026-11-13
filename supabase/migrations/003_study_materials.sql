-- Milestone 3: study material uploads.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice.

-- 1. Resources: remember where each uploaded file lives in storage -----------
--    file_path is the object path inside the bucket (used to delete the file).
--    file_type is 'pdf' or 'image' (the Vault uses it for the label).
alter table public.resources add column if not exists file_path text;
alter table public.resources add column if not exists file_type text;

-- 2. Audit log: allow "resource" as something an admin can act on ------------
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.admin_logs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%entity_type%'
  loop
    execute format('alter table public.admin_logs drop constraint %I', c.conname);
  end loop;
  alter table public.admin_logs
    add constraint admin_logs_entity_type_check
    check (entity_type in ('subject', 'question', 'resource'));
end $$;

-- 3. Storage bucket: public to download, 20 MB limit, PDF and images only ----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-materials',
  'study-materials',
  true,
  20971520,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 4. Storage permissions: only approved admins can add, change or remove files.
--    Anyone can open a file from its public link (that is how students download).
drop policy if exists study_materials_admin_select on storage.objects;
create policy study_materials_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'study-materials' and public.is_admin());

drop policy if exists study_materials_admin_insert on storage.objects;
create policy study_materials_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'study-materials' and public.is_admin());

drop policy if exists study_materials_admin_update on storage.objects;
create policy study_materials_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'study-materials' and public.is_admin())
  with check (bucket_id = 'study-materials' and public.is_admin());

drop policy if exists study_materials_admin_delete on storage.objects;
create policy study_materials_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'study-materials' and public.is_admin());
