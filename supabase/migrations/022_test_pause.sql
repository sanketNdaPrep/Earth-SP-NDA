-- Pause and resume a mock test, even after logging out and in (or on another device).
-- All three columns are optional, so tests that are running right now are not affected.
--   paused_at          set while the test is paused (the clock is stopped)
--   remaining_seconds  time left at the moment of pausing
--   progress           the answers, marked and visited questions and the question the cadet was on
alter table public.mock_test_sessions
  add column if not exists paused_at timestamptz,
  add column if not exists remaining_seconds integer check (remaining_seconds is null or remaining_seconds >= 0),
  add column if not exists progress jsonb;
