-- Vault items table for The Inspired Club
CREATE TABLE IF NOT EXISTS vault_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  category      text NOT NULL DEFAULT 'brand',
  type          text NOT NULL DEFAULT 'pdf',   -- pdf | video | template | audio | link
  file_url      text,
  thumbnail_url text,
  duration      text,
  pages         integer,
  is_featured   boolean DEFAULT false,
  is_new        boolean DEFAULT false,
  sort_order    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Full-text search
CREATE INDEX IF NOT EXISTS vault_items_fts_idx
  ON vault_items USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- Sort / filter indexes
CREATE INDEX IF NOT EXISTS vault_items_category_idx ON vault_items(category);
CREATE INDEX IF NOT EXISTS vault_items_sort_idx ON vault_items(sort_order, created_at DESC);

-- RLS: public read for members, admin write
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vault items readable by members" ON vault_items;
CREATE POLICY "Vault items readable by members" ON vault_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('member', 'admin')
    )
  );

DROP POLICY IF EXISTS "Vault items writable by admins" ON vault_items;
CREATE POLICY "Vault items writable by admins" ON vault_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION update_vault_item_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS vault_items_updated_at ON vault_items;
CREATE TRIGGER vault_items_updated_at
  BEFORE UPDATE ON vault_items
  FOR EACH ROW EXECUTE FUNCTION update_vault_item_timestamp();
