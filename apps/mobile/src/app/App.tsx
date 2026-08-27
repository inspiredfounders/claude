import { useState, useEffect, useCallback } from "react";
import { onAuthStateChange, signOut as supabaseSignOut } from "../lib/api/auth";
import { getProfile } from "../lib/api/profiles";
import type { Profile } from "../lib/database.types";
import { motion, AnimatePresence } from "motion/react";
import { Home, Calendar, User, Sparkles, BookOpen, Sun, Moon } from "lucide-react";
import northStarIcon from "../imports/InspiredFounders_NorthStarIcon_White.png";
import logoColour from "../imports/InspiredFounders_PrimaryLogo_Colour.svg";
import { OnboardingFlow } from "./components/OnboardingFlow";
import type { OnboardingData } from "./components/OnboardingFlow";
import { JoinClubModal } from "./components/JoinClubModal";
import { HomeScreen } from "./components/HomeScreen";
import { EventsScreen } from "./components/EventsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { ClubTabScreen } from "./components/ClubTabScreen";
import { ClubScreen } from "./components/ClubScreen";
import { MuseScreen } from "./components/MuseScreen";
import { LoginScreen } from "./components/LoginScreen";
import { NotificationsPanel } from "./components/NotificationsPanel";

{/* MARKER-MAKE-KIT-INVOKED */}
{/* MARKER-MAKE-KIT-DISCOVERY-READ */}

// ─── Types ────────────────────────────────────────────────────────────────────
type MainTab  = "home" | "club" | "vault" | "events" | "profile";
type Screen   = "intro" | "splash" | "onboarding" | "login" | "app";
type AppTheme = "light" | "dark";

const mainNav: { id: MainTab; label: string; icon: typeof Home; gated: boolean }[] = [
  { id: "home",    label: "Home",    icon: Home,     gated: false },
  { id: "club",    label: "Club",    icon: Sparkles, gated: false },
  { id: "vault",   label: "Vault",   icon: BookOpen, gated: false },
  { id: "events",  label: "Events",  icon: Calendar, gated: false },
  { id: "profile", label: "Profile", icon: User,     gated: false },
];

