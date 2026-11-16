-- Starter study material: official links every aspirant needs, so the Study Material page is not empty.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice (it skips titles that already exist).
-- Edit or delete any of these later from Admin Suite > Study Materials.

insert into public.resources (title, category, recommended_for, download_url, description)
select v.title, v.category, v.recommended_for, v.download_url, v.description
from (values
  ('UPSC official website: NDA and CDS notifications', 'Official', 'NDA, CDS',
   'https://upsc.gov.in',
   'Where the NDA and CDS notifications, syllabus, exam dates and results are published. Check it first for every exam cycle.'),
  ('AFCAT official portal', 'Official', 'AFCAT',
   'https://afcat.cdac.in',
   'Indian Air Force AFCAT portal: registration, notification, admit card and result. Apply only through this site.'),
  ('Join Indian Army: officer entries', 'Official', 'NDA, CDS',
   'https://joinindianarmy.nic.in',
   'Official Army recruitment site with entry schemes, eligibility and the latest vacancy notices.'),
  ('Join Indian Navy: officer entries', 'Official', 'NDA, CDS',
   'https://joinindiannavy.gov.in',
   'Official Navy recruitment site with entry schemes, eligibility and the latest vacancy notices.')
) as v(title, category, recommended_for, download_url, description)
where not exists (select 1 from public.resources r where r.title = v.title);
