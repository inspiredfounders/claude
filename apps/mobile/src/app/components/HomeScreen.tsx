import { Bell, ChevronRight, MapPin, Calendar, Users, Lock, Play, UserPlus, Sparkles, Mic2, Clock, Headphones, ChevronLeft, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getDailyReading, getSunSign, parseBirthDate, ZODIAC } from "../../lib/astrology";

// ─── Data ─────────────────────────────────────────────────────────────────────

const upcomingEvent = {
  title: "Inspired Founders Brisbane",
  date: "12 Sept",
  day: "Friday",
  location: "Brisbane, QLD",
  image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=300&fit=crop&auto=format",
  tickets: true,
  attending: 84,
  tag: "In Person",
};

const upcomingSession = {
  title: "Assembly",
  subtitle: "Live Thursday",
  host: "Priscilla Ava",
  hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  date: "Thu, Jun 19",
  time: "3:00 PM EST",
  liveIn: "2 days",
  topic: "Monthly Club Assembly — topic deep-dive & open Q&A",
  attendees: 142,
};

const communityWins = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    win: "landed her first client 🎉",
    detail: "6-figure consulting contract — 3 months in the making.",
    time: "1h ago",
    emoji: "🏆",
    likes: 48,
  },
  {
    id: 2,
    name: "James Okafor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    win: "hit $100k month 🚀",
    detail: "From zero to six figures in 11 months. Never giving up.",
    time: "3h ago",
    emoji: "💰",
    likes: 127,
  },
  {
    id: 3,
    name: "Morgan Blake",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    win: "launched her podcast 🎙️",
    detail: "Episode 1 is live. 'The Founder's Mind' — go listen!",
    time: "5h ago",
    emoji: "🎙️",
    likes: 93,
  },
  {
    id: 4,
    name: "Devon Achebe",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    win: "closed a $2M seed round 💸",
    detail: "18 months of work, 60+ investor meetings. We did it.",
    time: "1d ago",
    emoji: "💸",
    likes: 214,
  },
];

const suggestedConnections = [
  {
    id: 1,
    name: "Amara Osei",
    role: "Founder",
    company: "Collab Studio",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&auto=format",
    mutual: 12,
    tags: ["Marketing", "Community"],
  },
  {
    id: 2,
    name: "Kai Thornton",
    role: "Co-Founder",
    company: "GreenRoot",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format",
    mutual: 7,
    tags: ["Impact", "B2B"],
  },
  {
    id: 3,
    name: "Sofia Reyes",
    role: "Founder & CEO",
    company: "Fonda",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&auto=format",
    mutual: 19,
    tags: ["Consumer", "Brand"],
  },
  {
    id: 4,
    name: "Lucas Kim",
    role: "Founder",
    company: "Drift Labs",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&h=120&fit=crop&auto=format",
    mutual: 4,
    tags: ["AI", "SaaS"],
  },
];

const vaultPreviews = [
  {
    id: 1,
    title: "How I Raised $10M Without Cold Emails",
    author: "Marcus Webb",
    type: "Masterclass",
    duration: "47 min",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=180&fit=crop&auto=format",
    locked: false,
  },
  {
    id: 2,
    title: "Series A Pitch Deck Template 2026",
    author: "Inspired Club",
    type: "Template",
    duration: "Download",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=180&fit=crop&auto=format",
    locked: true,
  },
  {
    id: 3,
    title: "Founder's Playbook: 0 → $1M ARR",
    author: "Priscilla Ava",
    type: "Guide",
    duration: "34 min read",
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=300&h=180&fit=crop&auto=format",
    locked: true,
  },
];

