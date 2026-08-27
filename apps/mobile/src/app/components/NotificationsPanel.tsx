import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, MessageCircle, UserPlus, Calendar, Star, Bell, Zap, Sparkles, BellOff, BellRing, ChevronRight, Check } from "lucide-react";
import { getDailyNotification, getNotificationPreview } from "../../lib/dailyContent";
import { getPermissionState, requestPermissionAndSubscribe, unsubscribe, updateNotifyHour } from "../../lib/pushNotifications";

interface Props {
  onClose: () => void;
}

type NotifType = "like" | "comment" | "connection" | "event" | "mention" | "system" | "assembly";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  avatar?: string;
}

const NOTIFS: Notif[] = [
  { id: "1", type: "assembly", title: "Assembly is tomorrow", body: "Monthly Club Assembly starts at 7pm. Your space is locked in — see you there.", time: "2h ago", read: false },
  { id: "2", type: "comment",  title: "Jade replied to your post", body: "\"Totally agree — positioning before scale is the move. Would love to connect on this.\"", time: "4h ago", read: false, avatar: "JD" },
  { id: "3", type: "like",     title: "5 founders liked your post", body: "Your post on brand storytelling is getting traction in The Club.", time: "6h ago", read: false, avatar: "5" },
  { id: "4", type: "connection", title: "Marcus wants to connect", body: "Marcus Teal — Founder @ TealTech — sent you a connection request.", time: "Yesterday", read: true, avatar: "MT" },
  { id: "5", type: "event",    title: "Event reminder: Brand Sprint Workshop", body: "Starting in 3 days. You're on the guest list.", time: "Yesterday", read: true },
  { id: "6", type: "mention",  title: "Priscilla mentioned you", body: "\"Shoutout to @you for that post on distribution — exactly what this community needs.\"", time: "2 days ago", read: true, avatar: "PL" },
  { id: "7", type: "system",   title: "New Vault content dropped", body: "\"Pricing Psychology for Premium Offers\" is now live in the Vault.", time: "3 days ago", read: true },
  { id: "8", type: "event",    title: "Past event: Pitch Practice", body: "The recording is now available in Past Events.", time: "5 days ago", read: true },
];

const iconFor = (type: NotifType) => {
  switch (type) {
    case "like":       return { Icon: Heart,          bg: "rgba(232,54,92,0.12)",  color: "#e8365c" };
    case "comment":    return { Icon: MessageCircle,  bg: "rgba(123,78,200,0.12)", color: "#7b4ec8" };
    case "connection": return { Icon: UserPlus,        bg: "rgba(99,198,142,0.15)", color: "#3da86a" };
    case "event":      return { Icon: Calendar,        bg: "rgba(240,120,50,0.12)", color: "#e87828" };
    case "mention":    return { Icon: Star,             bg: "rgba(240,190,50,0.15)", color: "#c8960a" };
    case "assembly":   return { Icon: Zap,              bg: "var(--brand-gradient-soft)", color: "#e8365c" };
    default:           return { Icon: Bell,             bg: "var(--muted)",          color: "var(--muted-foreground)" };
  }
};

const TYPE_LABELS: Record<string, string> = {
  quote:      "✦ Daily Quote",
  question:   "✦ Daily Question",
  challenge:  "✦ Daily Challenge",
  reflection: "✦ Evening Reflection",
};

const HOURS = [
  { value: 7,  label: "7:00 AM — Rise & Reflect" },
  { value: 8,  label: "8:00 AM — Morning Momentum" },
  { value: 9,  label: "9:00 AM — Start Strong" },
  { value: 12, label: "12:00 PM — Midday Reset" },
  { value: 18, label: "6:00 PM — Evening Wind-down" },
  { value: 20, label: "8:00 PM — Night Reflection" },
];

// ─── Notification Opt-In Card ─────────────────────────────────────────────────

