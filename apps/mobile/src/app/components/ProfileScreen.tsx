import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ZODIAC, getSunSign, getMoonSign, getRisingSign, parseBirthDate } from "../../lib/astrology";
import { Edit3, Share2, Settings, MapPin, Globe, Instagram, Linkedin, Twitter, TrendingUp, Award, Users, BookOpen, ChevronRight, Star, Search, Gift, CheckSquare, Square, Camera, Check, X } from "lucide-react";
import { DirectoryScreen } from "./DirectoryScreen";
import { MemberPerksScreen } from "./MemberPerksScreen";
import { SettingsScreen } from "./SettingsScreen";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProfileView = "main" | "directory" | "perks" | "edit" | "settings";
type ProfileTab  = "overview" | "score" | "badges";

// ─── Data ─────────────────────────────────────────────────────────────────────
const industries = [
  "Brand & Marketing", "Technology", "Health & Wellness", "Finance",
  "Media & Content", "E-commerce", "Consulting", "Impact & Social Good",
];

const lookingForOptions = [
  { id: "collaborations",  label: "Collaborations",        emoji: "🤝", description: "Building something together" },
  { id: "podcast",         label: "Podcast Opportunities", emoji: "🎙️", description: "As a guest or host" },
  { id: "referrals",       label: "Referrals",             emoji: "🔗", description: "Warm introductions" },
  { id: "speaking",        label: "Speaking",              emoji: "🎤", description: "Events & panels" },
  { id: "partnerships",    label: "Partnerships",          emoji: "💼", description: "Strategic alliances" },
];

const scoreBreakdown = [
  { label: "Event Attendance",    pts: 280, max: 300 },
  { label: "Community Activity",  pts: 210, max: 250 },
  { label: "Profile Completion",  pts: 150, max: 150 },
  { label: "Referrals",           pts: 110, max: 200 },
];

const badges = [
  { id: 1, label: "Early Member",       emoji: "🌟", earned: true  },
  { id: 2, label: "Community Builder",  emoji: "🏛️", earned: true  },
  { id: 3, label: "Top Contributor",    emoji: "🔥", earned: true  },
  { id: 4, label: "Mentor",             emoji: "🎓", earned: false },
  { id: 5, label: "100 Sessions",       emoji: "💯", earned: false },
  { id: 6, label: "Club Legend",        emoji: "👑", earned: false },
];

const activity = [
  { id: 1, text: "Attended Fundraising Masterclass with Marcus Webb", time: "2 days ago" },
  { id: 2, text: "Connected with Devon Achebe",                        time: "4 days ago" },
  { id: 3, text: "Downloaded Pitch Deck Template from The Vault",     time: "1 week ago" },
  { id: 4, text: "Completed 1:1 with Jade Morales",                   time: "2 weeks ago" },
];

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
interface ProfileData {
  name: string;
  title: string;
  bio: string;
  location: string;
  industry: string;
  website: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  lookingFor: string[];
  avatarUrl?: string;
  coverUrl?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}

