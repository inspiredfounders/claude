-- ============================================================
-- Onboarding collects an "interests" step (Branding, Marketing,
-- Leadership, etc.) that had nowhere to be stored — add the column.
-- ============================================================

alter table public.profiles
  add column if not exists interests text[] not null default '{}';
