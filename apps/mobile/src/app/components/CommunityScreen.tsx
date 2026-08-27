import {
  Heart, MessageCircle, Share2, Plus, Search, Bookmark, MoreHorizontal,
  TrendingUp, Image, Video, Hash, Tag, X, ExternalLink, ArrowLeft, Send,
  Flag, UserMinus, EyeOff, Copy, Check, ChevronRight, AtSign, Play,
} from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHANNELS = [
  { id: "Fundraising", emoji: "💰" },
  { id: "Growth",      emoji: "📈" },
  { id: "Product",     emoji: "🛠" },
  { id: "Culture",     emoji: "🌍" },
  { id: "Mindset",     emoji: "🧠" },
  { id: "Wins",        emoji: "🏆" },
];

const POPULAR_TAGS = ["startups", "founderlife", "growthhacking", "fundraising", "buildingpublic", "leadership", "mindset", "branding", "saas", "community"];

const ALL_FOUNDERS = [
  { id: 1, name: "Marcus Webb",    role: "Founder · Shift Capital",  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format" },
  { id: 2, name: "Jade Morales",   role: "Co-Founder · Aura Health",  avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format" },
  { id: 3, name: "Devon Achebe",   role: "Founder · Luminary AI",     avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format" },
  { id: 4, name: "Amara Osei",     role: "CEO · Brightly",            avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format" },
  { id: 5, name: "Morgan Blake",   role: "Co-Founder · Castwave",     avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format" },
  { id: 6, name: "Kai Oduya",      role: "Founder · Stackr",          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format" },
  { id: 7, name: "Priya Nair",     role: "CEO · Veda Labs",           avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&auto=format" },
];

const topics = ["All", ...CHANNELS.map((c) => c.id)];

interface Comment {
  id: number; author: string; avatar: string; role: string;
  time: string; text: string; likes: number; liked: boolean;
}

interface Founder { id: number; name: string; role: string; avatar: string; }

interface Post {
  id: number; author: string; avatar: string; role: string;
  time: string; topic: string; content: string;
  mediaUrl?: string; mediaType?: "image" | "video";
  link?: { url: string; title: string; description: string };
  hashtags: string[]; collaborators: Founder[];
  likes: number; comments: number; liked: boolean; saved: boolean; pinned: boolean;
  commentList: Comment[];
}

const initialPosts: Post[] = [
  {
    id: 1, author: "Marcus Webb",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    role: "Founder · Shift Capital", time: "2h ago", topic: "Fundraising",
    content: "Closed our Series A today. 18 months of NOs, 3 pivots, and one near-shutdown later — we did it. The lesson nobody tells you: investors aren't buying your deck, they're buying your conviction. Keep going. 🚀",
    hashtags: ["fundraising", "seriesa", "founderlife"], collaborators: [],
    likes: 214, comments: 3, liked: false, saved: false, pinned: false,
    commentList: [
      { id: 101, author: "Jade Morales", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format", role: "Co-Founder · Aura Health", time: "1h ago", text: "This is HUGE, Marcus. Conviction over everything. Congratulations!", likes: 14, liked: false },
      { id: 102, author: "Devon Achebe", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", role: "Founder · Luminary AI", time: "45m ago", text: "The 3 pivots thing hits hard. How did you stay sane through it?", likes: 8, liked: false },
      { id: 103, author: "Priscilla Ava", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", role: "CEO · Inspired Club", time: "20m ago", text: "Sharing this in the next Assembly. What a story. So proud of you! 🙌", likes: 22, liked: true },
    ],
  },
  {
    id: 2, author: "Jade Morales",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    role: "Co-Founder · Aura Health", time: "5h ago", topic: "Mindset",
    content: "A founder asked me this week: \"How do you stay motivated when nothing is working?\" My honest answer: I don't. I stay committed. Motivation is a feeling — it comes and goes. Commitment is a decision. Build systems around commitment, not mood.",
    mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop&auto=format",
    mediaType: "image",
    hashtags: ["mindset", "founderlife", "buildingpublic"], collaborators: [],
    likes: 389, comments: 2, liked: true, saved: true, pinned: true,
    commentList: [
      { id: 201, author: "Marcus Webb", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format", role: "Founder · Shift Capital", time: "4h ago", text: "\"Commitment is a decision\" — tattooing this on my brain.", likes: 31, liked: true },
      { id: 202, author: "Priscilla Ava", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", role: "CEO · Inspired Club", time: "3h ago", text: "This is one of the best things shared in the Club this year.", likes: 47, liked: false },
    ],
  },
  {
    id: 3, author: "Priscilla Ava",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    role: "CEO · Inspired Club", time: "1d ago", topic: "Growth",
    content: "We just hit 10,000 users without spending a dollar on paid ads. Here's exactly what we did:\n\n→ Identified 5 micro-communities where our users lived\n→ Showed up consistently (not just to promote)\n→ Turned our best users into advocates\n→ Built in public — every milestone shared\n\nCommunity-led growth is the most underrated playbook in 2026.",
    link: { url: "https://inspiredfounders.com", title: "Community-Led Growth Playbook", description: "The full breakdown of how we grew to 10k without paid ads." },
    hashtags: ["growthhacking", "community", "buildingpublic"],
    collaborators: [ALL_FOUNDERS[1]],
    likes: 512, comments: 1, liked: false, saved: false, pinned: false,
    commentList: [
      { id: 301, author: "Devon Achebe", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", role: "Founder · Luminary AI", time: "20h ago", text: "Which micro-community drove the most growth?", likes: 19, liked: false },
    ],
  },
  {
    id: 4, author: "Devon Achebe",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    role: "Founder · Luminary AI", time: "2d ago", topic: "Product",
    content: "Hot take: most founders are building features when they should be building conviction. Talk to 10 users before you write a single line of code this week. What did you hear? Drop it below 👇",
    hashtags: ["product", "startups"], collaborators: [],
    likes: 178, comments: 0, liked: false, saved: false, pinned: false,
    commentList: [],
  },
];

// ─── Link Preview ─────────────────────────────────────────────────────────────
function LinkPreview({ link }: { link: NonNullable<Post["link"]> }) {
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-2xl p-3 border border-border mt-3 active:opacity-80"
      style={{ background: "var(--muted)", display: "flex", textDecoration: "none" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--brand-gradient-soft)" }}>
        <ExternalLink size={16} style={{ color: "var(--primary)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-xs mb-0.5 truncate" style={{ fontWeight: 700 }}>{link.title}</p>
        <p className="text-muted-foreground text-xs" style={{ lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{link.description}</p>
        <p className="text-xs mt-1 truncate" style={{ color: "var(--primary)", fontWeight: 600 }}>{link.url}</p>
      </div>
    </a>
  );
}

// ─── Post Options Sheet ───────────────────────────────────────────────────────
function PostOptionsSheet({ isOwn, onClose, onDelete }: { isOwn: boolean; onClose: () => void; onDelete: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
        onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card border-t border-border"
        style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-4" />
        <div className="pb-8">
          {isOwn ? (
            <>
              <button onClick={onClose} className="w-full flex items-center gap-3 px-5 py-4 border-b border-border text-left">
                <Copy size={17} className="text-muted-foreground" />
                <span className="text-sm" style={{ fontWeight: 600, color: "var(--foreground)" }}>Copy link to post</span>
              </button>
              <button onClick={() => { onDelete(); onClose(); }} className="w-full flex items-center gap-3 px-5 py-4 text-left" style={{ color: "#e8365c" }}>
                <X size={17} /><span className="text-sm" style={{ fontWeight: 600 }}>Delete post</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="w-full flex items-center gap-3 px-5 py-4 border-b border-border text-left">
                <Copy size={17} className="text-muted-foreground" /><span className="text-sm" style={{ fontWeight: 600, color: "var(--foreground)" }}>Copy link to post</span>
              </button>
              <button onClick={onClose} className="w-full flex items-center gap-3 px-5 py-4 border-b border-border text-left">
                <EyeOff size={17} className="text-muted-foreground" /><span className="text-sm" style={{ fontWeight: 600, color: "var(--foreground)" }}>Hide this post</span>
              </button>
              <button onClick={onClose} className="w-full flex items-center gap-3 px-5 py-4 border-b border-border text-left">
                <UserMinus size={17} className="text-muted-foreground" /><span className="text-sm" style={{ fontWeight: 600, color: "var(--foreground)" }}>Unfollow this member</span>
              </button>
              <button onClick={onClose} className="w-full flex items-center gap-3 px-5 py-4 text-left" style={{ color: "#e8365c" }}>
                <Flag size={17} /><span className="text-sm" style={{ fontWeight: 600 }}>Report post</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Comment Thread ───────────────────────────────────────────────────────────
function CommentThread({ post, onClose, onAddComment }: {
  post: Post; onClose: () => void; onAddComment: (postId: number, text: string) => void;
}) {
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>(
    Object.fromEntries(post.commentList.map((c) => [c.id, c.liked]))
  );
  const [replyText, setReplyText] = useState("");

  const toggleCommentLike = (id: number) => setCommentLikes((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = () => {
    const t = replyText.trim();
    if (!t) return;
    onAddComment(post.id, t);
    setReplyText("");
  };

  return (
    <motion.div className="absolute inset-0 z-40 flex flex-col bg-background"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 300 }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border bg-card flex-shrink-0">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={16} className="text-muted-foreground" />
        </button>
        <h2 className="text-foreground text-sm" style={{ fontWeight: 800 }}>
          {post.comments} {post.comments === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 py-4 border-b border-border" style={{ background: "var(--muted)" }}>
          <div className="flex items-center gap-2.5 mb-2">
            <img src={post.avatar} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{post.author}</p>
              <p className="text-muted-foreground text-xs">{post.time}</p>
            </div>
          </div>
          <p className="text-foreground text-sm" style={{ lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {post.content.length > 180 ? post.content.slice(0, 180) + "…" : post.content}
          </p>
        </div>

        <div className="flex flex-col px-5 pt-4 pb-6 gap-5">
          {post.commentList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No comments yet.</p>
              <p className="text-muted-foreground text-xs mt-1">Be the first to respond.</p>
            </div>
          )}
          {post.commentList.map((comment) => {
            const liked = commentLikes[comment.id] ?? comment.liked;
            return (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.avatar} alt={comment.author} className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="rounded-2xl rounded-tl-sm p-3 border border-border" style={{ background: "var(--card)" }}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{comment.author}</p>
                      <p className="text-muted-foreground text-xs">{comment.role}</p>
                    </div>
                    <p className="text-foreground text-sm" style={{ lineHeight: 1.6 }}>{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 px-1">
                    <span className="text-muted-foreground text-xs">{comment.time}</span>
                    <button onClick={() => toggleCommentLike(comment.id)}
                      className="flex items-center gap-1 transition-all"
                      style={{ color: liked ? "var(--primary)" : "var(--muted-foreground)" }}>
                      <Heart size={13} fill={liked ? "var(--primary)" : "none"} />
                      <span className="text-xs" style={{ fontWeight: 600 }}>
                        {comment.likes + (liked && !comment.liked ? 1 : !liked && comment.liked ? -1 : 0)}
                      </span>
                    </button>
                    <button className="text-muted-foreground text-xs" style={{ fontWeight: 600 }}>Reply</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 px-5 py-3 border-t border-border bg-card flex items-center gap-3">
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"
          alt="You" className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          style={{ boxShadow: "0 0 0 2px var(--primary)" }} />
        <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-border" style={{ background: "var(--muted)" }}>
          <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Add a comment…"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
        </div>
        <button onClick={handleSubmit}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: replyText.trim() ? "var(--brand-gradient)" : "var(--muted)" }}>
          <Send size={15} style={{ color: replyText.trim() ? "#fff" : "var(--muted-foreground)", marginLeft: 1 }} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Founder Tag Search Sheet ─────────────────────────────────────────────────
function FounderTagSheet({ selected, onDone }: {
  selected: Founder[]; onDone: (founders: Founder[]) => void;
}) {
  const [q, setQ]             = useState("");
  const [picks, setPicks]     = useState<Founder[]>(selected);

  const results = q.length > 0
    ? ALL_FOUNDERS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()) || f.role.toLowerCase().includes(q.toLowerCase()))
    : ALL_FOUNDERS;

  const toggle = (f: Founder) => {
    setPicks((prev) => prev.find((p) => p.id === f.id) ? prev.filter((p) => p.id !== f.id) : [...prev, f]);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-50" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }}
        onClick={() => onDone(picks)} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border flex flex-col"
        style={{ maxHeight: "75%", boxShadow: "0 -12px 48px rgba(0,0,0,0.2)" }}>
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-3 flex-shrink-0" />
        <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0 border-b border-border">
          <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 800 }}>Tag & Collab</h3>
          <button onClick={() => onDone(picks)}
            className="px-4 py-1.5 rounded-xl text-white text-sm"
            style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
            Done {picks.length > 0 && `(${picks.length})`}
          </button>
        </div>
        <div className="px-5 pt-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-2.5 border border-border">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search founders…"
              autoFocus className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
        {picks.length > 0 && (
          <div className="flex gap-2 px-5 py-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
            {picks.map((f) => (
              <div key={f.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.2)" }}>
                <img src={f.avatar} alt={f.name} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-xs" style={{ color: "var(--primary)", fontWeight: 700 }}>{f.name.split(" ")[0]}</span>
                <button onClick={() => toggle(f)}><X size={11} style={{ color: "var(--primary)" }} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-2" style={{ scrollbarWidth: "none" }}>
          {results.map((f) => {
            const selected = !!picks.find((p) => p.id === f.id);
            return (
              <button key={f.id} onClick={() => toggle(f)}
                className="w-full flex items-center gap-3 py-3 border-b border-border text-left last:border-0">
                <div className="relative">
                  <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                  {selected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--brand-gradient)" }}>
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm" style={{ fontWeight: selected ? 700 : 500 }}>{f.name}</p>
                  <p className="text-muted-foreground text-xs">{f.role}</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: selected ? "var(--primary)" : "var(--border)", background: selected ? "var(--primary)" : "transparent" }}>
                  {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// ─── Bottom Sheet Panel (reusable) ───────────────────────────────────────────
function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-50" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
        onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-border flex flex-col"
        style={{ background: "var(--card)", maxHeight: "70%", boxShadow: "0 -16px 48px rgba(0,0,0,0.18)" }}>
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-0 flex-shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>{title}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>
          {children}
        </div>
      </motion.div>
    </>
  );
}

// ─── Full-Page Post Composer ──────────────────────────────────────────────────
type ActiveSheet = "none" | "media" | "hashtags" | "channel" | "collab";

function PostComposer({ onClose, onPost }: { onClose: () => void; onPost: (post: Post) => void }) {
  const [text, setText]                   = useState("");
  const [channel, setChannel]             = useState("");
  const [mediaUrl, setMediaUrl]           = useState("");
  const [mediaType, setMediaType]         = useState<"image" | "video">("image");
  const [mediaFile, setMediaFile]         = useState<File | null>(null);
  const photoInputRef                     = useRef<HTMLInputElement>(null);
  const videoInputRef                     = useRef<HTMLInputElement>(null);
  const [activeSheet, setActiveSheet]     = useState<ActiveSheet>("none");
  const [hashtags, setHashtags]           = useState<string[]>([]);
  const [tagInput, setTagInput]           = useState("");
  const [collaborators, setCollaborators] = useState<Founder[]>([]);
  const textRef                           = useRef<HTMLTextAreaElement>(null);

  const canPost  = text.trim().length > 0 && channel !== "";
  const charLeft = 500 - text.length;

  const openSheet  = (s: ActiveSheet) => setActiveSheet(s);
  const closeSheet = () => setActiveSheet("none");

  const addHashtag = (raw: string) => {
    const tag = raw.replace(/^#/, "").replace(/\s+/g, "").toLowerCase();
    if (tag && !hashtags.includes(tag)) setHashtags((p) => [...p, tag]);
    setTagInput("");
  };
  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(e.key)) { e.preventDefault(); addHashtag(tagInput); }
    if (e.key === "Backspace" && !tagInput && hashtags.length) setHashtags((p) => p.slice(0, -1));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    const objectUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaUrl(objectUrl);
    setMediaType(type);
    closeSheet();
    e.target.value = "";
  };

  const clearMedia = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl("");
    setMediaFile(null);
  };
  const handleSubmit = () => {
    if (!canPost) return;
    onPost({
      id: Date.now(), author: "Priscilla Ava",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
      role: "CEO · Inspired Club", time: "Just now", topic: channel, content: text,
      mediaUrl: mediaUrl || undefined, mediaType: mediaUrl ? mediaType : undefined,
      hashtags, collaborators,
      likes: 0, comments: 0, liked: false, saved: false, pinned: false, commentList: [],
    });
    onClose();
  };

  return (
    <motion.div className="absolute inset-0 z-40 flex flex-col bg-background"
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-12 pb-3 border-b border-border bg-card">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <X size={17} className="text-muted-foreground" />
        </button>
        <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>New Post</p>
        <button onClick={handleSubmit} disabled={!canPost}
          className="px-5 py-2 rounded-2xl text-sm transition-all active:scale-95"
          style={{ background: canPost ? "var(--brand-gradient)" : "var(--muted)", color: canPost ? "#fff" : "var(--muted-foreground)", fontWeight: 700, boxShadow: canPost ? "var(--shadow-brand)" : "none" }}>
          Share
        </button>
      </div>

      {/* ── Body: author row + text area + attachments ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

        {/* Author + channel */}
        <div className="flex items-start gap-3 px-4 pt-5 pb-3">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"
            alt="You" className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            style={{ boxShadow: "0 0 0 2.5px var(--primary), 0 0 0 4px var(--background)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-foreground mb-1.5" style={{ fontWeight: 800, fontSize: "15px" }}>
              Priscilla Ava
              {collaborators.length > 0 && (
                <span className="text-muted-foreground" style={{ fontWeight: 400 }}>
                  {" "}with {collaborators.map((c) => c.name.split(" ")[0]).join(" & ")}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Channel pill */}
              <button onClick={() => openSheet("channel")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  background: channel ? "var(--brand-gradient)" : "var(--muted)",
                  color: channel ? "#fff" : "var(--muted-foreground)",
                  fontWeight: 700,
                  border: channel ? "none" : "1.5px dashed var(--border)",
                }}>
                {channel
                  ? <>{CHANNELS.find((c) => c.id === channel)?.emoji} {channel}</>
                  : <><Plus size={11} /> Channel</>}
              </button>
              {/* Collaborator chips */}
              {collaborators.map((f) => (
                <div key={f.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                  style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.25)" }}>
                  <img src={f.avatar} alt={f.name} className="w-4 h-4 rounded-full object-cover" />
                  <span style={{ color: "var(--primary)", fontWeight: 700 }}>@{f.name.split(" ")[0]}</span>
                  <button onClick={() => setCollaborators((p) => p.filter((c) => c.id !== f.id))}>
                    <X size={10} style={{ color: "var(--primary)" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mx-4" style={{ background: "var(--border)" }} />

        {/* Text area — grows with content */}
        <div className="px-4 pt-4">
          <textarea ref={textRef} value={text}
            onChange={(e) => {
              setText(e.target.value);
              // auto-resize
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            placeholder="What's on your mind, founder?"
            autoFocus
            rows={4}
            className="w-full bg-transparent text-foreground outline-none resize-none placeholder:text-muted-foreground"
            style={{ fontSize: "16px", lineHeight: 1.7, fontWeight: 400, overflow: "hidden" }} />
        </div>

        {/* Inline hashtag display */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {hashtags.map((tag) => (
              <button key={tag} onClick={() => setHashtags((p) => p.filter((t) => t !== tag))}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: "var(--brand-gradient)", color: "#fff", fontWeight: 700 }}>
                #{tag} <X size={9} className="text-white/70" />
              </button>
            ))}
            <button onClick={() => openSheet("hashtags")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-border"
              style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>
              <Plus size={10} /> tag
            </button>
          </div>
        )}

        {/* Media preview */}
        <AnimatePresence>
          {mediaUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              className="mx-4 mb-4 rounded-2xl overflow-hidden relative">
              {mediaType === "image" ? (
                <img src={mediaUrl} alt="Media" className="w-full object-cover rounded-2xl"
                  style={{ maxHeight: "280px" }} onError={() => setMediaUrl("")} />
              ) : (
                <div className="w-full rounded-2xl flex flex-col items-center justify-center gap-3"
                  style={{ height: "160px", background: "#0a0710" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "var(--brand-gradient)" }}>
                    <Play size={20} className="text-white" style={{ marginLeft: 2 }} />
                  </div>
                  <p className="text-white/50 text-xs">{mediaFile?.name ?? "Video attached"}</p>
                </div>
              )}
              <button onClick={clearMedia}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
                <X size={14} className="text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-2" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-card border-t border-border">
        {/* Char counter bar */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, (text.length / 500) * 100)}%`, background: charLeft < 100 ? "#e8365c" : "var(--brand-gradient)" }} />
          </div>
          <span className="text-xs w-8 text-right flex-shrink-0"
            style={{ color: charLeft < 50 ? "#e8365c" : "var(--muted-foreground)", fontWeight: 600 }}>
            {charLeft < 100 ? charLeft : ""}
          </span>
        </div>

        {/* 5 tool buttons */}
        <div className="flex items-center px-1 pb-5">

          {/* Hidden file inputs */}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange(e, "image")} />
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => handleFileChange(e, "video")} />

          <button onClick={() => photoInputRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-colors"
            style={{ color: mediaUrl && mediaType === "image" ? "var(--primary)" : "var(--muted-foreground)" }}>
            <div className="relative">
              <Image size={23} strokeWidth={1.7} />
              {mediaUrl && mediaType === "image" && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />
              )}
            </div>
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Photo</span>
          </button>

          <button onClick={() => videoInputRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-colors"
            style={{ color: mediaUrl && mediaType === "video" ? "var(--primary)" : "var(--muted-foreground)" }}>
            <div className="relative">
              <Video size={23} strokeWidth={1.7} />
              {mediaUrl && mediaType === "video" && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />
              )}
            </div>
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Video</span>
          </button>

          <button onClick={() => openSheet("hashtags")}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-colors"
            style={{ color: hashtags.length > 0 ? "var(--primary)" : "var(--muted-foreground)" }}>
            <div className="relative">
              <Hash size={23} strokeWidth={1.7} />
              {hashtags.length > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "var(--primary)" }}>
                  <span className="text-white" style={{ fontSize: "8px", fontWeight: 800 }}>{hashtags.length}</span>
                </div>
              )}
            </div>
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Tags</span>
          </button>

          <button onClick={() => openSheet("channel")}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-colors"
            style={{ color: channel ? "var(--primary)" : "var(--muted-foreground)" }}>
            <div className="relative" style={{ height: 23, width: 23, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {channel
                ? <span style={{ fontSize: "20px", lineHeight: 1 }}>{CHANNELS.find((c) => c.id === channel)?.emoji}</span>
                : <Tag size={23} strokeWidth={1.7} />}
              {channel && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />
              )}
            </div>
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Channel</span>
          </button>

          <button onClick={() => openSheet("collab")}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-colors"
            style={{ color: collaborators.length > 0 ? "var(--primary)" : "var(--muted-foreground)" }}>
            <div className="relative">
              <AtSign size={23} strokeWidth={1.7} />
              {collaborators.length > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "var(--primary)" }}>
                  <span className="text-white" style={{ fontSize: "8px", fontWeight: 800 }}>{collaborators.length}</span>
                </div>
              )}
            </div>
            <span style={{ fontSize: "10px", fontWeight: 600 }}>Collab</span>
          </button>
        </div>
      </div>

      {/* ── Bottom sheets ── */}
      <AnimatePresence>
        {activeSheet === "channel" && (
          <BottomSheet title="Post to Channel" onClose={closeSheet}>
            <div className="grid grid-cols-3 gap-3">
              {CHANNELS.map((c) => {
                const active = channel === c.id;
                return (
                  <button key={c.id} onClick={() => { setChannel(c.id); closeSheet(); }}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all"
                    style={{ background: active ? "var(--brand-gradient-soft)" : "var(--muted)", borderColor: active ? "var(--primary)" : "transparent" }}>
                    <span style={{ fontSize: "26px" }}>{c.emoji}</span>
                    <span className="text-xs" style={{ color: active ? "var(--primary)" : "var(--muted-foreground)", fontWeight: active ? 700 : 500 }}>{c.id}</span>
                    {active && <Check size={13} style={{ color: "var(--primary)" }} />}
                  </button>
                );
              })}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSheet === "media" && (
          <BottomSheet title="Add Media" onClose={closeSheet}>
            <div className="flex flex-col gap-3">
              {/* Photo option */}
              <button onClick={() => { closeSheet(); setTimeout(() => photoInputRef.current?.click(), 120); }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border transition-all active:scale-[0.98]"
                style={{ background: "var(--muted)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}>
                  <Image size={22} className="text-white" strokeWidth={1.8} />
                </div>
                <div className="text-left">
                  <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Photo</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Choose from your camera roll</p>
                </div>
              </button>

              {/* Video option */}
              <button onClick={() => { closeSheet(); setTimeout(() => videoInputRef.current?.click(), 120); }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border transition-all active:scale-[0.98]"
                style={{ background: "var(--muted)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                  <Video size={22} className="text-white" strokeWidth={1.8} />
                </div>
                <div className="text-left">
                  <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Video</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Choose a video from your device</p>
                </div>
              </button>

              {/* Current media preview if set */}
              {mediaUrl && (
                <div className="mt-1 rounded-2xl overflow-hidden relative">
                  {mediaType === "image"
                    ? <img src={mediaUrl} alt="Selected" className="w-full object-cover rounded-2xl" style={{ maxHeight: "160px" }} />
                    : <div className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 h-24" style={{ background: "#0a0710" }}>
                        <Play size={24} className="text-white/70" />
                        <p className="text-white/50 text-xs">{mediaFile?.name ?? "Video selected"}</p>
                      </div>}
                  <button onClick={() => { clearMedia(); closeSheet(); }}
                    className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontWeight: 600, backdropFilter: "blur(4px)" }}>
                    <X size={11} /> Remove
                  </button>
                </div>
              )}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSheet === "hashtags" && (
          <BottomSheet title="Hashtags" onClose={closeSheet}>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-border mb-4"
              style={{ background: "var(--muted)", minHeight: "52px" }}>
              {hashtags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: "var(--brand-gradient)", color: "#fff", fontWeight: 700 }}>
                  #{tag}
                  <button onClick={() => setHashtags((p) => p.filter((t) => t !== tag))}>
                    <X size={10} className="text-white/70" />
                  </button>
                </div>
              ))}
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder={hashtags.length === 0 ? "Type a hashtag and press space…" : "Add another…"}
                autoFocus
                className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground flex-1 min-w-28" />
            </div>
            <p className="text-muted-foreground text-xs mb-3" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>POPULAR TAGS</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.filter((t) => !hashtags.includes(t)).map((tag) => (
                <button key={tag} onClick={() => addHashtag(tag)}
                  className="px-3 py-2 rounded-full text-xs border border-border transition-all active:scale-95"
                  style={{ background: "var(--background)", color: "var(--muted-foreground)", fontWeight: 600 }}>
                  #{tag}
                </button>
              ))}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSheet === "collab" && (
          <FounderTagSheet
            selected={collaborators}
            onDone={(picks) => { setCollaborators(picks); closeSheet(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── CommunityScreen ──────────────────────────────────────────────────────────
export function CommunityScreen() {
  const [activeTopic, setActiveTopic]       = useState("All");
  const [posts, setPosts]                   = useState<Post[]>(initialPosts);
  const [postLikes, setPostLikes]           = useState<Record<number, boolean>>(
    Object.fromEntries(initialPosts.map((p) => [p.id, p.liked]))
  );
  const [postSaved, setPostSaved]           = useState<Record<number, boolean>>(
    Object.fromEntries(initialPosts.map((p) => [p.id, p.saved]))
  );
  const [composing, setComposing]           = useState(false);
  const [threadPost, setThreadPost]         = useState<Post | null>(null);
  const [optionsPostId, setOptionsPostId]   = useState<number | null>(null);

  const filtered = activeTopic === "All" ? posts : posts.filter((p) => p.topic === activeTopic);

  const toggleLike = (id: number) => setPostLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSave = (id: number) => setPostSaved((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setPostLikes((prev) => ({ ...prev, [post.id]: false }));
    setPostSaved((prev) => ({ ...prev, [post.id]: false }));
  };

  const handleDeletePost = (id: number) => setPosts((prev) => prev.filter((p) => p.id !== id));

  const handleAddComment = (postId: number, text: string) => {
    const newComment: Comment = {
      id: Date.now(), author: "Priscilla Ava",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
      role: "CEO · Inspired Club", time: "Just now", text, likes: 0, liked: false,
    };
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comments: p.comments + 1, commentList: [...p.commentList, newComment] } : p
    ));
    setThreadPost((prev) => prev?.id === postId
      ? { ...prev, comments: prev.comments + 1, commentList: [...prev.commentList, newComment] }
      : prev
    );
  };

  const optionsPost = optionsPostId != null ? posts.find((p) => p.id === optionsPostId) : null;

  return (
    <div className="flex flex-col pb-4 relative">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground" style={{ fontSize: "20px", fontWeight: 800 }}>Community</h2>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Search size={16} className="text-muted-foreground" />
            </button>
            <button onClick={() => setComposing(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--brand-gradient)" }}>
              <Plus size={16} className="text-white" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-2xl px-3 py-2 w-fit">
          <TrendingUp size={13} style={{ color: "var(--primary)" }} />
          <span className="text-xs text-muted-foreground">
            <span style={{ color: "var(--foreground)", fontWeight: 700 }}>47 posts</span> this week
          </span>
        </div>
      </div>

      {/* Topic filter */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {topics.map((t) => (
          <button key={t} onClick={() => setActiveTopic(t)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all"
            style={{ background: activeTopic === t ? "var(--brand-gradient)" : "var(--muted)", color: activeTopic === t ? "#fff" : "var(--muted-foreground)", fontWeight: activeTopic === t ? 700 : 500 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Prompt bar */}
      <div className="px-5 mb-4">
        <button onClick={() => setComposing(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
          style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}>
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"
            alt="You" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          <span className="text-muted-foreground text-sm flex-1">Share something with the Club…</span>
          <div className="flex items-center gap-2">
            <Image size={15} className="text-muted-foreground" />
            <Hash size={15} className="text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-3 px-5">
        {filtered.map((post) => {
          const liked = postLikes[post.id] ?? post.liked;
          const saved = postSaved[post.id] ?? post.saved;
          return (
            <div key={post.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {post.pinned && (
                <div className="px-4 pt-2.5 pb-0">
                  <span className="text-xs" style={{ color: "var(--primary)", fontWeight: 700 }}>📌 Pinned</span>
                </div>
              )}
              <div className="p-4">
                {/* Author row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>
                        {post.author}
                        {post.collaborators.length > 0 && (
                          <span className="text-muted-foreground font-normal"> · with {post.collaborators.map((c) => c.name.split(" ")[0]).join(" & ")}</span>
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs">{post.role} · {post.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}>
                      {post.topic}
                    </span>
                    <button onClick={() => setOptionsPostId(post.id)}>
                      <MoreHorizontal size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-foreground text-sm" style={{ lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {post.content}
                </p>

                {/* Media */}
                {post.mediaUrl && post.mediaType === "image" && (
                  <div className="mt-3 rounded-2xl overflow-hidden">
                    <img src={post.mediaUrl} alt="Post media" className="w-full object-cover" style={{ maxHeight: "220px" }} />
                  </div>
                )}
                {post.mediaUrl && post.mediaType === "video" && (
                  <div className="mt-3 rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{ height: "140px", background: "#0a0710" }}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                        <Play size={20} className="text-white" style={{ marginLeft: 2 }} />
                      </div>
                      <p className="text-white/60 text-xs">Video</p>
                    </div>
                  </div>
                )}

                {/* Link */}
                {post.link && <LinkPreview link={post.link} />}

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <p className="mt-2.5 text-xs" style={{ color: "var(--primary)", fontWeight: 600, lineHeight: 1.8 }}>
                    {post.hashtags.map((t) => `#${t}`).join(" ")}
                  </p>
                )}

                {/* Collaborator strip */}
                {post.collaborators.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl"
                    style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.15)" }}>
                    <div className="flex -space-x-1.5">
                      <img src={post.avatar} alt={post.author} className="w-6 h-6 rounded-full object-cover border-2 border-background" />
                      {post.collaborators.map((c) => (
                        <img key={c.id} src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover border-2 border-background" />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>
                      Collab post with {post.collaborators.map((c) => c.name).join(" & ")}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 transition-all"
                      style={{ color: liked ? "var(--primary)" : "var(--muted-foreground)" }}>
                      <Heart size={17} fill={liked ? "var(--primary)" : "none"} />
                      <span className="text-xs" style={{ fontWeight: 600 }}>
                        {post.likes + (liked && !post.liked ? 1 : !liked && post.liked ? -1 : 0)}
                      </span>
                    </button>
                    <button onClick={() => setThreadPost(post)} className="flex items-center gap-1.5 text-muted-foreground active:scale-95">
                      <MessageCircle size={17} />
                      <span className="text-xs" style={{ fontWeight: 600 }}>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted-foreground">
                      <Share2 size={17} />
                    </button>
                  </div>
                  <button onClick={() => toggleSave(post.id)} style={{ color: saved ? "var(--primary)" : "var(--muted-foreground)" }}>
                    <Bookmark size={17} fill={saved ? "var(--primary)" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {composing && <PostComposer onClose={() => setComposing(false)} onPost={handleNewPost} />}
      </AnimatePresence>
      <AnimatePresence>
        {threadPost && <CommentThread post={threadPost} onClose={() => setThreadPost(null)} onAddComment={handleAddComment} />}
      </AnimatePresence>
      <AnimatePresence>
        {optionsPost && (
          <PostOptionsSheet isOwn={optionsPost.author === "Priscilla Ava"}
            onClose={() => setOptionsPostId(null)} onDelete={() => handleDeletePost(optionsPost.id)} />
        )}
      </AnimatePresence>
    </div>
  );
}
