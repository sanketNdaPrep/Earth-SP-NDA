-- Flashcard pictures can come from a PDF: keep the original so students can download all of it.
alter table public.flashcard_images
  add column if not exists source_pdf text,
  add column if not exists source_page integer,
  add column if not exists source_name text;

-- One syllabus PDF per exam (stored in the study-materials bucket under syllabus/).
alter table public.subjects add column if not exists syllabus_path text;

-- The flashcard bucket now also accepts the original PDF.
update storage.buckets
set allowed_mime_types = array['image/png','image/jpeg','image/webp','application/pdf']
where id = 'flashcard-images';
