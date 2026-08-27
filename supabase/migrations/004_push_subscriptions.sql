-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint        text NOT NULL UNIQUE,
  p256dh          text NOT NULL,
  auth            text NOT NULL,
  notify_hour     smallint DEFAULT 8 CHECK (notify_hour BETWEEN 0 AND 23),
  timezone        text DEFAULT 'UTC',
  enabled         boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_enabled_idx ON push_subscriptions(enabled, notify_hour);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Notification send log (to avoid duplicates)
CREATE TABLE IF NOT EXISTS notification_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_date  date NOT NULL DEFAULT current_date,
  type       text NOT NULL,
  sent_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, sent_date)
);

CREATE INDEX IF NOT EXISTS notification_log_date_idx ON notification_log(sent_date);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own log" ON notification_log;
CREATE POLICY "Users read own log" ON notification_log
  FOR SELECT USING (auth.uid() = user_id);
