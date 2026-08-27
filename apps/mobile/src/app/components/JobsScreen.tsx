import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ArrowLeft, Check, MapPin, Clock, DollarSign, Briefcase, Search, ChevronRight, Sparkles, X, User, Mail, Phone, Globe, FileText, Send } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JobType = "Contractor" | "Freelancer" | "Part-time" | "Full-time" | "Co-founder";
type Remote  = "Remote" | "Hybrid" | "On-site";

interface Job {
  id: number;
  poster: string;
  posterAvatar: string;
  posterRole: string;
  company: string;
  title: string;
  type: JobType;
  remote: Remote;
  location: string;
  rate: string;
  category: string;
  description: string;
  skills: string[];
  postedAt: string;
  urgent?: boolean;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const jobs: Job[] = [
  {
    id: 1,
    poster: "Priscilla Ava",
    posterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    posterRole: "Founder · Inspired Club",
    company: "Inspired Club",
    title: "Brand Designer (Contract)",
    type: "Contractor",
    remote: "Remote",
    location: "Anywhere",
    rate: "$80–$120/hr",
    category: "Design",
    description: "We're looking for a talented brand designer to help us evolve our visual identity across digital touchpoints. You'll work directly with the founder on brand guidelines, social assets, and campaign visuals.",
    skills: ["Figma", "Brand Identity", "Social Design", "Typography"],
    postedAt: "2h ago",
    urgent: true,
  },
  {
    id: 2,
    poster: "Marcus Webb",
    posterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    posterRole: "Founder · Shift Capital",
    company: "Shift Capital",
    title: "Paid Ads Specialist",
    type: "Freelancer",
    remote: "Remote",
    location: "Anywhere",
    rate: "$3,000–$5,000/mo",
    category: "Marketing",
    description: "Shift Capital is scaling fast and needs a paid media specialist to own our Meta and Google campaigns. Looking for someone with proven DTC or fintech experience and an ROI-first mindset.",
    skills: ["Meta Ads", "Google Ads", "Analytics", "CRO"],
    postedAt: "1d ago",
  },
  {
    id: 3,
    poster: "Jade Morales",
    posterAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    posterRole: "Co-Founder · Aura Health",
    company: "Aura Health",
    title: "Operations Manager",
    type: "Part-time",
    remote: "Hybrid",
    location: "Melbourne, AU",
    rate: "$40–$55/hr",
    category: "Operations",
    description: "Aura Health is a wellness startup building personalised health journeys. We need a sharp ops manager to help streamline processes, manage contractors, and support the founding team as we scale from 0→1.",
    skills: ["Project Management", "Systems", "Notion", "Team Coordination"],
    postedAt: "2d ago",
  },
  {
    id: 4,
    poster: "Devon Achebe",
    posterAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    posterRole: "Founder · Drift Labs",
    company: "Drift Labs",
    title: "Full-Stack Engineer",
    type: "Co-founder",
    remote: "Remote",
    location: "Anywhere",
    rate: "Equity + salary",
    category: "Engineering",
    description: "Drift Labs is an AI-native B2B SaaS company. We're looking for a technical co-founder / founding engineer who can help us build our core product. We have a strong commercial lead and are post-idea, pre-seed.",
    skills: ["React", "Node.js", "AI/ML", "Product Thinking"],
    postedAt: "3d ago",
    urgent: true,
  },
  {
    id: 5,
    poster: "Amara Osei",
    posterAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
    posterRole: "Founder · Collab Studio",
    company: "Collab Studio",
    title: "Content Strategist",
    type: "Freelancer",
    remote: "Remote",
    location: "Anywhere",
    rate: "$50–$70/hr",
    category: "Marketing",
    description: "Collab Studio is a creative agency helping purpose-driven brands tell better stories. We need a content strategist to develop editorial calendars, ghostwrite thought leadership pieces, and build our content playbook.",
    skills: ["Content Strategy", "Copywriting", "SEO", "Editorial"],
    postedAt: "4d ago",
  },
];

const categories = ["All", "Design", "Marketing", "Engineering", "Operations", "Finance", "Sales"];

const typeColors: Record<JobType, { bg: string; color: string }> = {
  Contractor:   { bg: "rgba(123,78,200,0.12)", color: "#7b4ec8" },
  Freelancer:   { bg: "rgba(240,120,50,0.12)", color: "#f07832" },
  "Part-time":  { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  "Full-time":  { bg: "rgba(14,165,233,0.12)", color: "#0ea5e9" },
  "Co-founder": { bg: "rgba(232,54,92,0.12)",  color: "#e8365c" },
};

// ─── Post Job Form ────────────────────────────────────────────────────────────

const JOB_TYPES: JobType[]  = ["Contractor", "Freelancer", "Part-time", "Full-time", "Co-founder"];
const REMOTE_OPTS: Remote[] = ["Remote", "Hybrid", "On-site"];
const SKILL_SUGGESTIONS     = ["Figma", "React", "Node.js", "Copywriting", "SEO", "Meta Ads", "Google Ads", "Branding", "Notion", "Canva", "Shopify", "Video Editing", "Email Marketing", "Sales", "Finance", "Operations"];

function PostJobForm({ onClose, onPosted }: { onClose: () => void; onPosted: () => void }) {
  const [title, setTitle]         = useState("");
  const [type, setType]           = useState<JobType | "">("");
  const [remote, setRemote]       = useState<Remote | "">("");
  const [location, setLocation]   = useState("");
  const [rate, setRate]           = useState("");
  const [description, setDesc]    = useState("");
  const [skills, setSkills]       = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [urgent, setUrgent]       = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addSkill = (s: string) => {
    const clean = s.trim();
    if (clean && !skills.includes(clean) && skills.length < 8) {
      setSkills((p) => [...p, clean]);
      setSkillInput("");
    }
  };

  const valid = title.trim().length > 3 && type !== "" && remote !== "" && description.trim().length > 20 && skills.length > 0;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16, stiffness: 260 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}
        >
          <Check size={36} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-foreground mb-2" style={{ fontSize: "22px", fontWeight: 800 }}>Role Posted!</h2>
        <p className="text-muted-foreground text-sm mb-8" style={{ lineHeight: 1.7, maxWidth: "260px" }}>
          Your opportunity is now live in The Club Projects board. Members will be able to apply directly.
        </p>
        <button
          onClick={onPosted}
          className="w-full py-4 rounded-2xl text-white"
          style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border flex items-center gap-3">
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center bg-muted">
          <X size={16} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>Post a Project</h2>
          <p className="text-muted-foreground text-xs">Reach 2,400+ vetted founders</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-5">

          {/* Role title */}
          <div>
            <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>Role title *</label>
            <input
              type="text"
              placeholder="e.g. Brand Designer, Growth Marketer…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl text-foreground outline-none text-sm"
              style={{ background: "var(--muted)", border: "1.5px solid var(--border)", fontWeight: 400 }}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-foreground text-sm mb-2.5 block" style={{ fontWeight: 700 }}>Engagement type *</label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((t) => {
                const on = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="px-3 py-2 rounded-xl text-xs transition-all"
                    style={{
                      background: on ? "var(--brand-gradient)" : "var(--muted)",
                      color: on ? "#fff" : "var(--muted-foreground)",
                      fontWeight: on ? 700 : 500,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remote */}
          <div>
            <label className="text-foreground text-sm mb-2.5 block" style={{ fontWeight: 700 }}>Work arrangement *</label>
            <div className="flex gap-2">
              {REMOTE_OPTS.map((r) => {
                const on = remote === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRemote(r)}
                    className="flex-1 py-2.5 rounded-xl text-xs transition-all"
                    style={{
                      background: on ? "var(--brand-gradient-soft)" : "var(--muted)",
                      border: on ? "2px solid var(--primary)" : "2px solid transparent",
                      color: on ? "var(--primary)" : "var(--muted-foreground)",
                      fontWeight: on ? 700 : 500,
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location + Rate */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>Location</label>
              <input
                type="text"
                placeholder="e.g. Sydney, AU"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-3.5 rounded-2xl text-foreground outline-none text-sm"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", fontWeight: 400 }}
              />
            </div>
            <div className="flex-1">
              <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>Rate / Salary</label>
              <input
                type="text"
                placeholder="e.g. $80/hr"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-3 py-3.5 rounded-2xl text-foreground outline-none text-sm"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", fontWeight: 400 }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>
              Role description *
            </label>
            <textarea
              placeholder="Describe the role, what you're building, what the ideal person looks like, and how to apply or get in touch…"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              className="w-full px-4 py-3.5 rounded-2xl text-foreground outline-none text-sm resize-none"
              style={{ background: "var(--muted)", border: "1.5px solid var(--border)", fontWeight: 400, lineHeight: 1.6 }}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>
              Skills needed * <span className="text-muted-foreground font-normal">({skills.length}/8)</span>
            </label>

            {/* Selected skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSkills((p) => p.filter((x) => x !== s))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{ background: "var(--brand-gradient)", color: "#fff", fontWeight: 600 }}
                  >
                    {s} <X size={10} />
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a skill…"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                className="flex-1 px-4 py-3 rounded-2xl text-foreground outline-none text-sm"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", fontWeight: 400 }}
              />
              <button
                onClick={() => addSkill(skillInput)}
                className="px-4 py-3 rounded-2xl text-white text-sm"
                style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
              >
                Add
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 500 }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Urgent toggle */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3.5"
            style={{ background: "var(--muted)" }}
          >
            <div>
              <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Mark as Urgent</p>
              <p className="text-muted-foreground text-xs mt-0.5">Highlights your post with an urgent badge</p>
            </div>
            <button
              onClick={() => setUrgent((u) => !u)}
              className="w-12 h-6 rounded-full transition-all relative"
              style={{ background: urgent ? "var(--brand-gradient)" : "var(--border)" }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: urgent ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={() => valid && setSubmitted(true)}
            className="w-full py-4 rounded-2xl text-white text-sm transition-opacity"
            style={{
              background: "var(--brand-gradient)",
              fontWeight: 700,
              opacity: valid ? 1 : 0.4,
              boxShadow: valid ? "var(--shadow-brand)" : "none",
            }}
          >
            Post Opportunity
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Application Form ─────────────────────────────────────────────────────────

function ApplicationForm({ job, onBack, onSubmit }: { job: Job; onBack: () => void; onSubmit: () => void }) {
  const [name,     setName]     = useState("Priscilla Ava");
  const [email,    setEmail]    = useState("priscilla@inspiredclub.com");
  const [phone,    setPhone]    = useState("");
  const [website,  setWebsite]  = useState("priscillaava.com");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/priscillaava");
  const [pitch,    setPitch]    = useState("");
  const [relevant, setRelevant] = useState("");
  const [loading,  setLoading]  = useState(false);

  const canSubmit = name.trim() && email.trim() && pitch.trim().length >= 30;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit(); }, 1100);
  };

  const field = (
    label: string, value: string, onChange: (v: string) => void,
    opts?: { placeholder?: string; icon?: React.ReactNode; type?: string; required?: boolean }
  ) => (
    <div>
      <label className="block text-foreground text-xs mb-1.5" style={{ fontWeight: 700 }}>
        {label}{opts?.required && <span style={{ color: "var(--primary)" }}> *</span>}
      </label>
      <div className="relative">
        {opts?.icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{opts.icon}</div>
        )}
        <input type={opts?.type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={opts?.placeholder}
          className="w-full py-3.5 rounded-2xl text-foreground text-sm outline-none border border-border transition-all"
          style={{ background: "var(--muted)", paddingLeft: opts?.icon ? "44px" : "16px", paddingRight: "16px", fontWeight: 400 }} />
      </div>
    </div>
  );

  return (
    <motion.div className="absolute inset-0 z-30 flex flex-col bg-background"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border bg-card flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={16} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>Apply for Role</p>
          <p className="text-muted-foreground text-xs truncate">{job.title} · {job.company}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>

        {/* Role recap */}
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border"
          style={{ background: "var(--brand-gradient-soft)" }}>
          <img src={job.posterAvatar} alt={job.poster} className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            style={{ boxShadow: "0 0 0 2px var(--primary)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm truncate" style={{ fontWeight: 700 }}>{job.title}</p>
            <p className="text-muted-foreground text-xs">{job.company} · Posted by {job.poster.split(" ")[0]}</p>
          </div>
        </div>

        {/* Contact details */}
        <div>
          <p className="text-foreground mb-4" style={{ fontSize: "15px", fontWeight: 800 }}>Your Details</p>
          <div className="flex flex-col gap-3">
            {field("Full name", name, setName, { placeholder: "Your full name", icon: <User size={15} />, required: true })}
            {field("Email address", email, setEmail, { placeholder: "you@example.com", icon: <Mail size={15} />, type: "email", required: true })}
            {field("Phone number", phone, setPhone, { placeholder: "+1 (555) 000-0000", icon: <Phone size={15} />, type: "tel" })}
            {field("Website / Portfolio", website, setWebsite, { placeholder: "yoursite.com", icon: <Globe size={15} /> })}
            {field("LinkedIn", linkedin, setLinkedin, { placeholder: "linkedin.com/in/yourname", icon: <FileText size={15} /> })}
          </div>
        </div>

        {/* Why you */}
        <div>
          <p className="text-foreground mb-1" style={{ fontSize: "15px", fontWeight: 800 }}>
            Why are you the right fit? <span style={{ color: "var(--primary)" }}>*</span>
          </p>
          <p className="text-muted-foreground text-xs mb-3" style={{ lineHeight: 1.6 }}>
            Tell {job.poster.split(" ")[0]} who you are, what you bring to this role, and why it excites you. Be specific — founders notice the details.
          </p>
          <textarea value={pitch} onChange={(e) => setPitch(e.target.value)}
            placeholder={`Hi ${job.poster.split(" ")[0]}, I'd love to work on this because…`}
            rows={6}
            className="w-full px-4 py-3.5 rounded-2xl text-foreground outline-none text-sm resize-none border border-border"
            style={{ background: "var(--muted)", fontWeight: 400, lineHeight: 1.7 }} />
          <p className="text-right text-xs mt-1"
            style={{ color: pitch.length < 30 ? "var(--muted-foreground)" : "var(--primary)", fontWeight: 600 }}>
            {pitch.length} chars {pitch.length < 30 && `· min 30`}
          </p>
        </div>

        {/* Relevant experience */}
        <div>
          <p className="text-foreground mb-1" style={{ fontSize: "15px", fontWeight: 800 }}>Relevant experience</p>
          <p className="text-muted-foreground text-xs mb-3" style={{ lineHeight: 1.6 }}>
            Highlight 1–3 past projects or roles that are most relevant to this opportunity.
          </p>
          <textarea value={relevant} onChange={(e) => setRelevant(e.target.value)}
            placeholder="e.g. Built the marketing function at X from 0 → 50k users. Led brand for Y during their Series A…"
            rows={4}
            className="w-full px-4 py-3.5 rounded-2xl text-foreground outline-none text-sm resize-none border border-border"
            style={{ background: "var(--muted)", fontWeight: 400, lineHeight: 1.7 }} />
        </div>

        {/* Trust note */}
        <div className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.18)" }}>
          <Sparkles size={14} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-muted-foreground text-xs" style={{ lineHeight: 1.7 }}>
            Your application goes directly to <strong>{job.poster}</strong>. Your Club profile will be included automatically. All contact details remain private until they choose to connect.
          </p>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!canSubmit || loading}
          className="w-full py-4 rounded-2xl text-white text-sm flex items-center justify-center gap-2 transition-all"
          style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: canSubmit ? "var(--shadow-brand)" : "none", opacity: canSubmit ? 1 : 0.45 }}>
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending…</span>
            : <><Send size={16} /> Send Application</>
          }
        </button>
      </div>
    </motion.div>
  );
}

