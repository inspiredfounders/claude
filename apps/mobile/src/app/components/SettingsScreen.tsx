import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Bell, Lock, CreditCard, HelpCircle, LogOut, ChevronRight, Check, Shield, Globe, Moon, Trash2, ExternalLink, User } from "lucide-react";

interface Props {
  isMember: boolean;
  onBack: () => void;
  onSignOut: () => void;
}

type SettingsSection = "main" | "notifications" | "privacy" | "membership";

const notificationOptions = [
  { id: "new_post",     label: "New community posts",          desc: "When someone posts in The Club" },
  { id: "comments",    label: "Comments on your posts",        desc: "Replies and reactions" },
  { id: "connections", label: "New connections",               desc: "When someone connects with you" },
  { id: "events",      label: "Event reminders",               desc: "24hrs before events you're attending" },
  { id: "assembly",    label: "Assembly reminders",            desc: "Monthly Club Assembly alerts" },
  { id: "mentors",     label: "Mentor responses",              desc: "Updates on your booking requests" },
  { id: "digest",      label: "Weekly digest",                 desc: "Top posts and activity summary" },
  { id: "marketing",   label: "Product updates & news",        desc: "Inspired Club announcements" },
];

export function SettingsScreen({ isMember, onBack, onSignOut }: Props) {
  const [section, setSection] = useState<SettingsSection>("main");
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationOptions.map((n) => [n.id, n.id !== "marketing"]))
  );
  const [darkMode, setDarkMode]       = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const toggleNotif = (id: string) =>
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Notifications section ──
  if (section === "notifications") {
    return (
      <div className="flex flex-col pb-8">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border bg-card">
          <button onClick={() => setSection("main")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={16} className="text-muted-foreground" />
          </button>
          <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>Notifications</h2>
        </div>
        <div className="flex flex-col gap-0 px-5 pt-4">
          {notificationOptions.map((opt, i) => {
            const on = notifications[opt.id];
            return (
              <div key={opt.id}
                className={`flex items-center justify-between py-4 ${i < notificationOptions.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex-1 pr-4">
                  <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{opt.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{opt.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotif(opt.id)}
                  className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: on ? "var(--brand-gradient)" : "var(--border)" }}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: on ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Membership section ──
  if (section === "membership") {
    return (
      <div className="flex flex-col pb-8">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border bg-card">
          <button onClick={() => setSection("main")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={16} className="text-muted-foreground" />
          </button>
          <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>Membership</h2>
        </div>

        <div className="px-5 pt-5 flex flex-col gap-4">
          {isMember ? (
            <>
              {/* Active plan card */}
              <div className="rounded-3xl overflow-hidden" style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}>
                <div className="p-5">
                  <p className="text-white/60 text-xs mb-1" style={{ fontWeight: 600 }}>CURRENT PLAN</p>
                  <p className="text-white mb-0.5" style={{ fontSize: "22px", fontWeight: 800 }}>Club Member</p>
                  <p className="text-white/70 text-sm mb-4">Annual · $44/month · Renews 19 Jun 2027</p>
                  <div className="flex gap-2">
                    {["Community", "Vault", "Mentors", "Assembly", "Perks"].map((f) => (
                      <span key={f} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600 }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Billing details */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {[
                  { label: "Plan",          value: "Annual Membership" },
                  { label: "Amount",        value: "$528 / year ($44/mo)" },
                  { label: "Next billing",  value: "19 June 2027" },
                  { label: "Payment",       value: "Visa ending 4242" },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                    <span className="text-muted-foreground text-sm">{label}</span>
                    <span className="text-foreground text-sm" style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <button className="w-full py-3.5 rounded-2xl border-2 text-sm flex items-center justify-center gap-2"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", fontWeight: 600 }}>
                <CreditCard size={15} /> Update Payment Method
              </button>
              <button className="w-full py-3 text-center text-sm"
                style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>
                Cancel Membership
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.2)" }}>
                <Lock size={28} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-foreground mb-1" style={{ fontSize: "18px", fontWeight: 800 }}>You're on the free plan</p>
                <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>
                  Upgrade to unlock The Club, Vault, Mentors, Assembly, and Perks.
                </p>
              </div>
              <div className="w-full rounded-2xl p-4 bg-card border border-border text-left">
                <p className="text-foreground text-sm mb-1" style={{ fontWeight: 800 }}>Club Membership</p>
                <p className="text-muted-foreground text-xs mb-3">Full access to everything</p>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>$44</span>
                  <span className="text-muted-foreground text-sm">/month · billed annually</span>
                </div>
                <button className="w-full py-3 rounded-xl text-white text-sm"
                  style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main settings ──
  return (
    <div className="flex flex-col pb-10 relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border bg-card">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={16} className="text-muted-foreground" />
        </button>
        <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>Settings</h2>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">

        {/* Account */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs text-muted-foreground" style={{ fontWeight: 700, letterSpacing: "0.06em" }}>ACCOUNT</p>
          {[
            { icon: User,        label: "Personal Information",  desc: "Name, email, photo" },
            { icon: Lock,        label: "Password & Security",   desc: "Change password, 2FA" },
          ].map(({ icon: Icon, label, desc }, i) => (
            <button key={label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${i === 0 ? "border-t border-border" : "border-t border-border"}`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--muted)" }}>
                <Icon size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{label}</p>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Membership */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs text-muted-foreground" style={{ fontWeight: 700, letterSpacing: "0.06em" }}>MEMBERSHIP</p>
          <button
            onClick={() => setSection("membership")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-t border-border"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--brand-gradient)" }}>
              <CreditCard size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Plan & Billing</p>
              <p className="text-muted-foreground text-xs">{isMember ? "Club Member · Annual" : "Free plan"}</p>
            </div>
            {isMember && (
              <span className="text-xs px-2.5 py-0.5 rounded-full mr-2"
                style={{ background: "var(--brand-gradient)", color: "#fff", fontWeight: 700 }}>
                Active
              </span>
            )}
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs text-muted-foreground" style={{ fontWeight: 700, letterSpacing: "0.06em" }}>PREFERENCES</p>

          {/* Notifications */}
          <button
            onClick={() => setSection("notifications")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-t border-border"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--muted)" }}>
              <Bell size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Notifications</p>
              <p className="text-muted-foreground text-xs">
                {Object.values(notifications).filter(Boolean).length} of {notificationOptions.length} enabled
              </p>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>

          {/* Privacy */}
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-t border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--muted)" }}>
              <Shield size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Privacy</p>
              <p className="text-muted-foreground text-xs">Profile visibility, data preferences</p>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        </div>

        {/* Support */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs text-muted-foreground" style={{ fontWeight: 700, letterSpacing: "0.06em" }}>SUPPORT</p>
          {[
            { icon: HelpCircle,    label: "Help Centre",          desc: "FAQs and guides" },
            { icon: Globe,         label: "Inspired Founders",    desc: "Visit our website" },
            { icon: ExternalLink,  label: "Terms & Privacy",      desc: "Legal documents" },
          ].map(({ icon: Icon, label, desc }) => (
            <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-t border-border">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--muted)" }}>
                <Icon size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{label}</p>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* App version */}
        <p className="text-center text-muted-foreground text-xs">Inspired Club · v1.0.0</p>

        {/* Sign out */}
        <button
          onClick={() => setShowSignOut(true)}
          className="w-full py-4 rounded-2xl border-2 text-sm flex items-center justify-center gap-2"
          style={{ borderColor: "rgba(232,54,92,0.3)", color: "var(--primary)", fontWeight: 700 }}
        >
          <LogOut size={15} /> Sign Out
        </button>

        {/* Delete account */}
        <button className="w-full py-3 text-center text-xs flex items-center justify-center gap-1.5"
          style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>
          <Trash2 size={12} /> Delete account
        </button>
      </div>

      {/* Sign out confirmation */}
      <AnimatePresence>
        {showSignOut && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowSignOut(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className="absolute bottom-6 left-5 right-5 z-50 bg-card rounded-3xl p-5 border border-border"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            >
              <p className="text-foreground mb-1" style={{ fontSize: "17px", fontWeight: 800 }}>Sign out?</p>
              <p className="text-muted-foreground text-sm mb-5" style={{ lineHeight: 1.5 }}>
                You'll need to sign back in to access your Club account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOut(false)}
                  className="flex-1 py-3 rounded-2xl text-sm border border-border"
                  style={{ color: "var(--muted-foreground)", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={onSignOut}
                  className="flex-1 py-3 rounded-2xl text-white text-sm"
                  style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
