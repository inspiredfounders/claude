import { Mic, Users, ChevronRight, Radio, Clock, Globe, Check, Lock, ExternalLink } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Assembly session data (monthly) ─────────────────────────────────────────

const assemblySession = {
  title: "Monthly Club Assembly",
  date: "Thursday, 19 June 2026",
  dateShort: "Thu, Jun 19",
  time: "3:00 PM AEST",
  host: "Priscilla Ava",
  hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  liveIn: "2 days",
  attending: 142,
  capacity: 300,
  description: "Once a month, every Club member gathers online. Priscilla leads the session with a deep-dive topic, followed by an open Q&A. This is your space to ask, connect, and leave with real clarity.",
  perks: [
    "Priscilla-led topic deep-dive each month",
    "Live Q&A open to all Club members",
    "Replay added to The Vault within 48hrs",
    "Connect with the full Club community",
  ],
};

// ─── Live rooms ───────────────────────────────────────────────────────────────

const liveRooms = [
  {
    id: 1,
    title: "Building a Brand That Actually Stands Out",
    host: "Marcus Webb",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    listeners: 64,
    speakers: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format",
    ],
    tags: ["Branding", "Q&A"],
    zoomUrl: "https://zoom.us/j/placeholder",
  },
  {
    id: 2,
    title: "Office Hours with Jade Morales",
    host: "Jade Morales",
    hostAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    listeners: 38,
    speakers: [
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format",
    ],
    tags: ["Wellness", "Q&A"],
    zoomUrl: "https://zoom.us/j/placeholder",
  },
];

const upcomingRooms = [
  {
    id: 1,
    title: "Monthly Club Assembly — June Edition",
    host: "Priscilla Ava",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    date: "Thu, Jun 19",
    time: "3:00 PM AEST",
    attendees: 211,
    type: "Fireside Chat",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=160&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "Deal Review: Is Your Cap Table Investor-Ready?",
    host: "Marcus Webb",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    date: "Mon, Jun 23",
    time: "12:00 PM AEST",
    attendees: 94,
    type: "Workshop",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=160&fit=crop&auto=format",
  },
  {
    id: 3,
    title: "AI Tools Live Demo: Build Faster in 2026",
    host: "Devon Achebe",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    date: "Wed, Jun 25",
    time: "2:00 PM AEST",
    attendees: 158,
    type: "Live Demo",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&h=160&fit=crop&auto=format",
  },
];

const typeColor: Record<string, string> = {
  "Fireside Chat": "var(--primary)",
  "Workshop":      "#f07832",
  "Live Demo":     "#7b4ec8",
};

// ─── Assembly Sign-up Card ────────────────────────────────────────────────────

function AssemblySignup() {
  const [locked, setLocked] = useState(false);
  const pct = Math.round((assemblySession.attending / assemblySession.capacity) * 100);

  if (locked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="mx-5 mb-5 rounded-3xl overflow-hidden"
        style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%)" }} />

        <div className="relative p-5 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 16, stiffness: 280 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
          >
            <Check size={28} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <p className="text-white mb-0.5" style={{ fontSize: "17px", fontWeight: 800 }}>You're locked in! 🎉</p>
          <p className="text-white/70 text-sm mb-4" style={{ lineHeight: 1.5 }}>
            {assemblySession.dateShort} · {assemblySession.time}
          </p>
          <div className="w-full rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <p className="text-white text-xs" style={{ fontWeight: 700, lineHeight: 1.5 }}>
              "{assemblySession.title}"
            </p>
            <p className="text-white/60 text-xs mt-1">Hosted by {assemblySession.host}</p>
          </div>
          <p className="text-white/50 text-xs mt-3">A calendar invite is on its way to your email.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-5 mb-5 rounded-3xl overflow-hidden border border-border"
      style={{ background: "var(--card)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>

      {/* Top gradient banner */}
      <div className="relative px-5 pt-5 pb-4"
        style={{ background: "linear-gradient(135deg, #0a0710 0%, #1a0d1f 100%)" }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(232,54,92,0.2) 0%, rgba(123,78,200,0.1) 55%, transparent 80%)" }} />

        <div className="relative">
          {/* Live countdown badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live in {assemblySession.liveIn}
            </span>
            <span className="text-white/40 text-xs">{assemblySession.dateShort} · {assemblySession.time}</span>
          </div>

          <h3 className="text-white mb-1" style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.25 }}>
            {assemblySession.title}
          </h3>

          {/* Host */}
          <div className="flex items-center gap-2 mb-4">
            <img src={assemblySession.hostAvatar} alt={assemblySession.host}
              className="w-6 h-6 rounded-full object-cover border-2"
              style={{ borderColor: "var(--primary)" }} />
            <span className="text-white/60 text-xs">Hosted by <span className="text-white font-bold">{assemblySession.host}</span></span>
          </div>

          {/* Attending count + bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">{assemblySession.attending} members registered</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>{assemblySession.capacity - assemblySession.attending} spots left</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--brand-gradient)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-5">
        <p className="text-muted-foreground text-sm mb-4" style={{ lineHeight: 1.7 }}>
          {assemblySession.description}
        </p>

        {/* Perks */}
        <div className="flex flex-col gap-2 mb-5">
          {assemblySession.perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--brand-gradient)" }}>
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-foreground text-xs" style={{ fontWeight: 600 }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* Speakers strip */}
        <div className="flex items-center gap-3 mb-5 rounded-2xl p-3"
          style={{ background: "var(--muted)" }}>
          <div className="flex -space-x-2">
            {[assemblySession.hostAvatar,
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format",
              "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&auto=format",
            ].map((src, i) => (
              <img key={i} src={src} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-muted" />
            ))}
          </div>
          <p className="text-muted-foreground text-xs flex-1" style={{ lineHeight: 1.5 }}>
            <span className="text-foreground font-bold">{assemblySession.attending} founders</span> have locked in their space
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => setLocked(true)}
          className="w-full py-4 rounded-2xl text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}
        >
          <Lock size={15} /> Lock In My Space
        </button>
        <p className="text-center text-muted-foreground text-xs mt-2">Free for Club members · Online · {assemblySession.time}</p>
      </div>
    </div>
  );
}