// ─── Job Detail ───────────────────────────────────────────────────────────────

function JobDetail({ job, onBack }: { job: Job; onBack: () => void }) {
  const [view, setView] = useState<"detail" | "apply" | "success">("detail");
  const tc = typeColors[job.type];

  if (view === "success") {
    return (
      <div className="flex flex-col pb-10">
        {/* Keep the header so user can navigate back */}
        <div className="px-5 pt-12 pb-5 border-b border-border">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground text-sm" style={{ fontWeight: 600 }}>
            <ArrowLeft size={15} /> Projects
          </button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center py-20">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 16, stiffness: 260 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}>
            <Check size={40} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-foreground mb-2" style={{ fontSize: "24px", fontWeight: 800 }}>Application Sent!</h2>
            <p className="text-muted-foreground text-sm mb-2" style={{ lineHeight: 1.7, maxWidth: "270px" }}>
              Your application has been sent to <strong>{job.poster}</strong>.
            </p>
            <p className="text-muted-foreground text-sm mb-8" style={{ lineHeight: 1.7, maxWidth: "270px" }}>
              They'll review your details and reach out if it's a great fit. Keep an eye on your notifications.
            </p>
            {/* Poster card */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-border mb-8 text-left"
              style={{ background: "var(--brand-gradient-soft)" }}>
              <img src={job.posterAvatar} alt={job.poster}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                style={{ boxShadow: "0 0 0 2px var(--primary)" }} />
              <div>
                <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{job.poster}</p>
                <p className="text-muted-foreground text-xs">{job.posterRole}</p>
              </div>
            </div>
            <button onClick={onBack}
              className="w-full py-4 rounded-2xl text-white"
              style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
              Back to Projects
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-10 relative">
      <AnimatePresence>
        {view === "apply" && (
          <ApplicationForm
            job={job}
            onBack={() => setView("detail")}
            onSubmit={() => setView("success")}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-12 pb-5 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-5 text-muted-foreground text-sm"
          style={{ fontWeight: 600 }}
        >
          <ArrowLeft size={15} /> Projects
        </button>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            {job.urgent && (
              <span className="inline-block text-xs px-2.5 py-0.5 rounded-full mb-2"
                style={{ background: "rgba(232,54,92,0.1)", color: "var(--primary)", fontWeight: 700 }}>
                ⚡ Urgent
              </span>
            )}
            <h1 className="text-foreground mb-1" style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.2 }}>
              {job.title}
            </h1>
            <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: "14px" }}>{job.company}</p>
          </div>
          <span className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full"
            style={{ background: tc.bg, color: tc.color, fontWeight: 700 }}>
            {job.type}
          </span>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: MapPin,    text: job.remote === "Remote" ? "Remote" : `${job.remote} · ${job.location}` },
            { icon: DollarSign, text: job.rate || "Rate TBD" },
            { icon: Clock,     text: job.postedAt },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 500 }}>
              <Icon size={11} /> {text}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        {/* Posted by */}
        <div className="flex items-center gap-3 bg-card rounded-2xl p-4 border border-border">
          <img src={job.posterAvatar} alt={job.poster}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            style={{ boxShadow: "0 0 0 2px var(--primary)" }} />
          <div className="flex-1">
            <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{job.poster}</p>
            <p className="text-muted-foreground text-xs">{job.posterRole}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}>
            Member
          </span>
        </div>

        {/* Description */}
        <div>
          <p className="text-foreground mb-2" style={{ fontSize: "15px", fontWeight: 800 }}>About the role</p>
          <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.75 }}>{job.description}</p>
        </div>

        {/* Skills */}
        <div>
          <p className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 800 }}>Skills & experience</p>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full"
                style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}>
                <Check size={11} strokeWidth={2.5} /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* Trust note */}
        <div className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.18)" }}>
          <Sparkles size={14} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-muted-foreground text-xs" style={{ lineHeight: 1.7 }}>
            This is a member-to-member opportunity. Your application goes directly to {job.poster.split(" ")[0]} — no middlemen, no spam.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => setView("apply")}
          className="w-full py-4 rounded-2xl text-white text-sm flex items-center justify-center gap-2"
          style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}
        >
          <Briefcase size={17} /> Apply for This Role
        </button>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job, onSelect }: { job: Job; onSelect: () => void }) {
  const tc = typeColors[job.type];
  return (
    <div
      onClick={onSelect}
      className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer transition-all active:scale-99"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {/* Top accent bar */}
      {job.urgent && (
        <div className="h-0.5 w-full" style={{ background: "var(--brand-gradient)" }} />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {job.urgent && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(232,54,92,0.1)", color: "var(--primary)", fontWeight: 700, fontSize: "10px" }}>
                  ⚡ Urgent
                </span>
              )}
            </div>
            <h3 className="text-foreground mb-0.5" style={{ fontSize: "15px", fontWeight: 800, lineHeight: 1.3 }}>
              {job.title}
            </h3>
            <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "13px" }}>{job.company}</p>
          </div>
          <span className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full"
            style={{ background: tc.bg, color: tc.color, fontWeight: 700 }}>
            {job.type}
          </span>
        </div>

        {/* Description excerpt */}
        <p className="text-muted-foreground text-xs mb-3" style={{ lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 500 }}>
              {s}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 500 }}>
              +{job.skills.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={job.posterAvatar} alt={job.poster} className="w-6 h-6 rounded-full object-cover" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={10} /> {job.remote}</span>
              {job.rate && <span className="flex items-center gap-1"><DollarSign size={10} /> {job.rate}</span>}
            </div>
          </div>
          <span className="text-muted-foreground text-xs">{job.postedAt}</span>
        </div>
      </div>
    </div>
  );
}

