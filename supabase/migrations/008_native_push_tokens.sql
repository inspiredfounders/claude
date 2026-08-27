-- ============================================================
-- Native push tokens (iOS/Android via Capacitor)
-- The existing push_subscriptions table stores browser Web Push
-- subscriptions (endpoint/p256dh/auth), which only works on the web.
-- Native iOS/Android apps get a device token from APNs/FCM instead —
-- this table stores those. Sending to them requires the daily-notify
-- (or a new) edge function to be extended with Firebase Admin / APNs
-- credentials once those exist; this migration only adds storage.
-- ============================================================

CREATE TABLE IF NOT EXISTS device_push_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform    text NOT NULL CHECK (platform IN ('ios', 'android')),
  token       text NOT NULL,
  notify_hour smallint DEFAULT 8 CHECK (notify_hour BETWEEN 0 AND 23),
  timezone    text DEFAULT 'UTC',
  enabled     boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS device_push_tokens_user_idx ON device_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS device_push_tokens_enabled_idx ON device_push_tokens(enabled, notify_hour);

ALTER TABLE device_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own device tokens" ON device_push_tokens;
CREATE POLICY "Users manage own device tokens" ON device_push_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_device_push_token_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS device_push_tokens_updated_at ON device_push_tokens;
CREATE TRIGGER device_push_tokens_updated_at
  BEFORE UPDATE ON device_push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_device_push_token_timestamp();