function NotificationOptIn({ onGranted }: { onGranted: () => void }) {
  const [loading, setLoading]   = useState(false);
  const [hour, setHour]         = useState(8);
  const [showHours, setShowHours] = useState(false);
  const today                   = getDailyNotification();

  async function handleEnable() {
    setLoading(true);
    const ok = await requestPermissionAndSubscribe(hour);
    setLoading(false);
    if (ok) onGranted();
  }

  return (
    <div
      className="mx-5 mt-5 rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0f0820, #1c1035)",
        border: "1px solid rgba(123,78,200,0.3)",
      }}
    >
      {/* Top ambient glow */}
      <div className="h-1 w-full" style={{ background: "var(--brand-gradient)" }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 16px rgba(232,54,92,0.3)" }}
          >
            <BellRing size={22} className="text-white" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: "15px", color: "#e8d5ff" }}>Daily Inspiration</p>
            <p style={{ fontSize: "11px", color: "rgba(200,180,255,0.5)" }}>
              A quote, question, or challenge — every morning
            </p>
          </div>
        </div>

        {/* Today's preview */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p style={{ fontSize: "10px", color: "rgba(200,180,255,0.45)", fontWeight: 700, marginBottom: "6px", letterSpacing: "0.06em" }}>
            {TYPE_LABELS[today.type] ?? "✦ TODAY'S INSPIRATION"}
          </p>
          <p style={{ fontSize: "13px", color: "#f0e8ff", fontWeight: 600, lineHeight: 1.6 }}>
            {today.body}
          </p>
        </div>

        {/* Delivery time picker */}
        <div className="mb-4">
          <p style={{ fontSize: "11px", color: "rgba(200,180,255,0.5)", fontWeight: 700, marginBottom: "8px" }}>
            DELIVER AT
          </p>
          <div className="grid grid-cols-3 gap-2">
            {HOURS.map((h) => (
              <button
                key={h.value}
                onClick={() => setHour(h.value)}
                className="rounded-xl py-2 px-2 text-center transition-all"
                style={{
                  background: hour === h.value ? "var(--brand-gradient)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${hour === h.value ? "transparent" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <p style={{ fontSize: "12px", fontWeight: 700, color: hour === h.value ? "#fff" : "rgba(200,180,255,0.6)" }}>
                  {h.value < 12 ? `${h.value} AM` : h.value === 12 ? "12 PM" : `${h.value - 12} PM`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* What to expect */}
        <div className="flex flex-col gap-2 mb-5">
          {[
            { icon: "💬", text: "An inspiring quote that hits different" },
            { icon: "🔮", text: "A question that sharpens your thinking" },
            { icon: "⚡", text: "A founder challenge that builds momentum" },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-2.5">
              <span style={{ fontSize: "14px" }}>{item.icon}</span>
              <p style={{ fontSize: "12px", color: "rgba(200,180,255,0.6)" }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleEnable}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl text-white text-sm flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: "var(--brand-gradient)",
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(232,54,92,0.3)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : <BellRing size={15} />}
          {loading ? "Enabling…" : "Enable Daily Inspiration"}
        </button>

        <p style={{ fontSize: "10px", color: "rgba(200,180,255,0.3)", textAlign: "center", marginTop: "8px" }}>
          One notification per day · Turn off any time
        </p>
      </div>
    </div>
  );
}

// ─── Notification Settings (post-opt-in) ─────────────────────────────────────

function NotificationSettings({ onDisable }: { onDisable: () => void }) {
  const [hour, setHour]   = useState(8);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const preview = getNotificationPreview(3);

  async function handleChangeHour(h: number) {
    setHour(h);
    setSaving(true);
    await updateNotifyHour(h).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDisable() {
    await unsubscribe().catch(() => {});
    onDisable();
  }

  return (
    <div className="px-5 mt-5 flex flex-col gap-4">
      {/* Status card */}
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(34,197,94,0.15)" }}>
          <Check size={16} style={{ color: "#22c55e" }} />
        </div>
        <div className="flex-1">
          <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Daily inspiration is on</p>
          <p className="text-muted-foreground text-xs">Delivered at {hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`}</p>
        </div>
        {saving && <p style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>Saving…</p>}
        {saved  && <Check size={14} style={{ color: "#22c55e" }} />}
      </div>

      {/* Time picker */}
      <div>
        <p className="text-foreground text-xs mb-3" style={{ fontWeight: 700 }}>CHANGE DELIVERY TIME</p>
        <div className="grid grid-cols-3 gap-2">
          {HOURS.map((h) => (
            <button
              key={h.value}
              onClick={() => handleChangeHour(h.value)}
              className="rounded-xl py-2.5 px-2 text-center border transition-all"
              style={{
                background: hour === h.value ? "var(--brand-gradient-soft)" : "var(--muted)",
                borderColor: hour === h.value ? "var(--primary)" : "var(--border)",
              }}
            >
              <p style={{ fontSize: "12px", fontWeight: 700, color: hour === h.value ? "var(--primary)" : "var(--muted-foreground)" }}>
                {h.value < 12 ? `${h.value} AM` : h.value === 12 ? "12 PM" : `${h.value - 12} PM`}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming previews */}
      <div>
        <p className="text-foreground text-xs mb-3" style={{ fontWeight: 700 }}>COMING UP</p>
        <div className="flex flex-col gap-2">
          {preview.map((n, i) => (
            <div
              key={i}
              className="rounded-2xl p-3 flex items-start gap-3"
              style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>
                {n.type === "quote" ? "💬" : n.type === "question" ? "🔮" : n.type === "challenge" ? "⚡" : "🌙"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs mb-0.5" style={{ fontWeight: 600 }}>
                  {i === 0 ? "Today" : i === 1 ? "Yesterday" : "2 days ago"} · {TYPE_LABELS[n.type] ?? n.type}
                </p>
                <p className="text-foreground text-xs" style={{ lineHeight: 1.5 }}>
                  {n.body.slice(0, 80)}{n.body.length > 80 ? "…" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disable button */}
      <button
        onClick={handleDisable}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm w-full"
        style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 600, border: "1px solid var(--border)" }}
      >
        <BellOff size={14} />
        Turn off daily notifications
      </button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function NotificationsPanel({ onClose }: Props) {
  const unreadCount = NOTIFS.filter((n) => !n.read).length;
  const [tab, setTab]         = useState<"activity" | "inspire">("activity");
  const [permState, setPermState] = useState<"default" | "granted" | "denied" | "unsupported">(() => {
    try { return getPermissionState(); } catch { return "unsupported"; }
  });

  useEffect(() => {
    // Re-check on tab focus
    const check = () => {
      try { setPermState(getPermissionState()); } catch {}
    };
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="absolute top-0 left-0 right-0 z-50 flex flex-col overflow-hidden"
        style={{
          maxHeight: "88%",
          background: "var(--card)",
          borderBottomLeftRadius: "28px",
          borderBottomRightRadius: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          border: "1px solid var(--border)",
          borderTop: "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-foreground" style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "-0.01em" }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs"
                style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--muted)" }}
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex mx-5 mb-1 gap-1 p-1 rounded-2xl flex-shrink-0" style={{ background: "var(--muted)" }}>
          {(["activity", "inspire"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all"
              style={{
                background: tab === t ? "var(--card)" : "transparent",
                color: tab === t ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: tab === t ? 700 : 500,
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              }}
            >
              {t === "activity" ? <Bell size={12} /> : <Sparkles size={12} />}
              {t === "activity" ? "Activity" : "Daily Inspire"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: "none" }}>
          <AnimatePresence mode="wait">
            {tab === "activity" ? (
              <motion.div
                key="activity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {NOTIFS.map((notif, i) => {
                  const { Icon, bg, color } = iconFor(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className="flex gap-3 px-5 py-4 relative cursor-pointer"
                      style={{
                        background: notif.read ? "transparent" : "rgba(232,54,92,0.03)",
                        borderBottom: i < NOTIFS.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      {!notif.read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--primary)" }} />
                      )}
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: bg, fontWeight: 700, fontSize: notif.avatar && notif.avatar.length > 1 ? "11px" : "13px" }}
                      >
                        {notif.avatar
                          ? <span style={{ color }}>{notif.avatar}</span>
                          : <Icon size={16} style={{ color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-foreground text-sm leading-snug" style={{ fontWeight: notif.read ? 500 : 700 }}>
                            {notif.title}
                          </p>
                          <span className="text-muted-foreground flex-shrink-0" style={{ fontSize: "11px", fontWeight: 500, marginTop: "1px" }}>
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5" style={{ lineHeight: 1.5 }}>
                          {notif.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="inspire"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {permState === "denied" ? (
                  <div className="px-5 mt-6 text-center">
                    <BellOff size={36} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-foreground text-sm mb-1" style={{ fontWeight: 700 }}>Notifications blocked</p>
                    <p className="text-muted-foreground text-xs" style={{ lineHeight: 1.6 }}>
                      You've blocked notifications for this app. To enable daily inspiration, go to your browser or phone settings and allow notifications for this site.
                    </p>
                  </div>
                ) : permState === "granted" ? (
                  <NotificationSettings onDisable={() => setPermState("default")} />
                ) : (
                  <NotificationOptIn onGranted={() => setPermState("granted")} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