function EditProfileModal({
  data, onSave, onClose,
}: {
  data: ProfileData;
  onSave: (d: ProfileData) => void;
  onClose: () => void;
}) {
  const [form, setForm]         = useState<ProfileData>({ ...data });
  const avatarInputRef          = useRef<HTMLInputElement>(null);
  const coverInputRef           = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, key: "avatarUrl" | "coverUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((p) => ({ ...p, [key]: url }));
    e.target.value = "";
  };

  const toggleLookingFor = (id: string) => {
    setForm((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(id)
        ? prev.lookingFor.filter((x) => x !== id)
        : [...prev.lookingFor, id],
    }));
  };

  const field = (label: string, key: keyof ProfileData, placeholder: string, multiline?: boolean) => (
    <div>
      <label className="text-foreground text-xs mb-1.5 block" style={{ fontWeight: 700 }}>{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={form[key] as string}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-2xl text-foreground text-sm outline-none resize-none border border-border"
          style={{ background: "var(--input-background)", fontWeight: 400, lineHeight: 1.6 }}
        />
      ) : (
        <input
          type="text"
          value={form[key] as string}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-2xl text-foreground text-sm outline-none border border-border"
          style={{ background: "var(--input-background)", fontWeight: 400 }}
        />
      )}
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border bg-card flex-shrink-0">
        <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Edit Profile</p>
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-sm"
          style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
          <Check size={14} /> Save
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleImageFile(e, "avatarUrl")} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleImageFile(e, "coverUrl")} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>

        {/* Cover + avatar photo editor */}
        <div className="relative">
          {/* Cover strip */}
          <button onClick={() => coverInputRef.current?.click()}
            className="relative w-full h-28 flex items-center justify-center overflow-hidden group"
            style={{ background: form.coverUrl ? undefined : "var(--brand-gradient)" }}>
            {form.coverUrl
              ? <img src={form.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              : <div className="w-full h-full" style={{ background: "var(--brand-gradient)" }} />}
            {/* Overlay on hover/tap */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 transition-opacity"
              style={{ background: "rgba(0,0,0,0.35)" }}>
              <Camera size={20} className="text-white" />
              <span className="text-white text-xs" style={{ fontWeight: 600 }}>Change cover photo</span>
            </div>
          </button>

          {/* Avatar overlapping cover */}
          <div className="absolute -bottom-10 left-5">
            <div className="relative">
              <img
                src={form.avatarUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format"}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-4"
                style={{ borderColor: "var(--card)" }}
              />
              <button onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border-2"
                style={{ background: "var(--brand-gradient)", borderColor: "var(--card)" }}>
                <Camera size={12} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Spacer for avatar overlap */}
        <div className="h-8 px-5 pt-2 flex items-end">
          <p className="text-muted-foreground text-xs" style={{ fontWeight: 500 }}>Tap either image to update</p>
        </div>

        <div className="px-5 flex flex-col gap-4">

        {field("Full Name",    "name",     "Your name")}
        {field("Title / Role", "title",    "e.g. CEO & Founder")}
        {field("Bio",          "bio",      "What are you building and why does it matter?", true)}
        {field("Location",     "location", "e.g. New York, NY")}

        {/* Industry */}
        <div>
          <label className="text-foreground text-xs mb-2 block" style={{ fontWeight: 700 }}>Industry</label>
          <div className="grid grid-cols-2 gap-2">
            {industries.map((ind) => {
              const active = form.industry === ind;
              return (
                <button key={ind}
                  onClick={() => setForm((p) => ({ ...p, industry: ind }))}
                  className="text-left px-3 py-2 rounded-xl text-xs border transition-all"
                  style={{
                    background: active ? "var(--secondary)" : "var(--input-background)",
                    borderColor: active ? "var(--primary)" : "var(--border)",
                    color: active ? "var(--primary)" : "var(--foreground)",
                    fontWeight: active ? 700 : 500,
                  }}>
                  {ind}
                </button>
              );
            })}
          </div>
        </div>

        {field("Website", "website", "https://yoursite.com")}

        {/* Socials */}
        <div>
          <label className="text-foreground text-xs mb-2 block" style={{ fontWeight: 700 }}>Socials</label>
          <div className="flex flex-col gap-2">
            {[
              { key: "instagram" as const, icon: Instagram, placeholder: "@yourhandle",    prefix: "Instagram" },
              { key: "linkedin"  as const, icon: Linkedin,  placeholder: "LinkedIn URL",   prefix: "LinkedIn"  },
              { key: "twitter"   as const, icon: Twitter,   placeholder: "@yourhandle",    prefix: "X / Twitter" },
            ].map(({ key, icon: Icon, placeholder, prefix }) => (
              <div key={key} className="flex items-center gap-3 border border-border rounded-2xl px-4 py-3"
                style={{ background: "var(--input-background)" }}>
                <Icon size={15} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Looking For */}
        <div>
          <label className="text-foreground text-xs mb-1 block" style={{ fontWeight: 700 }}>Looking For</label>
          <p className="text-muted-foreground text-xs mb-3">This appears on your profile to make networking intentional.</p>
          <div className="flex flex-col gap-2">
            {lookingForOptions.map((opt) => {
              const active = form.lookingFor.includes(opt.id);
              return (
                <button key={opt.id}
                  onClick={() => toggleLookingFor(opt.id)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all text-left"
                  style={{
                    background: active ? "var(--secondary)" : "var(--input-background)",
                    borderColor: active ? "var(--primary)" : "var(--border)",
                  }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-foreground text-sm" style={{ fontWeight: active ? 700 : 500 }}>{opt.label}</p>
                    <p className="text-muted-foreground text-xs">{opt.description}</p>
                  </div>
                  {active
                    ? <CheckSquare size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    : <Square size={18} className="text-muted-foreground flex-shrink-0" />
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Astrology / Birth Data ── */}
        <div className="px-5 mt-2 pb-8">
          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(123,78,200,0.07), rgba(232,54,92,0.04))",
              border: "1px solid rgba(123,78,200,0.18)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: "16px" }}>✨</span>
              <div>
                <p className="text-foreground text-xs" style={{ fontWeight: 800 }}>Astrology Chart</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Powers your daily cosmic reading</p>
              </div>
            </div>

            {/* Date of birth */}
            <div className="mb-3">
              <label className="block text-xs mb-1.5 text-foreground" style={{ fontWeight: 700 }}>Date of Birth</label>
              <input
                type="date"
                value={form.birthDate ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-foreground"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Time of birth */}
              <div>
                <label className="block text-xs mb-1.5 text-foreground" style={{ fontWeight: 700 }}>Time of Birth</label>
                <input
                  type="time"
                  value={form.birthTime ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, birthTime: e.target.value }))}
                  className="w-full px-3 py-3 rounded-2xl text-xs outline-none text-foreground"
                  style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}
                />
                <p className="text-muted-foreground mt-1" style={{ fontSize: "10px" }}>For rising sign</p>
              </div>

              {/* Birth city */}
              <div>
                <label className="block text-xs mb-1.5 text-foreground" style={{ fontWeight: 700 }}>Birth City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={form.birthCity ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, birthCity: e.target.value }))}
                  className="w-full px-3 py-3 rounded-2xl text-xs outline-none text-foreground placeholder:text-muted-foreground"
                  style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

// ─── Looking For Display ──────────────────────────────────────────────────────
function LookingForDisplay({ selected }: { selected: string[] }) {
  if (!selected.length) return null;
  const active = lookingForOptions.filter((o) => selected.includes(o.id));

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <p className="text-foreground text-sm mb-3" style={{ fontWeight: 700 }}>Looking For</p>
      <div className="flex flex-col gap-2">
        {active.map((opt) => (
          <div key={opt.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: "var(--secondary)" }}>
            <span style={{ fontSize: "16px" }}>{opt.emoji}</span>
            <div className="flex-1">
              <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{opt.label}</p>
              <p className="text-muted-foreground text-xs">{opt.description}</p>
            </div>
            <CheckSquare size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Natal Chart Card ─────────────────────────────────────────────────────────

function ChartRing({ signs }: { signs: Array<{ label: string; sign: { symbol: string; color: string; name: string } | null }> }) {
  const size  = 160;
  const cx    = size / 2;
  const cy    = size / 2;
  const r     = 58;
  const inner = 36;
  const count = 12;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r + 10} fill="rgba(123,78,200,0.06)" />

      {/* 12 zodiac segments */}
      {Array.from({ length: count }).map((_, i) => {
        const startAngle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const endAngle   = ((i + 1) / count) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const xi1 = cx + inner * Math.cos(startAngle);
        const yi1 = cy + inner * Math.sin(startAngle);
        const xi2 = cx + inner * Math.cos(endAngle);
        const yi2 = cy + inner * Math.sin(endAngle);
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const tx = cx + (r + inner) / 2 * Math.cos(midAngle);
        const ty = cy + (r + inner) / 2 * Math.sin(midAngle);
        const zodiacSymbols = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
        return (
          <g key={i}>
            <path
              d={`M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 0 0 ${xi1} ${yi1}`}
              fill="rgba(123,78,200,0.04)"
              stroke="rgba(123,78,200,0.12)"
              strokeWidth="0.5"
            />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="rgba(123,78,200,0.35)">
              {zodiacSymbols[i]}
            </text>
          </g>
        );
      })}

      {/* Center glow */}
      <circle cx={cx} cy={cy} r={inner - 2} fill="rgba(15,10,25,0.5)" />

      {/* Planet markers */}
      {signs.map((s, idx) => {
        if (!s.sign) return null;
        const signIdx  = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"].indexOf(s.sign.name.toLowerCase());
        const angle    = (signIdx / 12) * Math.PI * 2 - Math.PI / 2;
        const markerR  = (r + inner) / 2;
        const mx = cx + markerR * Math.cos(angle);
        const my = cy + markerR * Math.sin(angle);
        return (
          <g key={s.label}>
            <circle cx={mx} cy={my} r={7} fill={s.sign.color} opacity={0.9} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#fff" fontWeight="bold">
              {idx === 0 ? "☀" : idx === 1 ? "☽" : "↑"}
            </text>
          </g>
        );
      })}

      {/* Center text */}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="9" fill="rgba(200,180,255,0.7)">Natal</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="9" fill="rgba(200,180,255,0.7)">Chart</text>
    </svg>
  );
}

interface NatalChartProps {
  chart: { sun: import("../../lib/astrology").ZodiacSign | null; moon: import("../../lib/astrology").ZodiacSign | null; rising: import("../../lib/astrology").ZodiacSign | null };
  birthCity?: string;
  birthDate?: string;
}

function NatalChartCard({ chart, birthCity, birthDate }: NatalChartProps) {
  const entries = [
    { label: "Sun",    sign: chart.sun,    glyph: "☀",  desc: "Core identity & life purpose" },
    { label: "Moon",   sign: chart.moon,   glyph: "☽",  desc: "Emotions & inner world" },
    { label: "Rising", sign: chart.rising, glyph: "↑",  desc: "How the world sees you" },
  ];

  const formattedDate = birthDate
    ? new Date(birthDate + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div
      className="rounded-2xl p-4 border overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #0f0a19, #1a0e2e)", borderColor: "rgba(123,78,200,0.25)" }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: "radial-gradient(circle at 80% 20%, rgba(123,78,200,0.15) 0%, transparent 70%)" }} />

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <span style={{ fontSize: "16px" }}>✨</span>
        <div>
          <p style={{ fontWeight: 800, fontSize: "14px", color: "#e8d5ff" }}>Natal Chart</p>
          {(birthCity || formattedDate) && (
            <p style={{ fontSize: "10px", color: "rgba(200,180,255,0.5)" }}>
              {formattedDate}{birthCity ? ` · ${birthCity}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4 relative z-10">
        {/* Chart ring */}
        <div className="flex-shrink-0">
          <ChartRing signs={entries.map((e) => ({ label: e.label, sign: e.sign }))} />
        </div>

        {/* Sign cards */}
        <div className="flex flex-col gap-2 flex-1 justify-center">
          {entries.map((e) => (
            <div key={e.label} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: e.sign ? `${e.sign.color}20` : "rgba(255,255,255,0.05)", border: `1px solid ${e.sign ? e.sign.color + "40" : "rgba(255,255,255,0.1)"}` }}
              >
                {e.glyph}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: "10px", color: "rgba(200,180,255,0.5)", fontWeight: 600 }}>{e.label}</span>
                  {e.sign && <span style={{ fontSize: "10px", color: e.sign.color, fontWeight: 700 }}>{e.sign.symbol} {e.sign.name}</span>}
                  {!e.sign && <span style={{ fontSize: "10px", color: "rgba(200,180,255,0.3)" }}>Unknown</span>}
                </div>
                {e.sign && (
                  <p style={{ fontSize: "9px", color: "rgba(200,180,255,0.4)" }}>{e.sign.element} · {e.sign.modality}</p>
                )}
              </div>
            </div>
          ))}

          {chart.sun && (
            <div className="mt-1 pt-2" style={{ borderTop: "1px solid rgba(123,78,200,0.15)" }}>
              <div className="flex flex-wrap gap-1">
                {chart.sun.traits.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", background: `${chart.sun!.color}20`, color: chart.sun!.color, fontWeight: 600 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ProfileScreen ───────────────────────────────────────────────────────
interface ProfileScreenProps {
  isMember?: boolean;
  onSignOut?: () => void;
  currentUserId?: string;
  currentProfile?: Record<string, any> | null;
}

export function ProfileScreen({ isMember = false, onSignOut, currentUserId, currentProfile }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [view, setView]           = useState<ProfileView>("main");
  const [showEdit, setShowEdit]   = useState(false);
  const heroCoverInputRef         = useRef<HTMLInputElement>(null);
  const heroAvatarInputRef        = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name:       "Priscilla Ava",
    title:      "CEO & Founder · Nova Labs",
    bio:        "Serial entrepreneur, brand strategist, and culture curator. Building Nova Labs to make the future of work more human. Speaker, author, and mentor to the next generation of founders.",
    location:   "New York, NY",
    industry:   "Brand & Marketing",
    website:    "priscillaava.com",
    instagram:  "@priscillaava",
    linkedin:   "Priscilla Ava",
    twitter:    "@priscillaava",
    lookingFor: ["collaborations", "podcast", "speaking"],
    avatarUrl:  undefined,
    coverUrl:   undefined,
  });

  useEffect(() => {
    if (!currentProfile) return;
    setProfile((p) => ({
      ...p,
      name:       currentProfile.full_name ?? p.name,
      bio:        currentProfile.bio ?? p.bio,
      location:   currentProfile.location ?? p.location,
      industry:   currentProfile.industry ?? p.industry,
      website:    currentProfile.website ?? p.website,
      avatarUrl:  currentProfile.avatar_url ?? p.avatarUrl,
      coverUrl:   currentProfile.cover_url ?? p.coverUrl,
      birthDate:  currentProfile.birth_date ?? p.birthDate,
      birthTime:  currentProfile.birth_time ?? p.birthTime,
      birthCity:  currentProfile.birth_city ?? p.birthCity,
      sunSign:    currentProfile.sun_sign ?? p.sunSign,
      moonSign:   currentProfile.moon_sign ?? p.moonSign,
      risingSign: currentProfile.rising_sign ?? p.risingSign,
    }));
  }, [currentProfile]);

  const natalChart = useMemo(() => {
    const sunId  = profile.sunSign;
    const moonId = profile.moonSign;
    const riseId = profile.risingSign;

    // Derive from raw birth data if DB fields not yet set
    const derived = (() => {
      const parsed = profile.birthDate ? parseBirthDate(profile.birthDate) : null;
      const sun   = parsed ? getSunSign(parsed.month, parsed.day) : null;
      const moon  = profile.birthDate ? getMoonSign(profile.birthDate) : null;
      const rising = profile.birthTime ? getRisingSign(profile.birthTime) : null;
      return { sun, moon, rising };
    })();

    const sun    = (sunId  ? ZODIAC.find((z) => z.id === sunId)    : derived.sun)    ?? null;
    const moon   = (moonId ? ZODIAC.find((z) => z.id === moonId)   : derived.moon)   ?? null;
    const rising = (riseId ? ZODIAC.find((z) => z.id === riseId)   : derived.rising) ?? null;
    return { sun, moon, rising };
  }, [profile.sunSign, profile.moonSign, profile.risingSign, profile.birthDate, profile.birthTime]);

  const handleHeroFile = useCallback((e: React.ChangeEvent<HTMLInputElement>, key: "avatarUrl" | "coverUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, [key]: previewUrl }));
    if (currentUserId) {
      import("../../lib/api/storage").then(({ uploadAvatar, uploadCover }) => {
        const fn = key === "avatarUrl" ? uploadAvatar : uploadCover;
        fn(currentUserId, file).then((publicUrl) => {
          setProfile((p) => ({ ...p, [key]: publicUrl }));
          import("../../lib/api/profiles").then(({ updateProfile }) => {
            const field = key === "avatarUrl" ? "avatar_url" : "cover_url";
            updateProfile(currentUserId, { [field]: publicUrl } as any).catch(() => {});
          });
        }).catch(() => {});
      });
    }
    e.target.value = "";
  }, [currentUserId]);

  // Sub-views
  if (view === "directory") {
    return (
      <div className="flex flex-col flex-1">
        <div className="px-5 pt-5 pb-3 bg-card border-b border-border flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setView("main")}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>
            ← Profile
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <DirectoryScreen />
        </div>
      </div>
    );
  }

  if (view === "perks") {
    return (
      <div className="flex flex-col flex-1">
        <div className="px-5 pt-5 pb-3 bg-card border-b border-border flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setView("main")}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>
            ← Profile
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <MemberPerksScreen />
        </div>
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <SettingsScreen
          isMember={isMember}
          onBack={() => setView("main")}
          onSignOut={() => { setView("main"); onSignOut?.(); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-6 relative">

      {/* Edit modal */}
      {showEdit && (
        <EditProfileModal
          data={profile}
          onSave={(d) => {
            // Recompute astrology signs from new birth data before saving
            const enriched = { ...d };
            if (d.birthDate) {
              const parsed = parseBirthDate(d.birthDate);
              if (parsed) enriched.sunSign = getSunSign(parsed.month, parsed.day).id;
              enriched.moonSign = getMoonSign(d.birthDate).id;
            }
            if (d.birthTime) {
              enriched.risingSign = getRisingSign(d.birthTime)?.id ?? undefined;
            }
            setProfile(enriched);
            setShowEdit(false);
            if (currentUserId) {
              import("../../lib/api/profiles").then(({ updateProfile }) => {
                updateProfile(currentUserId, {
                  full_name:    enriched.name,
                  bio:          enriched.bio,
                  location:     enriched.location,
                  industry:     enriched.industry,
                  website:      enriched.website,
                  avatar_url:   enriched.avatarUrl,
                  cover_url:    enriched.coverUrl,
                  birth_date:   enriched.birthDate   || null,
                  birth_time:   enriched.birthTime   || null,
                  birth_city:   enriched.birthCity   || null,
                  sun_sign:     enriched.sunSign      || null,
                  moon_sign:    enriched.moonSign     || null,
                  rising_sign:  enriched.risingSign   || null,
                } as any).catch(() => {});
              });
            }
          }}
          onClose={() => setShowEdit(false)}
        />
      )}

      {/* Hidden file inputs for hero */}
      <input ref={heroCoverInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleHeroFile(e, "coverUrl")} />
      <input ref={heroAvatarInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleHeroFile(e, "avatarUrl")} />

      {/* ── Hero ── */}
      <div className="relative">
        {/* Cover image / gradient strip — tap to change */}
        <button onClick={() => heroCoverInputRef.current?.click()}
          className="relative w-full h-32 block overflow-hidden group">
          {profile.coverUrl
            ? <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            : <div className="w-full h-full" style={{ background: "var(--brand-gradient)" }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.08)", transform: "translate(30%,-30%)" }} />
                <div className="absolute top-4 left-1/3 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>}
          {/* Camera hint */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
            <Camera size={12} className="text-white" />
            <span className="text-white text-xs" style={{ fontWeight: 600 }}>Edit cover</span>
          </div>
        </button>

        {/* Action buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span />
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <Share2 size={16} className="text-white" />
            </button>
            <button onClick={() => setView("settings")} className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <Settings size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Avatar + info */}
        <div className="px-5 -mt-10">
          <div className="flex items-end justify-between mb-4">
            {/* Avatar — tap to change */}
            <div className="relative">
              <img
                src={profile.avatarUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format"}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-background"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
              />
              <button
                onClick={() => heroAvatarInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-background"
                style={{ background: "var(--brand-gradient)" }}>
                <Camera size={11} className="text-white" />
              </button>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border-2 mb-2 text-sm"
              style={{ borderColor: "var(--primary)", color: "var(--primary)", fontWeight: 700 }}>
              <Edit3 size={13} /> Edit Profile
            </button>
          </div>

          {/* Name + title */}
          <h1 className="text-foreground mb-0.5" style={{ fontSize: "22px", fontWeight: 800 }}>{profile.name}</h1>
          <p className="text-muted-foreground text-sm mb-3">{profile.title}</p>

          {/* Location + industry + website */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
            {profile.location && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <MapPin size={11} />{profile.location}
              </span>
            )}
            {profile.website && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)" }}>
                <Globe size={11} />{profile.website}
              </span>
            )}
            {profile.industry && (
              <span className="text-xs px-2.5 py-0.5 rounded-full"
                style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}>
                {profile.industry}
              </span>
            )}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2 mb-4">
            {profile.instagram && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-border bg-card"
                style={{ fontWeight: 600, color: "var(--foreground)" }}>
                <Instagram size={12} style={{ color: "#E1306C" }} />{profile.instagram}
              </button>
            )}
            {profile.linkedin && (
              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-card">
                <Linkedin size={14} style={{ color: "#0A66C2" }} />
              </button>
            )}
            {profile.twitter && (
              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-card">
                <Twitter size={14} style={{ color: "#1DA1F2" }} />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: "Connections", value: "312",  color: "var(--primary)" },
              { label: "Sessions",    value: "14",   color: "var(--purple)"  },
              { label: "Score",       value: "750",  color: "var(--accent)"  },
            ].map((s) => (
              <div key={s.label} className="flex-1 bg-card rounded-2xl p-3 border border-border text-center shadow-sm">
                <p className="text-foreground" style={{ fontWeight: 800, fontSize: "18px", color: s.color }}>{s.value}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 mx-5 my-4 bg-muted rounded-2xl p-1">
        {(["overview", "score", "badges"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-xl text-sm capitalize transition-all"
            style={{
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
              fontWeight: activeTab === tab ? 700 : 500,
              boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>
            {tab === "overview" ? "Overview" : tab === "score" ? "Score" : "Badges"}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="px-5 flex flex-col gap-4">

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setView("directory")}
              className="bg-card rounded-2xl p-4 border border-border text-left flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--secondary)" }}>
                <Search size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Directory</p>
                <p className="text-muted-foreground text-xs">Find founders</p>
              </div>
            </button>
            <button onClick={() => setView("perks")}
              className="bg-card rounded-2xl p-4 border border-border text-left flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--secondary)" }}>
                <Gift size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Perks</p>
                <p className="text-muted-foreground text-xs">$1,700+ deals</p>
              </div>
            </button>
          </div>

          {/* Bio */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Bio</p>
            <p className="text-muted-foreground text-sm mt-2" style={{ lineHeight: 1.7 }}>{profile.bio}</p>
          </div>

          {/* Astrology Chart — always shown */}
          {(natalChart.sun || profile.birthDate) ? (
            <NatalChartCard chart={natalChart} birthCity={profile.birthCity} birthDate={profile.birthDate} />
          ) : (
            <button
              onClick={() => setShowEdit(true)}
              className="w-full rounded-2xl p-4 flex items-center gap-3 text-left"
              style={{
                background: "linear-gradient(135deg, #0f0a19, #1a0e2e)",
                border: "1.5px dashed rgba(123,78,200,0.35)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: "rgba(123,78,200,0.12)", border: "1px solid rgba(123,78,200,0.2)" }}
              >
                ✨
              </div>
              <div className="flex-1">
                <p style={{ fontWeight: 800, fontSize: "14px", color: "#e8d5ff" }}>Set up your natal chart</p>
                <p style={{ fontSize: "11px", color: "rgba(200,180,255,0.45)", marginTop: "2px", lineHeight: 1.5 }}>
                  Add your date of birth, time &amp; city to unlock your personal cosmic reading
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "rgba(200,180,255,0.3)", flexShrink: 0 }} />
            </button>
          )}

          {/* Looking For */}
          <LookingForDisplay selected={profile.lookingFor} />

          {/* Recent Activity */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Recent Activity</p>
              <button className="flex items-center gap-1 text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>
                See all <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: "var(--brand-gradient)" }} />
                  <div className="flex-1">
                    <p className="text-foreground text-sm">{a.text}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Score Tab ── */}
      {activeTab === "score" && (
        <div className="px-5 flex flex-col gap-4">
          {/* Score hero */}
          <div className="bg-card rounded-3xl p-6 border border-border text-center shadow-sm">
            <p className="text-muted-foreground text-sm mb-1">Your Founder Score</p>
            <p style={{ fontSize: "56px", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>750</p>
            <div className="flex justify-center gap-1 my-3">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={18} fill={s <= 4 ? "#ffd166" : "none"} stroke="#ffd166" />
              ))}
            </div>
            <span className="text-xs px-3 py-1 rounded-full"
              style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 700 }}>
              Top 15% of members
            </span>
          </div>

          {/* Breakdown */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-foreground text-sm mb-4" style={{ fontWeight: 700 }}>Score Breakdown</p>
            <div className="flex flex-col gap-3">
              {scoreBreakdown.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{s.pts}/{s.max}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(s.pts / s.max) * 100}%`, background: "var(--brand-gradient)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boost tips */}
          <div className="rounded-2xl p-4" style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(255,95,109,0.2)" }}>
            <p className="text-foreground text-sm mb-2" style={{ fontWeight: 700 }}>Boost your score</p>
            <div className="flex flex-col gap-2">
              {[
                { tip: "Attend 2 more events",  pts: "+90 pts" },
                { tip: "Refer a founder",        pts: "+50 pts" },
                { tip: "Complete your profile",  pts: "+50 pts" },
              ].map(({ tip, pts }) => (
                <div key={tip} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <span style={{ color: "var(--primary)" }}>→</span> {tip}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 700 }}>
                    {pts}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Badges Tab ── */}
      {activeTab === "badges" && (
        <div className="px-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {badges.map((b) => (
              <div key={b.id}
                className="bg-card rounded-2xl p-4 border border-border text-center flex flex-col items-center gap-2 transition-all"
                style={{ opacity: b.earned ? 1 : 0.35 }}>
                <span style={{ fontSize: "30px" }}>{b.emoji}</span>
                <p className="text-foreground text-xs" style={{ fontWeight: 700, lineHeight: 1.3 }}>{b.label}</p>
                {b.earned && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 700 }}>
                    Earned
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-4 border border-dashed border-border text-center">
            <Award size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Unlock more badges by participating in the community</p>
          </div>
        </div>
      )}
    </div>
  );
}
