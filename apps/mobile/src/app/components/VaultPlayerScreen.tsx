import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Star, Bookmark, Share2, Download, CheckCircle, Circle, Clock, Users, ChevronDown } from "lucide-react";

// ─── Types (mirrors ClubScreen) ───────────────────────────────────────────────

export interface VaultItem {
  id: number;
  title: string;
  instructor: string;
  instructorAvatar: string;
  category: string;
  type: "Masterclass" | "Guide" | "Template" | "Workshop" | "Playbook";
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  locked: boolean;
  featured?: boolean;
  tagline?: string;
}

// ─── Per-item content generation ─────────────────────────────────────────────

interface Chapter {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
}

interface Resource {
  id: number;
  label: string;
  type: "PDF" | "Template" | "Worksheet" | "Checklist";
  size: string;
}

const categoryDescriptions: Record<string, string> = {
  brand:         "Your brand is the single most powerful asset in your business — and most founders get it wrong. In this session, we strip back the noise and show you exactly how to build a brand that commands attention, builds trust, and outlasts every trend that comes and goes.",
  marketing:     "Marketing doesn't have to feel like shouting into a void. In this session, you'll discover the frameworks that help you reach the right people with the right message at exactly the right time — and build an audience that actually converts.",
  podcasting:    "Podcasting remains one of the most powerful channels for building authority and genuine connection with your audience. This session walks you through everything — from equipment to launch strategy to growing an engaged listener base.",
  ai:            "AI is not replacing founders — it's amplifying the great ones. In this session, you'll discover the exact tools and workflows that top founders are using right now to move faster, think clearer, and do more with less.",
  sales:         "Sales is just helping people make decisions that are right for them. In this session, you'll learn how to sell with confidence and integrity — closing more deals without ever feeling pushy, scripted, or out of alignment.",
  mindset:       "Your mindset is the operating system everything else runs on. This session gives you the frameworks to silence imposter syndrome, build unshakeable self-belief, and show up as the founder your business needs you to be.",
  leadership:    "Leadership isn't a title — it's a practice. In this session, you'll explore what it means to lead with clarity and conviction, build a culture people want to belong to, and make the hard calls that define great companies.",
  personalbrand: "In a crowded market, your personal brand is your most differentiated asset. This session shows you how to own your story, build genuine authority, and become the go-to name in your niche.",
};