// ─── AssemblyScreen ───────────────────────────────────────────────────────────

export function AssemblyScreen({ onViewAllSessions }: { onViewAllSessions?: () => void }) {
  const [rsvpd, setRsvpd] = useState<Record<number, boolean>>({});

  return (
    <div className="flex flex-col pb-6">

      {/* Monthly Assembly sign-up */}
      <div className="px-0 pt-5">
        <div className="px-5 mb-3 flex items-center justify-between">
          <div>
            <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 800 }}>Monthly Assembly</p>
            <p className="text-muted-foreground text-xs mt-0.5">Exclusive to Club members</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live soon
          </span>
        </div>
        <AssemblySignup />
      </div>

      {/* Live Rooms */}
      <div className="px-5 pt-2 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-foreground text-sm" style={{ fontWeight: 800 }}>Live Now</span>
          <span className="text-muted-foreground text-xs">· {liveRooms.length} rooms active</span>
        </div>

        <div className="flex flex-col gap-3">
          {liveRooms.map((room) => (
            <div
              key={room.id}
              className="bg-card rounded-2xl p-4 border border-border"
              style={{ borderLeft: "3px solid var(--primary)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-3">
                  <p className="text-foreground text-sm" style={{ fontWeight: 700, lineHeight: 1.4 }}>{room.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <img src={room.hostAvatar} alt={room.host} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-muted-foreground text-xs">Hosted by {room.host}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}>
                  <Radio size={10} /> Live
                </span>
              </div>

              {/* Speakers */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {room.speakers.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-card object-cover" />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mic size={11} /> {room.speakers.length} speakers
                  <span className="mx-1">·</span>
                  <Users size={11} /> {room.listeners} listening
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-3">
                {room.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={room.zoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                style={{ background: "var(--brand-gradient)", fontWeight: 700, display: "flex" }}
              >
                Join Room <ExternalLink size={13} className="opacity-70" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming sessions */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 800 }}>Upcoming Sessions</p>
          <button onClick={onViewAllSessions} className="flex items-center gap-1 text-sm" style={{ color: "var(--primary)", fontWeight: 600 }}>
            View all <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {upcomingRooms.map((ev) => (
            <div key={ev.id} className="bg-card rounded-2xl overflow-hidden border border-border flex"
              style={{ boxShadow: "var(--shadow-sm)" }}>
              <img src={ev.image} alt={ev.title} className="w-20 object-cover flex-shrink-0" style={{ minHeight: "100px" }} />
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${typeColor[ev.type] || "var(--primary)"}22`, color: typeColor[ev.type] || "var(--primary)", fontWeight: 700 }}>
                    {ev.type}
                  </span>
                  <p className="text-foreground text-sm mt-1.5" style={{ fontWeight: 700, lineHeight: 1.3 }}>{ev.title}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock size={10} /> {ev.date} · {ev.time}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users size={10} /> {ev.attendees} attending
                  </div>
                </div>
                <button
                  onClick={() => setRsvpd((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))}
                  className="mt-2 px-3 py-1.5 rounded-xl text-xs self-start transition-all"
                  style={{
                    background: rsvpd[ev.id] ? "var(--secondary)" : "var(--brand-gradient)",
                    color: rsvpd[ev.id] ? "var(--primary)" : "#fff",
                    fontWeight: 700,
                  }}
                >
                  {rsvpd[ev.id] ? "✓ RSVP'd" : "RSVP"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timezone note */}
      <div className="mx-5 mt-5 flex items-center gap-2 bg-muted rounded-2xl px-4 py-3">
        <Globe size={14} className="text-muted-foreground flex-shrink-0" />
        <p className="text-muted-foreground text-xs">All times shown in AEST. Members across 40+ countries attend each session.</p>
      </div>
    </div>
  );
}