// ─── JobsScreen ───────────────────────────────────────────────────────────────

export function JobsScreen() {
  const [selected, setSelected]   = useState<Job | null>(null);
  const [posting, setPosting]     = useState(false);
  const [category, setCategory]   = useState("All");
  const [search, setSearch]       = useState("");

  const filtered = jobs.filter((j) => {
    const matchCat = category === "All" || j.category === category;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  if (posting) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <AnimatePresence>
          <motion.div
            key="post-form"
            className="absolute inset-0 bg-background z-30 flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <PostJobForm onClose={() => setPosting(false)} onPosted={() => setPosting(false)} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="overflow-y-auto flex flex-col" style={{ scrollbarWidth: "none" }}>
        <JobDetail job={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 800 }}>Projects Board</h1>
            <p className="text-muted-foreground text-xs mt-0.5">{jobs.length} opportunities from members</p>
          </div>
          <button
            onClick={() => setPosting(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm"
            style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
          >
            <Plus size={15} /> Post Project
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-2.5 mb-3">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, skills, companies…"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const on = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  background: on ? "var(--brand-gradient)" : "var(--muted)",
                  color: on ? "#fff" : "var(--muted-foreground)",
                  fontWeight: on ? 700 : 500,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job list */}
      <div className="flex flex-col gap-3 px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No roles match your search.</p>
          </div>
        ) : (
          filtered.map((job) => (
            <JobCard key={job.id} job={job} onSelect={() => setSelected(job)} />
          ))
        )}
      </div>

      {/* Post CTA */}
      <div
        className="mx-5 mt-4 rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
        style={{ background: "var(--brand-gradient-soft)", border: "1px dashed var(--primary)" }}
        onClick={() => setPosting(true)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--brand-gradient)" }}>
          <Plus size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Have a project to fill?</p>
          <p className="text-muted-foreground text-xs">Post your opportunity to 2,400+ founders</p>
        </div>
        <ChevronRight size={16} style={{ color: "var(--primary)" }} />
      </div>
    </div>
  );
}