// ─── Nav callback type ────────────────────────────────────────────────────────
type MainTab = "home" | "club" | "vault" | "events" | "profile";

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub, onSeeAll }: { title: string; sub?: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-end justify-between px-5 mb-3">
      <div>
        <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h2>
        {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
      </div>
      {onSeeAll && (
        <button className="flex items-center gap-0.5 text-xs pb-0.5" style={{ color: "var(--primary)", fontWeight: 600 }}>
          See all <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Welcome Block ────────────────────────────────────────────────────────────
function WelcomeBlock({ onOpenMuse, onOpenNotifications, onNavigateToProfile }: { onOpenMuse: () => void; onOpenNotifications: () => void; onNavigateToProfile: () => void }) {
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Subtle ambient gradient behind the header */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(217,70,239,0.08) 0%, transparent 70%)" }} />

      <div className="relative px-5 pt-12 pb-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-muted-foreground text-sm mb-1" style={{ fontWeight: 500 }}>
              {greeting} ✦
            </p>
            {/* Serif italic name — Masterclass moment */}
            <h1 className="display-serif text-foreground"
              style={{ fontSize: "32px", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              Priscilla Ava
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={onOpenNotifications} className="relative w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--muted)" }}>
              <Bell size={17} className="text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-background"
                style={{ background: "var(--primary)" }} />
            </button>
            <button onClick={() => onNavigateToProfile()} className="rounded-full">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"
                alt="Priscilla"
                className="w-10 h-10 rounded-full object-cover"
                style={{ boxShadow: "0 0 0 2px var(--primary), 0 0 0 4px var(--background)" }}
              />
            </button>
          </div>
        </div>

        {/* Muse entry — tappable prompt that opens the AI companion */}
        <button
          onClick={onOpenMuse}
          className="w-full rounded-2xl text-left transition-all active:scale-99 overflow-hidden relative"
          style={{
            background: "#0a0710",
            boxShadow: "0 8px 32px rgba(123,78,200,0.25), 0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {/* Subtle ambient glow inside the card */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(232,54,92,0.16) 0%, rgba(123,78,200,0.08) 55%, transparent 80%)",
          }} />

          <div className="relative flex items-center gap-3 px-4 py-3.5">
            {/* Muse icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f07832 0%, #e8365c 50%, #7b4ec8 100%)", boxShadow: "0 4px 16px rgba(232,54,92,0.4)" }}
            >
              <Sparkles size={14} className="text-white" strokeWidth={1.8} />
            </div>

            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Chat with Muse
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 500, marginTop: "2px" }}>
                What would you like to explore today?
              </p>
            </div>

            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Upcoming Event Card ──────────────────────────────────────────────────────
function UpcomingEventCard({ onNavigate }: { onNavigate: (tab: MainTab) => void }) {
  return (
    <div className="px-5 mb-6">
      <SectionHeader title="Upcoming Event" sub="Don't miss this one" onSeeAll={() => onNavigate("events")} />
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* Background image */}
        <img
          src={upcomingEvent.image}
          alt={upcomingEvent.title}
          className="w-full h-44 object-cover"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(26,17,24,0.92) 40%, rgba(26,17,24,0.2) 100%)" }}
        />

        {/* Tag */}
        <div className="absolute top-3 left-3">
          <span
            className="text-white text-xs px-3 py-1 rounded-full"
            style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
          >
            {upcomingEvent.tag}
          </span>
        </div>

        {/* Attending count */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 rounded-full px-2.5 py-1">
          <Users size={11} className="text-white/70" />
          <span className="text-white/80 text-xs" style={{ fontWeight: 600 }}>{upcomingEvent.attending} going</span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white mb-1" style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.2 }}>
            {upcomingEvent.title}
          </h3>
          <div className="flex items-center gap-3 mb-3 text-white/60 text-xs">
            <span className="flex items-center gap-1"><Calendar size={11} />{upcomingEvent.day}, {upcomingEvent.date}</span>
            <span className="flex items-center gap-1"><MapPin size={11} />{upcomingEvent.location}</span>
          </div>
          <button
            onClick={() => onNavigate("events")}
            className="w-full py-2.5 rounded-xl text-sm"
            style={{ background: "var(--brand-gradient)", color: "#fff", fontWeight: 700 }}
          >
            Tickets Available — Get Yours
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upcoming Session Card ────────────────────────────────────────────────────
function UpcomingSessionCard({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="px-5 mb-6">
      <SectionHeader title="Upcoming Session" sub="Live inside the club" />
      <div
        className="rounded-3xl p-4 relative overflow-hidden"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-md)", border: "1px solid var(--border)" }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
          style={{ background: "var(--brand-gradient)" }}
        />

        <div className="pl-3">
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live {upcomingSession.liveIn}
            </span>
            <span className="text-muted-foreground text-xs">{upcomingSession.date} · {upcomingSession.time}</span>
          </div>

          {/* Title */}
          <h3 className="text-foreground mb-0.5" style={{ fontSize: "20px", fontWeight: 800 }}>
            {upcomingSession.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3" style={{ lineHeight: 1.4 }}>
            {upcomingSession.topic}
          </p>

          {/* Host + attendees */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={upcomingSession.hostAvatar}
                alt={upcomingSession.host}
                className="w-7 h-7 rounded-full object-cover border-2"
                style={{ borderColor: "var(--primary)" }}
              />
              <span className="text-muted-foreground text-xs">
                Hosted by <span className="text-foreground" style={{ fontWeight: 700 }}>{upcomingSession.host}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users size={11} />
              <span>{upcomingSession.attendees} attending</span>
            </div>
          </div>

          {/* RSVP */}
          <button
            onClick={onNavigate}
            className="mt-3 w-full py-2.5 rounded-xl text-sm border-2 transition-all"
            style={{ borderColor: "var(--primary)", color: "var(--primary)", fontWeight: 700 }}
          >
            RSVP — Save My Spot
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Community Wins ───────────────────────────────────────────────────────────
function CommunityWins({ onNavigate }: { onNavigate: (tab: MainTab) => void }) {
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  return (
    <div className="mb-6">
      <div className="px-5 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>Community Wins</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Your people are moving 🔥</p>
        </div>
        <button onClick={() => onNavigate("club")} className="flex items-center gap-0.5 text-sm" style={{ color: "var(--primary)", fontWeight: 600 }}>
          See all <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5 px-5">
        {communityWins.map((win, i) => (
          <div
            key={win.id}
            className="bg-card rounded-2xl p-4 border border-border flex gap-3 items-start"
            style={{
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              animationDelay: `${i * 80}ms`,
            }}
          >
            {/* Emoji badge + avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={win.avatar}
                alt={win.name}
                className="w-11 h-11 rounded-full object-cover"
              />
              <span
                className="absolute -bottom-1 -right-1 text-base leading-none"
                style={{ fontSize: "14px" }}
              >
                {win.emoji}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm" style={{ lineHeight: 1.4 }}>
                <span style={{ fontWeight: 800 }}>{win.name}</span>{" "}
                <span className="text-muted-foreground">{win.win}</span>
              </p>
              <p className="text-muted-foreground text-xs mt-1" style={{ lineHeight: 1.4 }}>
                {win.detail}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-muted-foreground text-xs">{win.time}</span>
                <button
                  onClick={() => setLiked((p) => ({ ...p, [win.id]: !p[win.id] }))}
                  className="flex items-center gap-1 text-xs transition-all"
                  style={{ color: liked[win.id] ? "var(--primary)" : "var(--muted-foreground)", fontWeight: 600 }}
                >
                  <span>{liked[win.id] ? "❤️" : "🤍"}</span>
                  {win.likes + (liked[win.id] ? 1 : 0)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Suggested Connections ────────────────────────────────────────────────────
function SuggestedConnections() {
  const [connected, setConnected] = useState<Record<number, boolean>>({});

  return (
    <div className="mb-6">
      <div className="px-5 mb-3">
        <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>People You Should Meet</h2>
        <p className="text-muted-foreground text-xs mt-0.5">Based on your interests & stage</p>
      </div>

      <div
        className="flex gap-3 px-5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {suggestedConnections.map((person) => {
          const isConnected = connected[person.id];
          return (
            <div
              key={person.id}
              className="flex-shrink-0 w-44 bg-card rounded-2xl p-4 border border-border text-center"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <div className="relative inline-block mb-2">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-14 h-14 rounded-2xl object-cover mx-auto"
                />
                {/* Online indicator */}
                <span
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card"
                  style={{ background: "#22c55e" }}
                />
              </div>

              <p className="text-foreground text-sm" style={{ fontWeight: 800, lineHeight: 1.2 }}>{person.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{person.role}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--primary)", fontWeight: 600 }}>{person.company}</p>

              <div className="flex items-center justify-center gap-1 my-2 text-muted-foreground">
                <Users size={10} />
                <span className="text-xs">{person.mutual} mutual</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 justify-center mb-3">
                {person.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 500 }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setConnected((p) => ({ ...p, [person.id]: !p[person.id] }))}
                className="w-full py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: isConnected ? "var(--secondary)" : "var(--brand-gradient)",
                  color: isConnected ? "var(--primary)" : "#fff",
                  fontWeight: 700,
                }}
              >
                <UserPlus size={12} />
                {isConnected ? "Connected" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vault Preview ────────────────────────────────────────────────────────────
function VaultPreview({ isMember, onNavigate, onJoin }: { isMember?: boolean; onNavigate: (tab: MainTab) => void; onJoin: () => void }) {
  return (
    <div className="mb-6">
      <div className="px-5 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>Latest from The Vault</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Resources to build faster</p>
        </div>
        <button onClick={() => onNavigate("vault")} className="flex items-center gap-0.5 text-sm" style={{ color: "var(--primary)", fontWeight: 600 }}>
          See all <ChevronRight size={14} />
        </button>
      </div>

      <div
        className="flex gap-3 px-5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {vaultPreviews.map((item) => {
          const isLocked = item.locked && !isMember;
          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-52 bg-card rounded-2xl overflow-hidden border border-border"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-28 object-cover"
                  style={{ filter: isLocked ? "blur(3px) brightness(0.6)" : "none" }}
                />
                {/* Play button for non-locked */}
                {!isLocked && (
                  <button
                    onClick={() => onNavigate("vault")}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "var(--brand-gradient)" }}
                  >
                    <Play size={13} className="text-white" style={{ marginLeft: 1 }} />
                  </button>
                )}
                {/* Lock overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                    >
                      <Lock size={16} className="text-white" />
                    </div>
                    <span className="text-white text-xs" style={{ fontWeight: 700 }}>Members Only</span>
                  </div>
                )}
                {/* Type badge */}
                <span
                  className="absolute top-2 left-2 text-white text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.5)", fontWeight: 600 }}
                >
                  {item.type}
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <p
                  className="text-foreground text-sm mb-1"
                  style={{ fontWeight: 700, lineHeight: 1.3 }}
                >
                  {item.title}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">{item.author}</p>
                  <span className="text-xs text-muted-foreground">{item.duration}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-member CTA */}
      {!isMember && (
        <div
          className="mx-5 mt-4 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "var(--brand-gradient-soft)", border: "1px dashed var(--primary)" }}
        >
          <Lock size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <div className="flex-1">
            <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Unlock the full Vault</p>
            <p className="text-muted-foreground text-xs">50+ resources for members</p>
          </div>
          <button
            onClick={onJoin}
            className="px-3 py-1.5 rounded-xl text-xs text-white flex-shrink-0"
            style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
          >
            Join
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Podcast Data ─────────────────────────────────────────────────────────────
interface PodcastEpisode {
  id: number;
  title: string;
  guest: string;
  guestAvatar: string;
  guestTitle: string;
  duration: string;
  date: string;
  description: string;
  cover: string;
  isNew?: boolean;
}

const podcastEpisodes: PodcastEpisode[] = [
  {
    id: 1,
    title: "Building a Brand That Outlasts Trends",
    guest: "Priscilla Ava",
    guestAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    guestTitle: "CEO & Founder · Nova Labs",
    duration: "58 min",
    date: "Jul 18, 2026",
    description: "Priscilla breaks down the three pillars of an evergreen brand — and why most founders confuse aesthetics with identity.",
    cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=600&fit=crop&auto=format",
    isNew: true,
  },
  {
    id: 2,
    title: "From Zero to 50k: Community-Led Growth",
    guest: "Marcus Webb",
    guestAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    guestTitle: "Founder · TealTech",
    duration: "1h 12 min",
    date: "Jul 10, 2026",
    description: "Marcus shares the exact playbook he used to grow his founder community to 50k without spending a dollar on ads.",
    cover: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop&auto=format",
  },
  {
    id: 3,
    title: "The Art of the High-Stakes Pitch",
    guest: "Jade Morales",
    guestAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    guestTitle: "Partner · Sequoia",
    duration: "44 min",
    date: "Jul 3, 2026",
    description: "What VCs really think when you walk in the room — and how to reframe your pitch around the outcome, not the product.",
    cover: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=600&fit=crop&auto=format",
  },
  {
    id: 4,
    title: "Pricing Psychology for Premium Offers",
    guest: "Devon Achebe",
    guestAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    guestTitle: "Author · Pricing Right",
    duration: "51 min",
    date: "Jun 26, 2026",
    description: "Why charging more actually increases trust — and the counterintuitive pricing moves that Devon's clients swear by.",
    cover: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=600&fit=crop&auto=format",
  },
  {
    id: 5,
    title: "Fundraising Without Losing Control",
    guest: "Amara Osei",
    guestAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    guestTitle: "Founder · Osei Capital",
    duration: "1h 3 min",
    date: "Jun 19, 2026",
    description: "Amara walked away from a $4M offer. Here's why — and what she did next to build on her own terms.",
    cover: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&h=600&fit=crop&auto=format",
  },
  {
    id: 6,
    title: "The Founder's Mental Health Playbook",
    guest: "Jade Morales",
    guestAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    guestTitle: "Executive Coach",
    duration: "39 min",
    date: "Jun 12, 2026",
    description: "Burnout isn't a badge of honour. Jade gives the honest, practical framework she uses with 200+ founders.",
    cover: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop&auto=format",
  },
];

// ─── Podcast Player ────────────────────────────────────────────────────────────
function PodcastPlayer({ episode, onClose }: { episode: PodcastEpisode; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const epNum = podcastEpisodes.length - podcastEpisodes.findIndex((e) => e.id === episode.id);

  return (
    <motion.div className="absolute inset-0 z-50 flex flex-col bg-background"
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <p className="text-muted-foreground text-xs" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
          INSPIRED FOUNDERS PODCAST
        </p>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col items-center" style={{ scrollbarWidth: "none" }}>
        {/* Cover art — scales with playback */}
        <motion.div
          animate={{ scale: playing ? 1 : 0.88 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="w-full max-w-xs rounded-3xl overflow-hidden mb-8 mt-4"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 8px 24px rgba(232,54,92,0.18)" }}>
          <img src={episode.cover} alt={episode.title} className="w-full aspect-square object-cover" />
        </motion.div>

        {/* Episode info */}
        <div className="w-full mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
            <span className="text-muted-foreground text-xs" style={{ fontWeight: 600 }}>
              Ep. {epNum} · {episode.date}
            </span>
          </div>
          <h2 className="text-foreground mb-3" style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.25 }}>
            {episode.title}
          </h2>
          <div className="flex items-center gap-3">
            <img src={episode.guestAvatar} alt={episode.guest}
              className="w-10 h-10 rounded-full object-cover border-2"
              style={{ borderColor: "var(--primary)" }} />
            <div>
              <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{episode.guest}</p>
              <p className="text-muted-foreground text-xs">{episode.guestTitle}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-3">
          <div className="h-1.5 rounded-full bg-muted mb-2 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100));
            }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "var(--brand-gradient)" }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
            <span>0:00</span>
            <span>{episode.duration}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button className="w-11 h-11 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
            </svg>
          </button>
          <button
            onClick={() => { setPlaying((p) => !p); if (!playing) setProgress((p) => Math.min(p + 1, 100)); }}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}>
            {playing
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <Play size={22} className="text-white" style={{ marginLeft: 3 }} />}
          </button>
          <button className="w-11 h-11 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.5"/>
            </svg>
          </button>
        </div>

        {/* Description */}
        <div className="w-full p-4 rounded-2xl border border-border bg-card">
          <p className="text-foreground text-xs mb-1" style={{ fontWeight: 700 }}>About this episode</p>
          <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>{episode.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Podcast List Screen ───────────────────────────────────────────────────────
function PodcastListScreen({ onClose, onPlay }: { onClose: () => void; onPlay: (ep: PodcastEpisode) => void }) {
  return (
    <motion.div className="absolute inset-0 z-40 flex flex-col bg-background"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}>

      <div className="flex-shrink-0 bg-card border-b border-border px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 800 }}>Inspired Founders Podcast</h2>
            <p className="text-muted-foreground text-xs">{podcastEpisodes.length} episodes · Free for all</p>
          </div>
        </div>
      </div>

      {/* Show info */}
      <div className="flex gap-4 px-5 py-4 border-b border-border bg-card">
        <img src={podcastEpisodes[0].cover} alt="Podcast"
          className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }} />
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm mb-1" style={{ fontWeight: 800 }}>Inspired Founders</p>
          <p className="text-muted-foreground text-xs" style={{ lineHeight: 1.5 }}>
            Real conversations with the builders redefining what it means to be a modern founder.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-muted-foreground text-xs"><Headphones size={11} /> 4.9 rating</span>
            <span className="flex items-center gap-1 text-muted-foreground text-xs"><Mic2 size={11} /> Weekly</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {podcastEpisodes.map((ep, i) => (
          <div key={ep.id}
            className="flex items-start gap-3 px-5 py-4 cursor-pointer active:bg-muted/50 transition-colors"
            style={{ borderBottom: "1px solid var(--border)" }}
            onClick={() => onPlay(ep)}>
            <span className="text-muted-foreground text-xs w-5 text-right flex-shrink-0 pt-1" style={{ fontWeight: 600 }}>
              {podcastEpisodes.length - i}
            </span>
            <img src={ep.cover} alt={ep.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {ep.isNew && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "var(--primary)", fontWeight: 700, fontSize: "9px" }}>NEW</span>
                )}
                <span className="text-muted-foreground text-xs">{ep.date}</span>
              </div>
              <p className="text-foreground text-sm mb-1" style={{ fontWeight: 700, lineHeight: 1.3 }}>{ep.title}</p>
              <p className="text-muted-foreground text-xs mb-1.5 line-clamp-2" style={{ lineHeight: 1.4 }}>{ep.description}</p>
              <span className="flex items-center gap-1 text-muted-foreground text-xs"><Clock size={10} /> {ep.duration}</span>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}>
              <Play size={13} className="text-white" style={{ marginLeft: 1 }} />
            </div>
          </div>
        ))}
        <div className="h-6" />
      </div>
    </motion.div>
  );
}

// ─── Podcast Section (Home) ────────────────────────────────────────────────────
function PodcastSection({ onViewAll, onPlay }: { onViewAll: () => void; onPlay: (ep: PodcastEpisode) => void }) {
  return (
    <div className="mb-6">
      <div className="px-5 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>Inspired Founders Podcast</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Free for all founders</p>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-0.5 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>
          All episodes <ChevronRight size={13} />
        </button>
      </div>

      {/* Latest episode — hero */}
      <div className="px-5 mb-3">
        <div onClick={() => onPlay(podcastEpisodes[0])}
          className="rounded-2xl overflow-hidden border border-border cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: "var(--card)" }}>
          <div className="relative h-36">
            <img src={podcastEpisodes[0].cover} alt={podcastEpisodes[0].title}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to right, rgba(10,5,15,0.9) 0%, rgba(10,5,15,0.45) 55%, transparent 100%)" }} />
            <div className="absolute top-3 left-3">
              <span className="flex items-center gap-1 text-white text-xs px-2.5 py-1 rounded-full"
                style={{ background: "var(--primary)", fontWeight: 700 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Latest
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-14">
              <p className="text-white text-sm mb-1" style={{ fontWeight: 800, lineHeight: 1.3 }}>
                {podcastEpisodes[0].title}
              </p>
              <div className="flex items-center gap-1.5">
                <img src={podcastEpisodes[0].guestAvatar} alt={podcastEpisodes[0].guest}
                  className="w-5 h-5 rounded-full object-cover" />
                <span className="text-white/70 text-xs">
                  {podcastEpisodes[0].guest} · {podcastEpisodes[0].duration}
                </span>
              </div>
            </div>
            {/* Play button */}
            <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}>
              <Play size={16} className="text-white" style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Next 2 episodes — compact list */}
      <div className="mx-5 rounded-2xl overflow-hidden border border-border" style={{ background: "var(--card)" }}>
        {podcastEpisodes.slice(1, 3).map((ep, i) => (
          <div key={ep.id}
            onClick={() => onPlay(ep)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-muted/50 transition-colors"
            style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
            <img src={ep.cover} alt={ep.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-xs truncate" style={{ fontWeight: 700 }}>{ep.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{ep.guest} · {ep.duration}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}>
              <Play size={12} className="text-white" style={{ marginLeft: 1 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Daily Cosmic Card ────────────────────────────────────────────────────────

function EnergyBar({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all"
          style={{
            width: i < value ? "8px" : "4px",
            background: i < value
              ? `hsl(${270 + i * 9}, 70%, ${55 + i * 3}%)`
              : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

function DailyCosmicCard({
  reading,
  expanded,
  onToggle,
  hasPersonalChart,
}: {
  reading: ReturnType<typeof getDailyReading>;
  expanded: boolean;
  onToggle: () => void;
  hasPersonalChart: boolean;
}) {
  const sign = reading.sunSign;
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <motion.div
      layout
      className="mx-5 mt-4 rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(145deg, #100820, #1c0f33)",
        border: "1px solid rgba(123,78,200,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
      onClick={onToggle}
    >
      {/* Top ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 30% 0%, ${sign.color}20 0%, transparent 70%)` }} />

      {/* Header — always visible */}
      <div className="relative z-10 p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Sign orb */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{
                background: `linear-gradient(135deg, ${sign.color}30, ${sign.color}10)`,
                border: `1.5px solid ${sign.color}50`,
                boxShadow: `0 0 16px ${sign.color}20`,
              }}
            >
              {sign.symbol}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span style={{ fontSize: "9px", color: "rgba(200,180,255,0.5)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  TODAY'S FOUNDER FORECAST
                </span>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 800, color: "#e8d5ff", lineHeight: 1.3 }}>
                {reading.headline}
              </p>
            </div>
          </div>
          <div style={{ fontSize: "10px", color: "rgba(200,180,255,0.35)", marginTop: "2px", flexShrink: 0 }}>
            {expanded ? "▲" : "▼"}
          </div>
        </div>

        {/* Energy + theme row */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "9px", color: "rgba(200,180,255,0.4)", fontWeight: 600 }}>ENERGY</span>
            <EnergyBar value={reading.energy} />
            <span style={{ fontSize: "9px", color: "rgba(200,180,255,0.5)", fontWeight: 700 }}>{reading.energy}/10</span>
          </div>
          <div
            className="px-2 py-0.5 rounded-full"
            style={{ background: `${sign.color}20`, border: `1px solid ${sign.color}30` }}
          >
            <span style={{ fontSize: "9px", color: sign.color, fontWeight: 700, textTransform: "capitalize" }}>
              {reading.theme}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 relative z-10">
              <div className="h-px mb-4" style={{ background: "rgba(123,78,200,0.2)" }} />

              {/* Reading body */}
              <p style={{ fontSize: "13px", color: "rgba(220,200,255,0.75)", lineHeight: 1.75 }}>
                {reading.body}
              </p>

              {/* Founder focus */}
              <div
                className="mt-4 p-3 rounded-2xl"
                style={{ background: `${sign.color}12`, border: `1px solid ${sign.color}25` }}
              >
                <p style={{ fontSize: "10px", color: "rgba(200,180,255,0.5)", fontWeight: 700, marginBottom: "4px" }}>
                  FOUNDER FOCUS
                </p>
                <p style={{ fontSize: "13px", color: "#e8d5ff", fontWeight: 600, fontStyle: "italic" }}>
                  "{reading.founderFocus}"
                </p>
              </div>

              {/* Affirmation */}
              <div className="mt-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "10px", color: "rgba(200,180,255,0.5)", fontWeight: 700, marginBottom: "4px" }}>
                  AFFIRMATION
                </p>
                <p style={{ fontSize: "12px", color: "rgba(220,200,255,0.7)", lineHeight: 1.6 }}>
                  {reading.affirmation}
                </p>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5">
                  <Star size={10} fill={sign.color} stroke="none" />
                  <span style={{ fontSize: "10px", color: "rgba(200,180,255,0.4)" }}>
                    {sign.name} · {sign.element} · {sign.ruling}
                  </span>
                </div>
                <span style={{ fontSize: "10px", color: "rgba(200,180,255,0.3)" }}>
                  Lucky hour: {reading.luckyHour}
                </span>
              </div>

              {!hasPersonalChart && (
                <div
                  className="mt-3 p-3 rounded-2xl flex items-center gap-2"
                  style={{ background: "rgba(123,78,200,0.1)", border: "1px solid rgba(123,78,200,0.2)" }}
                >
                  <span style={{ fontSize: "14px" }}>✨</span>
                  <p style={{ fontSize: "11px", color: "rgba(200,180,255,0.6)", lineHeight: 1.5 }}>
                    This is today's universal reading.{" "}
                    <span style={{ color: "#c4a8ff", fontWeight: 700 }}>
                      Add your birth date in your profile
                    </span>{" "}
                    to unlock your personal cosmic reading.
                  </p>
                </div>
              )}

              <p style={{ fontSize: "9px", color: "rgba(200,180,255,0.25)", marginTop: "8px", textAlign: "center" }}>
                {today}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export function HomeScreen({
  isMember,
  onOpenMuse,
  onOpenNotifications,
  onNavigate,
  onJoin,
  onGoToAssembly,
  currentProfile,
}: {
  isMember?: boolean;
  onOpenMuse?: () => void;
  onOpenNotifications?: () => void;
  onNavigate?: (tab: MainTab) => void;
  onJoin?: () => void;
  onGoToAssembly?: () => void;
  currentProfile?: Record<string, any> | null;
}) {
  const nav  = onNavigate ?? (() => {});
  const join = onJoin     ?? (() => {});

  const [showPodcastList, setShowPodcastList]   = useState(false);
  const [playingEpisode, setPlayingEpisode]     = useState<PodcastEpisode | null>(null);
  const [readingExpanded, setReadingExpanded]   = useState(false);

  const { dailyReading, hasPersonalChart } = useMemo(() => {
    let sign: ReturnType<typeof getSunSign> | null = null;

    // Try profile sun_sign first
    if (currentProfile?.sun_sign) {
      sign = ZODIAC.find((z) => z.id === currentProfile.sun_sign) ?? null;
    }
    // Derive from raw birth date
    if (!sign && currentProfile?.birth_date) {
      const parsed = parseBirthDate(currentProfile.birth_date);
      if (parsed) sign = getSunSign(parsed.month, parsed.day);
    }

    const hasPersonalChart = !!sign;

    // Fallback: pick a sign seeded by today's date so the card always shows
    if (!sign) {
      const seed = parseInt(new Date().toISOString().split("T")[0].replace(/-/g, ""), 10);
      sign = ZODIAC[Math.abs(Math.sin(seed * 9301) * 233280) % 12 | 0];
    }

    return { dailyReading: getDailyReading(sign), hasPersonalChart };
  }, [currentProfile]);

  return (
    <div className="flex flex-col pb-6 relative">
      {/* Podcast overlays */}
      <AnimatePresence>
        {showPodcastList && !playingEpisode && (
          <PodcastListScreen
            onClose={() => setShowPodcastList(false)}
            onPlay={(ep) => { setPlayingEpisode(ep); setShowPodcastList(false); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {playingEpisode && (
          <PodcastPlayer
            episode={playingEpisode}
            onClose={() => setPlayingEpisode(null)}
          />
        )}
      </AnimatePresence>

      <WelcomeBlock onOpenMuse={onOpenMuse ?? (() => {})} onOpenNotifications={onOpenNotifications ?? (() => {})} onNavigateToProfile={() => nav("profile")} />

      <DailyCosmicCard reading={dailyReading} expanded={readingExpanded} onToggle={() => setReadingExpanded((v) => !v)} hasPersonalChart={hasPersonalChart} />

      <div className="h-4" />
      <UpcomingEventCard onNavigate={nav} />
      <UpcomingSessionCard onNavigate={onGoToAssembly ?? (() => nav("events"))} />
      <PodcastSection onViewAll={() => setShowPodcastList(true)} onPlay={(ep) => setPlayingEpisode(ep)} />
      <CommunityWins onNavigate={nav} />
      <SuggestedConnections />
      <VaultPreview isMember={isMember} onNavigate={nav} onJoin={join} />
    </div>
  );
}