const chapterSets: Record<string, Chapter[]> = {
  brand: [
    { id: 1, title: "Why Most Brands Fail", duration: "8:42", completed: true },
    { id: 2, title: "The Brand Positioning Framework", duration: "12:18", completed: true },
    { id: 3, title: "Defining Your Brand Voice", duration: "10:55", completed: false },
    { id: 4, title: "Visual Identity That Sticks", duration: "14:22", completed: false },
    { id: 5, title: "Building Brand Consistency", duration: "9:37", completed: false },
    { id: 6, title: "Measuring Brand Equity", duration: "7:11", completed: false },
  ],
  marketing: [
    { id: 1, title: "The Attention Economy", duration: "7:30", completed: true },
    { id: 2, title: "Community-Led Growth Principles", duration: "13:44", completed: true },
    { id: 3, title: "Content That Compounds", duration: "11:20", completed: false },
    { id: 4, title: "Email as a Relationship Engine", duration: "9:55", completed: false },
    { id: 5, title: "Paid vs. Organic — Finding Your Mix", duration: "12:08", completed: false },
    { id: 6, title: "Your 90-Day Marketing Plan", duration: "8:44", completed: false },
  ],
  podcasting: [
    { id: 1, title: "Choosing Your Format & Niche", duration: "9:12", completed: true },
    { id: 2, title: "Equipment on Any Budget", duration: "8:40", completed: true },
    { id: 3, title: "Recording & Editing Workflow", duration: "15:28", completed: false },
    { id: 4, title: "Your First 10 Episodes", duration: "11:03", completed: false },
    { id: 5, title: "Getting Found: SEO & Directories", duration: "10:17", completed: false },
    { id: 6, title: "Monetisation Roadmap", duration: "13:52", completed: false },
    { id: 7, title: "Interviewing Like a Pro", duration: "9:34", completed: false },
  ],
  ai: [
    { id: 1, title: "The Founder's AI Stack in 2026", duration: "10:22", completed: true },
    { id: 2, title: "Automating Your Content Engine", duration: "14:37", completed: true },
    { id: 3, title: "AI for Customer Research", duration: "11:04", completed: false },
    { id: 4, title: "Building Workflows Without Code", duration: "16:41", completed: false },
    { id: 5, title: "AI-Powered Sales & Outreach", duration: "12:18", completed: false },
    { id: 6, title: "Ethical AI for Founders", duration: "7:55", completed: false },
  ],
  sales: [
    { id: 1, title: "Reframing Sales as Service", duration: "8:14", completed: true },
    { id: 2, title: "Qualifying Leads with Precision", duration: "11:39", completed: true },
    { id: 3, title: "The Consultative Conversation", duration: "13:52", completed: false },
    { id: 4, title: "Handling Objections Gracefully", duration: "10:28", completed: false },
    { id: 5, title: "Closing Without Pressure", duration: "9:45", completed: false },
    { id: 6, title: "Building a Repeatable Sales System", duration: "12:03", completed: false },
  ],
  mindset: [
    { id: 1, title: "The Identity Shift", duration: "11:02", completed: true },
    { id: 2, title: "Dismantling Imposter Syndrome", duration: "13:28", completed: true },
    { id: 3, title: "Fear vs. Intuition", duration: "9:41", completed: false },
    { id: 4, title: "High Performance Without Burnout", duration: "14:17", completed: false },
    { id: 5, title: "The Manifestation Framework", duration: "10:54", completed: false },
    { id: 6, title: "Morning Architecture for Founders", duration: "8:33", completed: false },
  ],
  leadership: [
    { id: 1, title: "What Leadership Actually Means", duration: "9:50", completed: true },
    { id: 2, title: "Your Leadership Philosophy", duration: "12:14", completed: true },
    { id: 3, title: "Communicating Vision", duration: "11:38", completed: false },
    { id: 4, title: "Building a Culture by Design", duration: "15:02", completed: false },
    { id: 5, title: "The Art of Delegation", duration: "10:27", completed: false },
    { id: 6, title: "Leading Through Uncertainty", duration: "13:15", completed: false },
  ],
  personalbrand: [
    { id: 1, title: "Why Personal Branding Matters Now", duration: "8:44", completed: true },
    { id: 2, title: "Owning Your Story", duration: "12:31", completed: true },
    { id: 3, title: "Your Content Pillars", duration: "10:18", completed: false },
    { id: 4, title: "Building in Public", duration: "11:55", completed: false },
    { id: 5, title: "LinkedIn Growth System", duration: "14:02", completed: false },
    { id: 6, title: "Speaking Opportunities & PR", duration: "9:30", completed: false },
    { id: 7, title: "Monetising Your Personal Brand", duration: "12:47", completed: false },
  ],
};

const resourceSets: Record<string, Resource[]> = {
  brand:         [{ id:1, label: "Brand Positioning Worksheet", type:"Worksheet", size:"1.2 MB" }, { id:2, label: "Brand Voice Guide Template", type:"Template", size:"840 KB" }, { id:3, label: "Competitor Analysis Framework", type:"PDF", size:"620 KB" }],
  marketing:     [{ id:1, label: "90-Day Marketing Planner", type:"Template", size:"1.4 MB" }, { id:2, label: "Content Calendar (Q1-Q4)", type:"Worksheet", size:"980 KB" }, { id:3, label: "Email Sequence Blueprint", type:"PDF", size:"540 KB" }],
  podcasting:    [{ id:1, label: "Episode Launch Checklist", type:"Checklist", size:"320 KB" }, { id:2, label: "Guest Outreach Template", type:"Template", size:"240 KB" }, { id:3, label: "Podcast Monetisation Roadmap", type:"PDF", size:"780 KB" }],
  ai:            [{ id:1, label: "AI Tools Stack 2026 Guide", type:"PDF", size:"1.1 MB" }, { id:2, label: "Prompt Library for Founders", type:"Template", size:"920 KB" }, { id:3, label: "Automation Workflow Diagrams", type:"Worksheet", size:"1.3 MB" }],
  sales:         [{ id:1, label: "Discovery Call Script", type:"Template", size:"480 KB" }, { id:2, label: "Objection Handling Playbook", type:"PDF", size:"860 KB" }, { id:3, label: "Sales Pipeline Tracker", type:"Worksheet", size:"1.0 MB" }],
  mindset:       [{ id:1, label: "Morning Architecture Planner", type:"Worksheet", size:"560 KB" }, { id:2, label: "Journalling Prompts for Founders", type:"PDF", size:"340 KB" }, { id:3, label: "90-Day Manifestation Framework", type:"Template", size:"720 KB" }],
  leadership:    [{ id:1, label: "Leadership Philosophy Worksheet", type:"Worksheet", size:"640 KB" }, { id:2, label: "Team Delegation Framework", type:"Template", size:"880 KB" }, { id:3, label: "Culture Design Playbook", type:"PDF", size:"1.2 MB" }],
  personalbrand: [{ id:1, label: "Personal Brand Positioning Map", type:"Worksheet", size:"740 KB" }, { id:2, label: "Content Pillar Planner", type:"Template", size:"860 KB" }, { id:3, label: "LinkedIn 30-Day Growth Plan", type:"Checklist", size:"440 KB" }],
};