// ─── Intro / Brand Screen ─────────────────────────────────────────────────────
function IntroScreen({ theme, onDone }: { theme: AppTheme; onDone: () => void }) {
  const isDark = theme === "dark";
  const bg  = isDark ? "#222222" : "#ffffff";
  const fg  = isDark ? "#ffffff" : "#222222";
  const sub = isDark ? "rgba(255,255,255,0.45)" : "#71717a";

  return (
    <div className="flex flex-col min-h-full relative overflow-hidden" style={{ background: bg }}>

      {/* Same ambient glow as splash */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(240,120,50,0.10) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
        style={{ background: "radial-gradient(circle at 30% 70%, rgba(123,78,200,0.07) 0%, transparent 65%)" }} />

      <div className="relative flex flex-col flex-1 px-6 pt-14 pb-10">

        {/* Top bar — same as splash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-2.5 mb-16"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
            <img src={northStarIcon} alt="" className="w-full h-full object-contain p-1.5" />
          </div>
          <span className="text-sm" style={{ fontWeight: 700, color: fg, letterSpacing: "-0.01em" }}>
            Inspired Club
          </span>
        </motion.div>

        {/* Main content */}
        <div className="flex flex-col flex-1">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mb-5"
            style={{ fontWeight: 600, letterSpacing: "0.12em", fontSize: "11px", color: sub }}
          >
            WELCOME TO
          </motion.p>

          {/* Stacked headline — same size and weight as splash */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col mb-10"
            style={{ gap: "2px" }}
          >
            <p style={{ fontSize: "52px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: fg }}>The</p>
            <p style={{ fontSize: "52px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1,
              background: "var(--brand-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Inspired
            </p>
            <p style={{ fontSize: "52px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: fg }}>Club</p>
          </motion.div>

          {/* Created by block — Inspired Founders logo as the focal point */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            <p style={{ fontWeight: 600, letterSpacing: "0.12em", fontSize: "11px", color: sub }}>
              CREATED BY
            </p>
            <img
              src={logoColour}
              alt="Inspired Founders"
              className="object-contain"
              style={{ width: "180px", height: "auto" }}
            />
          </motion.div>
        </div>

        {/* CTA — same gradient button as splash */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.35, ease: "easeOut" }}
          className="relative"
        >
          {/* Pulse glow */}
          <motion.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: "var(--brand-gradient)", filter: "blur(12px)", opacity: 0.4 }}
          />
          <button
            onClick={onDone}
            className="relative w-full py-4 rounded-2xl text-white text-sm transition-all active:scale-95"
            style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}
          >
            Enter The Club
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ theme, onChange, dark }: { theme: AppTheme; onChange: (t: AppTheme) => void; dark?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full"
      style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(9,9,11,0.06)" }}>
      {(["light", "dark"] as AppTheme[]).map((t) => {
        const active = theme === t;
        return (
          <button key={t} onClick={() => onChange(t)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: active ? (dark ? "rgba(255,255,255,0.18)" : "#fff") : "transparent",
              color: active ? (dark ? "#fff" : "var(--foreground)") : (dark ? "rgba(255,255,255,0.4)" : "var(--muted-foreground)"),
              fontWeight: active ? 700 : 500,
              boxShadow: active && !dark ? "var(--shadow-sm)" : "none",
            }}>
            {t === "light" ? <Sun size={11} /> : <Moon size={11} />}
            {t === "light" ? "Light" : "Dark"}
          </button>
        );
      })}
    </div>
  );
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
];

function SplashScreen({ theme, onThemeChange, onGetStarted, onLogin }: {
  theme: AppTheme; onThemeChange: (t: AppTheme) => void;
  onGetStarted: () => void; onLogin: () => void;
}) {
  const isDark = theme === "dark";
  const bg     = isDark ? "#09090b" : "#ffffff";
  const fg     = isDark ? "#fafafa" : "#09090b";
  const sub    = isDark ? "rgba(250,250,250,0.45)" : "#71717a";

  return (
    <div className="flex flex-col min-h-full relative overflow-hidden transition-colors duration-500" style={{ background: bg }}>

      {/* Ambient glow — top right */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 70% 30%, rgba(232,54,92,0.15) 0%, rgba(240,120,50,0.07) 50%, transparent 75%)",
          transform: "translate(15%,-15%)",
        }} />
      {/* Ambient glow — bottom left */}
      <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 30% 70%, rgba(123,78,200,0.09) 0%, transparent 65%)",
          transform: "translate(-20%, 20%)",
        }} />

      <div className="relative flex flex-col flex-1 px-6 pt-14 pb-10">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
              <img src={northStarIcon} alt="" className="w-full h-full object-contain p-1.5" />
            </div>
            <span className="text-sm" style={{ fontWeight: 700, color: fg, letterSpacing: "-0.01em" }}>
              Inspired Club
            </span>
          </div>
          <ThemeToggle theme={theme} onChange={onThemeChange} dark={isDark} />
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center">

          {/* Eyebrow */}
          <p className="text-xs mb-5" style={{ fontWeight: 600, letterSpacing: "0.12em", color: sub }}>
            THE GLOBAL HOME FOR FOUNDERS
          </p>

          {/* Display headline — stacked, all sans-serif */}
          <div className="mb-7 flex flex-col" style={{ gap: "2px" }}>
            <p style={{ fontSize: "52px", fontWeight: 800, color: fg, lineHeight: 1, letterSpacing: "-0.03em" }}>
              The
            </p>
            <p style={{
                fontSize: "52px", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em",
                background: "var(--brand-gradient)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
              Inspired
            </p>
            <p style={{ fontSize: "52px", fontWeight: 800, color: fg, lineHeight: 1, letterSpacing: "-0.03em" }}>
              Club
            </p>
          </div>

          <p className="mb-10 text-sm" style={{ lineHeight: 1.7, maxWidth: "270px", color: sub }}>
            Lead. Inspire. Shift culture. The community built for founders changing the world.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex -space-x-2">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full object-cover border-2"
                  style={{ borderColor: bg }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: sub }}>
              <span style={{ fontWeight: 700, color: fg }}>2,400+ founders</span> worldwide
            </p>
          </div>

          {/* CTA stack */}
          <button onClick={onGetStarted}
            className="w-full py-4 rounded-2xl text-white text-sm mb-3 transition-opacity active:opacity-80"
            style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)", letterSpacing: "-0.01em" }}>
            Get Started — it's free
          </button>
          <button onClick={onLogin}
            className="w-full py-4 rounded-2xl text-sm transition-all"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "var(--muted)",
              color: isDark ? "rgba(255,255,255,0.55)" : "var(--muted-foreground)",
              fontWeight: 600,
            }}>
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const DEV_SKIP = false; // ← set true to skip auth and jump straight to app
  const [screen, setScreen]               = useState<Screen>(DEV_SKIP ? "app" : "splash");
  const [isMember, setIsMember]           = useState(DEV_SKIP);
  const [mainTab, setMainTab]             = useState<MainTab>("home");
  const [showModal, setShowModal]         = useState(false);
  const [showMuse, setShowMuse]           = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [theme, setTheme]                 = useState<AppTheme>("light");
  const [eventsStartTab, setEventsStartTab] = useState<"upcoming" | "past" | "assembly">("upcoming");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const isDark = theme === "dark";

  // Sync with Supabase auth session
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (userId) => {
      setCurrentUserId(userId);
      if (userId) {
        const profile = await getProfile(userId);
        setCurrentProfile(profile);
        const isMem = profile?.role === "member" || profile?.role === "admin";
        setIsMember(isMem);
        if (screen === "login" || screen === "splash") setScreen("app");
      } else {
        setCurrentProfile(null);
        setIsMember(false);
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnboardingComplete = (_data: OnboardingData) => setScreen("app");

  const handleTabPress = (tab: MainTab, gated: boolean) => {
    if (gated && !isMember) setShowModal(true);
    else { if (tab !== "events") setEventsStartTab("upcoming"); setMainTab(tab); }
  };

  const handleSubscribe = () => {
    setIsMember(true);
    setMainTab("club");
    setShowModal(false);
  };

  const renderContent = () => {
    switch (mainTab) {
      case "home":    return <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}><HomeScreen isMember={isMember} currentProfile={currentProfile} onOpenMuse={() => setShowMuse(true)} onOpenNotifications={() => setShowNotifs(true)} onNavigate={(tab) => handleTabPress(tab, mainNav.find(n => n.id === tab)?.gated ?? false)} onJoin={() => setShowModal(true)} onGoToAssembly={() => { setEventsStartTab("assembly"); setMainTab("events"); }} /></div>;
      case "club":    return <div className="flex-1 relative overflow-hidden"><ClubTabScreen currentUserId={currentUserId ?? undefined} /></div>;
      case "vault":   return <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}><ClubScreen /></div>;
      case "events":  return <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}><EventsScreen isMember={isMember} onJoin={() => setShowModal(true)} initialTab={eventsStartTab} /></div>;
      case "profile": return <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}><ProfileScreen isMember={isMember} currentProfile={currentProfile} currentUserId={currentUserId ?? undefined} onSignOut={async () => { await supabaseSignOut().catch(() => {}); setIsMember(false); setCurrentUserId(null); setCurrentProfile(null); setScreen("splash"); }} /></div>;
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gray-950">
      {/* Apply dark class to the phone container so CSS vars switch */}
      <div
        className={`w-full max-w-sm h-full max-h-[900px] relative overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? "dark" : ""}`}
        style={{
          borderRadius: "2.5rem",
          background: isDark ? "#222222" : "#ffffff",
        }}
      >
        <AnimatePresence mode="wait">

          {/* ── Intro brand screen ── */}
          {screen === "intro" && (
            <motion.div
              key="intro"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            >
              <IntroScreen theme={theme} onDone={() => setScreen("splash")} />
            </motion.div>
          )}

          {/* ── Splash ── */}
          {screen === "splash" && (
            <motion.div
              key="splash"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.28 }}
            >
              <SplashScreen
                theme={theme}
                onThemeChange={setTheme}
                onGetStarted={() => setScreen("onboarding")}
                onLogin={() => setScreen("login")}
              />
            </motion.div>
          )}

          {/* ── Onboarding ── */}
          {screen === "onboarding" && (
            <motion.div
              key="onboarding"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <OnboardingFlow
                onComplete={handleOnboardingComplete}
                onBack={() => setScreen("splash")}
              />
            </motion.div>
          )}

          {/* ── Login ── */}
          {screen === "login" && (
            <motion.div
              key="login"
              className="absolute inset-0 bg-background"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <LoginScreen
                onLogin={() => { setScreen("app"); }}
                onBack={() => setScreen("splash")}
              />
            </motion.div>
          )}

          {/* ── App ── */}
          {screen === "app" && (
            <motion.div
              key="app"
              className="absolute inset-0 flex flex-col bg-background"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {renderContent()}
                <AnimatePresence>
                  {showMuse && (
                    <MuseScreen onClose={() => setShowMuse(false)} />
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showNotifs && (
                    <NotificationsPanel onClose={() => setShowNotifs(false)} />
                  )}
                </AnimatePresence>
                <JoinClubModal
                  visible={showModal}
                  onSubscribe={handleSubscribe}
                  onDismiss={() => setShowModal(false)}
                />
              </div>

              {/* Bottom nav — clean, MindValley-style */}
              <div
                className="flex-shrink-0 bg-card"
                style={{
                  borderTop: `1px solid var(--border)`,
                  boxShadow: isDark ? "0 -1px 0 rgba(255,255,255,0.04), 0 -12px 40px rgba(0,0,0,0.5)" : "0 -1px 0 rgba(9,9,11,0.06), 0 -8px 32px rgba(0,0,0,0.04)",
                }}
              >
                {/* Theme toggle — thin strip above nav items */}
                <div className="flex justify-center pt-2 pb-0">
                  <ThemeToggle theme={theme} onChange={setTheme} dark={isDark} />
                </div>

                <div className="flex items-center px-2 pt-2 pb-5">
                  {mainNav.map(({ id, label, icon: Icon, gated }) => {
                    const isLocked = gated && !isMember;
                    const isActive = mainTab === id;

                    return (
                      <button
                        key={id}
                        onClick={() => handleTabPress(id, gated)}
                        className="flex-1 flex flex-col items-center gap-1.5 py-1 transition-all active:scale-95"
                      >
                        {/* Icon */}
                        <div className="relative">
                          {/* All tabs — outline icon, consistent treatment */}
                          <div className="w-10 h-7 flex items-center justify-center">
                            <Icon
                              size={22}
                              strokeWidth={isActive ? 2.5 : 1.7}
                              style={{
                                color: isActive ? "var(--primary)" : isLocked ? "var(--primary)" : "var(--muted-foreground)",
                                filter: isActive ? "drop-shadow(0 0 6px rgba(232,54,92,0.4))" : "none",
                                transition: "all 0.2s",
                              }}
                            />
                          </div>

                          {/* Lock badge */}
                          {isLocked && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: "var(--foreground)", border: "1.5px solid var(--card)" }}>
                              <svg width="7" height="7" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(255,255,255,0.9)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Label */}
                        <span className="transition-all" style={{
                          fontSize: "10px",
                          letterSpacing: "0.01em",
                          color: isActive || isLocked ? "var(--primary)" : "var(--muted-foreground)",
                          fontWeight: isActive || isLocked ? 700 : 400,
                        }}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
