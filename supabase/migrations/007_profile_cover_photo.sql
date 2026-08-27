-- The mobile app's profile editor lets a member set a cover photo
-- (ProfileScreen.tsx), but no migration ever added the column for it.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cover_url text;
