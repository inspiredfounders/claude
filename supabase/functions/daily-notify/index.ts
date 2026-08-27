/**
 * daily-notify Edge Function
 *
 * Called by Supabase Cron (or a webhook) once per hour.
 * Sends push notifications to subscribers whose notify_hour matches the current UTC hour.
 *
 * Setup:
 *   1. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_MAILTO as Supabase secrets
 *   2. Set SUPABASE_SERVICE_ROLE_KEY as a secret
 *   3. Schedule with: pg_cron or Dashboard Cron → "0 * * * *" (every hour)
 *
 * Generate VAPID keys:
 *   npx web-push generate-vapid-keys
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Notification content (mirrors src/lib/dailyContent.ts) ───────────────────

const QUOTES = [
  { title: "On building", body: "\"The best time to plant a tree was 20 years ago. The second best time is now.\" Build the thing." },
  { title: "On courage", body: "\"You don't have to be great to start, but you have to start to be great.\" — Les Brown" },
  { title: "On vision", body: "\"The people who are crazy enough to think they can change the world are the ones who do.\" — Steve Jobs" },
  { title: "On resilience", body: "\"It's not whether you get knocked down — it's whether you get up.\" — Vince Lombardi" },
  { title: "On momentum", body: "A small daily task, done well, beats a rare masterpiece. Start your streak today." },
  { title: "On identity", body: "\"You are not your business. But your business is an expression of who you are becoming.\"" },
  { title: "On focus", body: "\"It's not about ideas. It's about making ideas happen.\" — Scott Belsky" },
  { title: "On clarity", body: "\"Clarity is the most powerful weapon a founder can carry. What are you clear on today?\"" },
  { title: "On execution", body: "\"Vision without execution is hallucination.\" — Thomas Edison. What moves today?" },
  { title: "On discipline", body: "\"Discipline is choosing between what you want now and what you want most.\"" },
  { title: "On resilience", body: "\"Most people give up just before the breakthrough.\" Today might be that day. Don't stop." },
  { title: "On confidence", body: "\"Confidence is not 'they will like me.' Confidence is 'I'll be fine if they don't.'\"" },
];

const QUESTIONS = [
  { title: "Inspired Club ✦", body: "If you could only work on one thing today to move your business forward, what would it be?" },
  { title: "Inspired Club ✦", body: "Who do you need to become to achieve what you're building?" },
  { title: "Inspired Club ✦", body: "What would you do if you knew you couldn't fail? Are you doing it?" },
  { title: "Inspired Club ✦", body: "What's one belief about yourself that's quietly holding your business back?" },
  { title: "Inspired Club ✦", body: "Are you building something the world needs, or something you think the world needs?" },
  { title: "Inspired Club ✦", body: "Name one thing you've been avoiding that, if done, would change everything." },
  { title: "Inspired Club ✦", body: "What does your business look like in 5 years if you never change how you spend your days?" },
  { title: "Inspired Club ✦", body: "What would you commit to if there was no plan B?" },
];

const CHALLENGES = [
  { title: "Today's challenge ✦", body: "Send a genuine, unrequested message of appreciation to someone in your network. No agenda. Just gratitude." },
  { title: "Founder sprint ✦", body: "Write down your top 3 revenue-generating activities. Block 2 hours for the most important one. Right now." },
  { title: "Visibility challenge ✦", body: "Share one insight from your founder journey publicly today. Your people are waiting to hear from you." },
  { title: "The bold ask ✦", body: "Make the ask you've been putting off. The partnership. The introduction. The rate increase. Send it today." },
];

function seededRand(seed: number, max: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % max | 0;
}

function getDailyPayload(dateStr: string): { title: string; body: string; url: string } {
  const seed      = parseInt(dateStr.replace(/-/g, ""), 10);
  const dayOfYear = Math.floor((new Date(dateStr).getTime() - new Date(new Date(dateStr).getFullYear(), 0, 0).getTime()) / 86400000);
  const typeIdx   = dayOfYear % 3;

  let item: { title: string; body: string };
  if (typeIdx === 0)      item = QUOTES[seededRand(seed, QUOTES.length)];
  else if (typeIdx === 1) item = QUESTIONS[seededRand(seed + 1, QUESTIONS.length)];
  else                    item = CHALLENGES[seededRand(seed + 2, CHALLENGES.length)];

  return { title: item.title, body: item.body, url: "/" };
}

// ─── Minimal web-push implementation (VAPID) ──────────────────────────────────

async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: object) {
  const vapidPublic  = Deno.env.get("VAPID_PUBLIC_KEY")  ?? "";
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const vapidMailto  = Deno.env.get("VAPID_MAILTO")      ?? "mailto:admin@inspiredclub.com";

  if (!vapidPublic || !vapidPrivate) {
    throw new Error("VAPID keys not configured");
  }

  // Import web-push helper via esm.sh
  const { default: webpush } = await import("https://esm.sh/web-push@3.6.7");
  webpush.setVapidDetails(vapidMailto, vapidPublic, vapidPrivate);

  await webpush.sendNotification(
    { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
    JSON.stringify(payload),
  );
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const admin       = createClient(supabaseUrl, serviceKey);

    const currentHour = new Date().getUTCHours();
    const today       = new Date().toISOString().split("T")[0];

    // Fetch subscribers due this hour who haven't been notified today
    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .eq("enabled", true)
      .eq("notify_hour", currentHour);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Filter out already-notified users today
    const { data: alreadySent } = await admin
      .from("notification_log")
      .select("user_id")
      .eq("sent_date", today);

    const alreadySentIds = new Set((alreadySent ?? []).map((r: { user_id: string }) => r.user_id));
    const pending = subs.filter((s: { user_id: string }) => !alreadySentIds.has(s.user_id));

    const payload = getDailyPayload(today);
    let sent = 0;

    for (const sub of pending) {
      try {
        await sendWebPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, payload);
        await admin.from("notification_log").insert({ user_id: sub.user_id, type: "daily", sent_date: today });
        sent++;
      } catch (err) {
        // Remove stale/expired subscriptions (410 Gone)
        if (String(err).includes("410") || String(err).includes("404")) {
          await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }

    return new Response(JSON.stringify({ sent, total: pending.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
