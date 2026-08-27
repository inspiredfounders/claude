-- Add birth / astrology columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birth_date     date,
  ADD COLUMN IF NOT EXISTS birth_time     time,
  ADD COLUMN IF NOT EXISTS birth_city     text,
  ADD COLUMN IF NOT EXISTS birth_country  text,
  ADD COLUMN IF NOT EXISTS sun_sign       text,
  ADD COLUMN IF NOT EXISTS moon_sign      text,
  ADD COLUMN IF NOT EXISTS rising_sign    text;