const resourceTypeStyle: Record<string, { bg: string; color: string }> = {
  PDF:       { bg: "rgba(232,54,92,0.12)",  color: "#e8365c" },
  Template:  { bg: "rgba(123,78,200,0.12)", color: "#7b4ec8" },
  Worksheet: { bg: "rgba(240,120,50,0.12)", color: "#f07832" },
  Checklist: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
};

const typeStyle: Record<string, { bg: string; color: string }> = {
  Masterclass: { bg: "rgba(255,95,109,0.9)",  color: "#fff" },
  Workshop:    { bg: "rgba(255,140,66,0.9)",  color: "#fff" },
  Guide:       { bg: "rgba(124,77,255,0.9)",  color: "#fff" },
  Template:    { bg: "rgba(0,180,216,0.9)",   color: "#fff" },
  Playbook:    { bg: "rgba(255,209,102,0.95)", color: "#1a1118" },
};

// ─── Simulated progress ───────────────────────────────────────────────────────

function getProgress(item: VaultItem): number {
  // Two completed chapters out of total
  const chapters = chapterSets[item.category] ?? [];
  const done = chapters.filter((c) => c.completed).length;
  return chapters.length ? done / chapters.length : 0;
}

// ─── Video Player ─────────────────────────────────────────────────────────────

