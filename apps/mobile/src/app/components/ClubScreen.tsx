import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Search, Play, Lock, Star, ChevronRight, X } from "lucide-react";
import { VaultPlayerScreen } from "./VaultPlayerScreen";
import type { VaultItem as PlayerVaultItem } from "./VaultPlayerScreen";

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  { id: "all",           label: "All",           emoji: "✦"  },
  { id: "brand",         label: "Brand",         emoji: "🎯" },
  { id: "marketing",     label: "Marketing",      emoji: "📈" },
  { id: "podcasting",    label: "Podcasting",     emoji: "🎙" },
  { id: "ai",            label: "AI",             emoji: "🤖" },
  { id: "sales",         label: "Sales",          emoji: "💰" },
  { id: "mindset",       label: "Mindset",        emoji: "🧠" },
  { id: "leadership",    label: "Leadership",     emoji: "👑" },
  { id: "personalbrand", label: "Personal Brand", emoji: "✨" },
];

interface VaultItem {
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

const featured: VaultItem = {
  id: 0,
  title: "Build a Brand That Outlasts Trends",
  instructor: "Priscilla Ava",
  instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  category: "brand",
  type: "Masterclass",
  duration: "1h 24m",
  rating: 4.9,
  reviews: 312,
  image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&h=400&fit=crop&auto=format",
  locked: false,
  featured: true,
  tagline: "The definitive guide to building a brand that commands attention and loyalty.",
};

const vaultContent: VaultItem[] = [
  // Brand
  {
    id: 1, title: "Your Brand Voice in 60 Minutes", instructor: "Priscilla Ava",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    category: "brand", type: "Workshop", duration: "58m", rating: 4.8, reviews: 198,
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 2, title: "Visual Identity from Scratch", instructor: "Jade Morales",
    instructorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    category: "brand", type: "Guide", duration: "28m read", rating: 4.7, reviews: 144,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=240&fit=crop&auto=format", locked: true,
  },
  {
    id: 3, title: "Brand Positioning Playbook", instructor: "Inspired Club",
    instructorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    category: "brand", type: "Playbook", duration: "Download", rating: 4.9, reviews: 267,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=240&fit=crop&auto=format", locked: true,
  },

  // Marketing
  {
    id: 4, title: "Community-Led Growth: 0 → 10k", instructor: "Priscilla Ava",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    category: "marketing", type: "Masterclass", duration: "1h 12m", rating: 4.9, reviews: 421,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 5, title: "Email Marketing That Converts", instructor: "Amara Osei",
    instructorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    category: "marketing", type: "Workshop", duration: "44m", rating: 4.6, reviews: 88,
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=240&fit=crop&auto=format", locked: true,
  },
  {
    id: 6, title: "Viral Content Formula", instructor: "Jade Morales",
    instructorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    category: "marketing", type: "Guide", duration: "19m read", rating: 4.7, reviews: 156,
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=240&fit=crop&auto=format", locked: true,
  },

  // Podcasting
  {
    id: 7, title: "Launch Your Podcast in 7 Days", instructor: "Morgan Blake",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format",
    category: "podcasting", type: "Masterclass", duration: "2h 5m", rating: 4.8, reviews: 203,
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 8, title: "Monetise Your Podcast at 1k Listeners", instructor: "Marcus Webb",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    category: "podcasting", type: "Guide", duration: "31m read", rating: 4.6, reviews: 77,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=240&fit=crop&auto=format", locked: true,
  },
  {
    id: 9, title: "Podcast Sponsorship Pitch Template", instructor: "Inspired Club",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    category: "podcasting", type: "Template", duration: "Download", rating: 4.7, reviews: 129,
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=240&fit=crop&auto=format", locked: true,
  },

  // AI
  {
    id: 10, title: "AI Tools Every Founder Needs in 2026", instructor: "Devon Achebe",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    category: "ai", type: "Masterclass", duration: "1h 38m", rating: 4.9, reviews: 544,
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 11, title: "Build Your First AI Workflow", instructor: "Devon Achebe",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    category: "ai", type: "Workshop", duration: "52m", rating: 4.8, reviews: 211,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=240&fit=crop&auto=format", locked: true,
  },
  {
    id: 12, title: "AI Content Engine: 10x Your Output", instructor: "Jade Morales",
    instructorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    category: "ai", type: "Playbook", duration: "Download", rating: 4.7, reviews: 188,
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=400&h=240&fit=crop&auto=format", locked: true,
  },

  // Sales
  {
    id: 13, title: "Close Without Being Salesy", instructor: "Marcus Webb",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    category: "sales", type: "Masterclass", duration: "1h 17m", rating: 4.9, reviews: 378,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 14, title: "Proposal Template That Closes", instructor: "Inspired Club",
    instructorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    category: "sales", type: "Template", duration: "Download", rating: 4.8, reviews: 299,
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=240&fit=crop&auto=format", locked: true,
  },
  {
    id: 15, title: "First 100 Customers Playbook", instructor: "Amara Osei",
    instructorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    category: "sales", type: "Playbook", duration: "Download", rating: 4.7, reviews: 141,
    image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=400&h=240&fit=crop&auto=format", locked: true,
  },

  // Mindset
  {
    id: 16, title: "The High-Performance Founder", instructor: "Jade Morales",
    instructorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    category: "mindset", type: "Masterclass", duration: "1h 44m", rating: 5.0, reviews: 412,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 17, title: "Beat Founder Burnout Before It Starts", instructor: "Jade Morales",
    instructorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    category: "mindset", type: "Guide", duration: "22m read", rating: 4.9, reviews: 267,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=240&fit=crop&auto=format", locked: true,
  },

  // Leadership
  {
    id: 18, title: "Lead Without Losing Yourself", instructor: "Priscilla Ava",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    category: "leadership", type: "Masterclass", duration: "1h 55m", rating: 4.9, reviews: 334,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 19, title: "Hiring Your First 5 People", instructor: "Marcus Webb",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    category: "leadership", type: "Workshop", duration: "1h 2m", rating: 4.7, reviews: 178,
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=240&fit=crop&auto=format", locked: true,
  },

  // Personal Brand
  {
    id: 20, title: "Become the Go-To Name in Your Niche", instructor: "Priscilla Ava",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    category: "personalbrand", type: "Masterclass", duration: "1h 31m", rating: 4.9, reviews: 501,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=240&fit=crop&auto=format", locked: false,
  },
  {
    id: 21, title: "LinkedIn Growth System for Founders", instructor: "Amara Osei",
    instructorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    category: "personalbrand", type: "Playbook", duration: "Download", rating: 4.8, reviews: 223,
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=240&fit=crop&auto=format", locked: true,
  },
];

// ─── Type badge colours ────────────────────────────────────────────────────────
const typeStyle: Record<string, { bg: string; color: string }> = {
  Masterclass: { bg: "rgba(255,95,109,0.9)",  color: "#fff" },
  Workshop:    { bg: "rgba(255,140,66,0.9)",  color: "#fff" },
  Guide:       { bg: "rgba(124,77,255,0.9)",  color: "#fff" },
  Template:    { bg: "rgba(0,180,216,0.9)",   color: "#fff" },
  Playbook:    { bg: "rgba(255,209,102,0.95)", color: "#1a1118" },
};

// ─── Content Card ─────────────────────────────────────────────────────────────
function ContentCard({ item, wide, onSelect }: { item: VaultItem; wide?: boolean; onSelect?: () => void }) {
  const isLocked = item.locked;
  const ts = typeStyle[item.type] ?? { bg: "rgba(0,0,0,0.6)", color: "#fff" };
  const w = wide ? "w-56" : "w-44";

  return (
    <div
      onClick={!isLocked ? onSelect : undefined}
      className={`flex-shrink-0 ${w} rounded-2xl overflow-hidden bg-card border border-border ${!isLocked ? "cursor-pointer" : ""}`}
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>

      {/* Thumbnail */}
      <div className="relative" style={{ aspectRatio: "16/9" }}>
        <img
          src={item.image} alt={item.title}
          className="w-full h-full object-cover"
          style={{ filter: isLocked ? "brightness(0.45)" : "none" }}
        />

        {/* Gradient overlay always */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />

        {/* Type badge */}
        <span
          className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full"
          style={{ background: ts.bg, color: ts.color, fontWeight: 700, fontSize: "10px" }}
        >
          {item.type}
        </span>

        {/* Duration bottom-right */}
        <span className="absolute bottom-2 right-2 text-white/80 text-xs" style={{ fontWeight: 600, fontSize: "10px" }}>
          {item.duration}
        </span>

        {/* Play or Lock */}
        {isLocked ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Lock size={14} className="text-white" />
            </div>
          </div>
        ) : (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 12px rgba(255,95,109,0.5)" }}>
            <Play size={13} className="text-white" style={{ marginLeft: 1 }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-foreground text-xs mb-1.5" style={{ fontWeight: 700, lineHeight: 1.35 }}>
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 mb-1.5">
          <img src={item.instructorAvatar} alt={item.instructor}
            className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
          <span className="text-muted-foreground text-xs truncate">{item.instructor}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={9} fill="#ffd166" stroke="none" />
          <span className="text-xs" style={{ color: "#ffd166", fontWeight: 700, fontSize: "10px" }}>{item.rating}</span>
          <span className="text-muted-foreground text-xs" style={{ fontSize: "10px" }}>({item.reviews})</span>
        </div>
      </div>
    </div>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({ categoryId, emoji, label, onSelect, onSeeAll, allItems }: { categoryId: string; emoji: string; label: string; onSelect: (item: VaultItem) => void; onSeeAll: () => void; allItems: VaultItem[] }) {
  const items = allItems.filter((v) => v.category === categoryId);
  if (!items.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "18px" }}>{emoji}</span>
          <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 800 }}>{label}</h3>
        </div>
        <button onClick={onSeeAll} className="flex items-center gap-0.5 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>
          See all <ChevronRight size={13} />
        </button>
      </div>
      <div className="flex gap-3 px-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => <ContentCard key={item.id} item={item} onSelect={() => onSelect(item)} />)}
      </div>
    </div>
  );
}

// ─── Featured Hero ────────────────────────────────────────────────────────────
function FeaturedHero({ item, onSelect }: { item: VaultItem; onSelect: () => void }) {
  const ts = typeStyle[item.type] ?? { bg: "rgba(0,0,0,0.6)", color: "#fff" };

  return (
    <div className="px-5 mb-6">
      <div className="rounded-3xl overflow-hidden relative" style={{ boxShadow: "0 12px 40px rgba(255,95,109,0.22)" }}>
        <img src={item.image} alt={item.title} className="w-full h-52 object-cover" />
        {/* Dark gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,5,10,0.95) 0%, rgba(15,5,10,0.3) 60%, transparent 100%)" }} />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className="text-white text-xs px-2.5 py-1 rounded-full"
            style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
          >
            ⭐ Featured
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: ts.bg, color: ts.color, fontWeight: 700, fontSize: "11px" }}
          >
            {item.type}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-white mb-1" style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.25 }}>
            {item.title}
          </h2>
          <p className="text-white/60 text-xs mb-3" style={{ lineHeight: 1.5 }}>
            {item.tagline}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={item.instructorAvatar} alt={item.instructor}
                className="w-7 h-7 rounded-full object-cover border-2"
                style={{ borderColor: "var(--primary)" }} />
              <div>
                <p className="text-white text-xs" style={{ fontWeight: 700 }}>{item.instructor}</p>
                <div className="flex items-center gap-1">
                  <Star size={9} fill="#ffd166" stroke="none" />
                  <span style={{ color: "#ffd166", fontWeight: 700, fontSize: "10px" }}>{item.rating}</span>
                  <span className="text-white/40 text-xs" style={{ fontSize: "10px" }}>· {item.duration}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onSelect}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs"
              style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
            >
              <Play size={12} style={{ marginLeft: 1 }} /> Watch Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────
function SearchModal({ onClose, allItems }: { onClose: () => void; allItems: VaultItem[] }) {
  const [q, setQ] = useState("");
  const results = q.length > 1
    ? allItems.filter((v) =>
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.instructor.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-border">
        <div className="flex-1 flex items-center gap-3 bg-muted rounded-2xl px-4 py-2.5">
          <Search size={15} className="text-muted-foreground" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Search titles, instructors…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button onClick={onClose} className="text-muted-foreground">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>
        {q.length < 2 ? (
          <p className="text-muted-foreground text-sm text-center mt-12">Start typing to search the Vault</p>
        ) : results.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center mt-12">No results for "{q}"</p>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((item) => {
              const ts = typeStyle[item.type] ?? { bg: "#ccc", color: "#000" };
              return (
                <div key={item.id} className="flex gap-3 items-center bg-card rounded-2xl p-3 border border-border">
                  <div className="relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden">
                    <img src={item.image} alt="" className="w-full h-full object-cover"
                      style={{ filter: item.locked ? "brightness(0.5)" : "none" }} />
                    {item.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm" style={{ fontWeight: 700, lineHeight: 1.3 }}>{item.title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{item.instructor}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: ts.bg, color: ts.color, fontWeight: 700, fontSize: "10px" }}>
                      {item.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Main VaultScreen ─────────────────────────────────────────────────────────
export function ClubScreen() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searching, setSearching]           = useState(false);
  const [selectedItem, setSelectedItem]     = useState<VaultItem | null>(null);
  const [liveItems, setLiveItems]           = useState<VaultItem[] | null>(null);

  useEffect(() => {
    import("../../lib/api/vault").then(({ getVaultItems }) => {
      getVaultItems().then((rows) => {
        if (rows.length === 0) return;
        const mapped: VaultItem[] = rows.map((r, i) => ({
          id:               i + 1000,
          title:            r.title,
          instructor:       "Inspired Club",
          instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format",
          category:         r.category,
          type:             (r.type.charAt(0).toUpperCase() + r.type.slice(1)) as VaultItem["type"],
          duration:         r.duration ?? "—",
          rating:           4.9,
          reviews:          0,
          isSaved:          false,
          isNew:            r.is_new,
          isFeatured:       r.is_featured,
          thumbnail:        r.thumbnail_url ?? "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&auto=format",
          description:      r.description ?? "",
          pages:            r.pages ?? undefined,
          fileUrl:          r.file_url ?? undefined,
        }));
        setLiveItems(mapped);
      }).catch(() => {});
    });
  }, []);

  const content = liveItems ?? vaultContent;
  const visibleCategories = categories.filter((c) => c.id !== "all");

  return (
    <div className="flex flex-col pb-6 relative">
      <AnimatePresence>
        {selectedItem && (
          <VaultPlayerScreen
            item={selectedItem as PlayerVaultItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 800 }}>The Vault</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {content.length} lessons, guides & playbooks
            </p>
          </div>
          <button
            onClick={() => setSearching(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--muted)" }}
          >
            <Search size={17} className="text-muted-foreground" />
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  background: active ? "var(--brand-gradient)" : "var(--muted)",
                  color: active ? "#fff" : "var(--muted-foreground)",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {cat.emoji !== "✦" && <span>{cat.emoji}</span>}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {activeCategory === "all" ? (
        <>
          {/* Featured Hero */}
          <div className="h-5" />
          <FeaturedHero item={featured} onSelect={() => setSelectedItem(featured)} />

          {/* All category rows */}
          {visibleCategories.map((cat) => (
            <CategoryRow
              key={cat.id}
              categoryId={cat.id}
              emoji={cat.emoji}
              label={cat.label}
              onSelect={(item) => setSelectedItem(item)}
              onSeeAll={() => setActiveCategory(cat.id)}
              allItems={content}
            />
          ))}
        </>
      ) : (
        /* Filtered view */
        <div className="px-5 pt-5">
          {(() => {
            const cat = categories.find((c) => c.id === activeCategory)!;
            const items = content.filter((v) => v.category === activeCategory);
            return (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ fontSize: "24px" }}>{cat.emoji}</span>
                  <h2 className="text-foreground" style={{ fontSize: "20px", fontWeight: 800 }}>{cat.label}</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item) => {
                    const ts = typeStyle[item.type] ?? { bg: "#ccc", color: "#000" };
                    return (
                      <div key={item.id}
                        onClick={!item.locked ? () => setSelectedItem(item) : undefined}
                        className={`rounded-2xl overflow-hidden bg-card border border-border ${!item.locked ? "cursor-pointer" : ""}`}
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div className="relative" style={{ aspectRatio: "4/3" }}>
                          <img src={item.image} alt={item.title}
                            className="w-full h-full object-cover"
                            style={{ filter: item.locked ? "brightness(0.45)" : "none" }} />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                          <span className="absolute top-1.5 left-1.5 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: ts.bg, color: ts.color, fontWeight: 700, fontSize: "9px" }}>
                            {item.type}
                          </span>
                          {item.locked ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}>
                                <Lock size={13} className="text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "var(--brand-gradient)" }}>
                              <Play size={11} className="text-white" style={{ marginLeft: 1 }} />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-foreground text-xs" style={{ fontWeight: 700, lineHeight: 1.3 }}>{item.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-muted-foreground text-xs" style={{ fontSize: "10px" }}>{item.instructor}</p>
                            <div className="flex items-center gap-0.5">
                              <Star size={8} fill="#ffd166" stroke="none" />
                              <span style={{ fontSize: "10px", color: "#ffd166", fontWeight: 700 }}>{item.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Search overlay */}
      {searching && <SearchModal onClose={() => setSearching(false)} allItems={content} />}
    </div>
  );
}
