-- Step 4: questions typed or imported inside a test belong to that test.
-- Run once in Supabase: SQL Editor, New query, paste, Run. Safe to run twice. Purely additive.

-- A test's own questions are not part of any practice module, so quiz_id may now be empty.
alter table public.questions alter column quiz_id drop not null;

-- The test a question was created for. Deleting the test deletes its own questions.
-- Questions from the shared bank (mock_test_id empty) are only linked to a test, never deleted with it.
alter table public.questions add column if not exists mock_test_id uuid references public.mock_tests (id) on delete cascade;
create index if not exists questions_mock_test_idx on public.questions (mock_test_id) where mock_test_id is not null;