function VideoPlayer({ item }: { item: VaultItem }) {
  const [playing, setPlaying] = useState(false);
  const progress = getProgress(item);
  const completedChapters = (chapterSets[item.category] ?? []).filter((c) => c.completed).length;
  const totalChapters = (chapterSets[item.category] ?? []).length;

  // Derive a time display from progress and total duration
  const totalMins = parseInt(item.duration) || 60;
  const elapsed = Math.round(progress * totalMins);

  return (
    <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover"
        style={{ opacity: playing ? 0.85 : 1 }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{
        background: playing
          ? "rgba(0,0,0,0.3)"
          : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
      }} />

      {/* Centre play/pause */}
      <button
        onClick={() => setPlaying((p) => !p)}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          {playing
            ? <Pause size={26} className="text-white" />
            : <Play  size={26} className="text-white" style={{ marginLeft: 3 }} />
          }
        </motion.div>
      </button>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
        {/* Progress bar */}
        <div className="mb-2 relative h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.round(progress * 100)}%`, background: "var(--brand-gradient)", transition: "width 0.3s" }}
          />
        </div>
        {/* Time + chapter info */}
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-xs" style={{ fontWeight: 500 }}>
            Chapter {completedChapters} of {totalChapters}
          </span>
          <span className="text-white/70 text-xs" style={{ fontWeight: 500 }}>
            {elapsed}m / {item.duration}
          </span>
        </div>
      </div>

      {/* Skip controls */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-6 pointer-events-none">
        <SkipBack size={20} className="text-white/50" />
        <div className="w-16" />
        <SkipForward size={20} className="text-white/50" />
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ item }: { item: VaultItem }) {
  const desc = categoryDescriptions[item.category] ?? "A premium resource from The Inspired Club Vault, designed to help you move faster and build smarter.";

  const learns = [
    "How to implement this framework in your business immediately",
    "The most common mistakes founders make — and how to avoid them",
    "Step-by-step systems you can start using today",
    "Real examples and case studies from successful founders",
    "A clear action plan for the next 30 days",
  ];

  return (
    <div className="px-5 py-5">
      <h3 className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 800 }}>About this {item.type}</h3>
      <p className="text-muted-foreground text-sm mb-6" style={{ lineHeight: 1.75 }}>{desc}</p>

      <h3 className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 800 }}>What you'll learn</h3>
      <div className="flex flex-col gap-2.5">
        {learns.map((l, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
            <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chapters Tab ─────────────────────────────────────────────────────────────

function ChaptersTab({ item }: { item: VaultItem }) {
  const [completed, setCompleted] = useState<Record<number, boolean>>(
    () => Object.fromEntries((chapterSets[item.category] ?? []).map((c) => [c.id, c.completed]))
  );

  const chapters = chapterSets[item.category] ?? [];

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 800 }}>
          {chapters.length} Chapters
        </h3>
        <span className="text-muted-foreground text-xs">
          {Object.values(completed).filter(Boolean).length}/{chapters.length} done
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {chapters.map((ch, i) => {
          const done = !!completed[ch.id];
          const isCurrent = !done && (chapters[i - 1] ? !!completed[chapters[i - 1].id] : true);
          return (
            <button
              key={ch.id}
              onClick={() => setCompleted((p) => ({ ...p, [ch.id]: !p[ch.id] }))}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all"
              style={{
                background: isCurrent ? "var(--brand-gradient-soft)" : "var(--muted)",
                border: isCurrent ? "1px solid var(--primary)" : "1px solid transparent",
              }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {done ? (
                  <CheckCircle size={20} style={{ color: "var(--primary)" }} />
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--brand-gradient)" }}>
                    <Play size={9} className="text-white" style={{ marginLeft: 1 }} />
                  </div>
                ) : (
                  <Circle size={20} className="text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm" style={{ fontWeight: done ? 500 : 700, lineHeight: 1.3,
                  textDecoration: done ? "line-through" : "none", opacity: done ? 0.55 : 1 }}>
                  {ch.title}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock size={11} className="text-muted-foreground" />
                <span className="text-muted-foreground text-xs">{ch.duration}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Resources Tab ────────────────────────────────────────────────────────────

function ResourcesTab({ item }: { item: VaultItem }) {
  const resources = resourceSets[item.category] ?? [];

  return (
    <div className="px-5 py-5">
      <h3 className="text-foreground mb-4" style={{ fontSize: "15px", fontWeight: 800 }}>
        Included Resources
      </h3>
      <div className="flex flex-col gap-3">
        {resources.map((r) => {
          const ts = resourceTypeStyle[r.type] ?? { bg: "var(--muted)", color: "var(--muted-foreground)" };
          return (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-border bg-card"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: ts.bg }}
              >
                <Download size={16} style={{ color: ts.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm" style={{ fontWeight: 700, lineHeight: 1.3 }}>{r.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ts.bg, color: ts.color, fontWeight: 600, fontSize: "10px" }}>
                    {r.type}
                  </span>
                  <span className="text-muted-foreground text-xs">{r.size}</span>
                </div>
              </div>
              <button
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs"
                style={{ background: "var(--brand-gradient)", color: "#fff", fontWeight: 700 }}
              >
                Get
              </button>
            </div>
          );
        })}
      </div>

      <div
        className="mt-5 rounded-2xl p-4"
        style={{ background: "var(--brand-gradient-soft)", border: "1px dashed var(--primary)" }}
      >
        <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>All resources included with membership</p>
        <p className="text-muted-foreground text-xs mt-1" style={{ lineHeight: 1.6 }}>
          Download everything you need directly to your device. Yours to keep forever.
        </p>
      </div>
    </div>
  );
}

// ─── VaultPlayerScreen ────────────────────────────────────────────────────────

interface Props {
  item: VaultItem;
  onClose: () => void;
}

export function VaultPlayerScreen({ item, onClose }: Props) {
  const [tab, setTab]           = useState<"overview" | "chapters" | "resources">("overview");
  const [saved, setSaved]       = useState(false);
  const ts = typeStyle[item.type] ?? { bg: "rgba(0,0,0,0.6)", color: "#fff" };
  const progress = getProgress(item);

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-background flex flex-col"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 300 }}
    >
      {/* ── Back button over player ── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-12 pointer-events-none">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={17} className="text-white" />
        </button>
        <button
          onClick={() => setSaved((s) => !s)}
          className="w-9 h-9 rounded-full flex items-center justify-center pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
        >
          <Bookmark
            size={16}
            className={saved ? "" : "text-white"}
            fill={saved ? "var(--primary)" : "none"}
            style={{ color: saved ? "var(--primary)" : "white" }}
          />
        </button>
      </div>

      {/* ── Video Player ── */}
      <div className="flex-shrink-0">
        <VideoPlayer item={item} />
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

        {/* Title block */}
        <div className="px-5 pt-4 pb-0">
          {/* Type + duration */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full"
              style={{ background: ts.bg, color: ts.color, fontWeight: 700, fontSize: "11px" }}>
              {item.type}
            </span>
            <span className="text-muted-foreground text-xs">{item.duration}</span>
            {progress > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", fontWeight: 700, fontSize: "10px" }}>
                {Math.round(progress * 100)}% done
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-foreground mb-3" style={{ fontSize: "20px", fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
            {item.title}
          </h1>

          {/* Instructor row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <img src={item.instructorAvatar} alt={item.instructor}
                className="w-9 h-9 rounded-full object-cover"
                style={{ boxShadow: "0 0 0 2px var(--primary)" }} />
              <div>
                <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{item.instructor}</p>
                <div className="flex items-center gap-1.5">
                  <Star size={10} fill="#ffd166" stroke="none" />
                  <span style={{ color: "#ffd166", fontWeight: 700, fontSize: "11px" }}>{item.rating}</span>
                  <span className="text-muted-foreground text-xs">({item.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded-xl text-xs"
              style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 700 }}
            >
              Follow
            </button>
          </div>

          {/* Action row */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSaved((s) => !s)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs transition-all"
              style={{
                background: saved ? "var(--secondary)" : "var(--muted)",
                color: saved ? "var(--primary)" : "var(--muted-foreground)",
                fontWeight: 600,
              }}
            >
              <Bookmark size={13} fill={saved ? "var(--primary)" : "none"}
                style={{ color: saved ? "var(--primary)" : "var(--muted-foreground)" }} />
              {saved ? "Saved" : "Save"}
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 600 }}
            >
              <Share2 size={13} />
              Share
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 600 }}
            >
              <Download size={13} />
              Resources
            </button>
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Your progress</span>
                <span className="text-xs" style={{ color: "var(--primary)", fontWeight: 700 }}>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round(progress * 100)}%`, background: "var(--brand-gradient)" }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="px-5 flex gap-1 mb-1 border-b border-border">
          {(["overview", "chapters", "resources"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-xs transition-all capitalize"
              style={{
                fontWeight: tab === t ? 700 : 500,
                color: tab === t ? "var(--primary)" : "var(--muted-foreground)",
                borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "overview"   && <OverviewTab  item={item} />}
            {tab === "chapters"   && <ChaptersTab  item={item} />}
            {tab === "resources"  && <ResourcesTab item={item} />}
          </motion.div>
        </AnimatePresence>

        {/* Related / next up */}
        <div className="px-5 pb-8 pt-2">
          <div className="h-px bg-border mb-5" />
          <div
            className="flex items-center justify-between rounded-2xl p-4"
            style={{ background: "var(--muted)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--brand-gradient)" }}>
                <ChevronDown size={16} className="text-white" style={{ transform: "rotate(-90deg)" }} />
              </div>
              <div>
                <p className="text-foreground text-xs" style={{ fontWeight: 700 }}>Up next</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {(chapterSets[item.category] ?? []).find((c) => !c.completed)?.title ?? "All chapters complete!"}
                </p>
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded-xl text-xs text-white"
              style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
