import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

// ─── Topics ───────────────────────────────────────────────────────────────────

const topics = [
  { id: "business",  label: "My Business",  emoji: "✦" },
  { id: "identity",  label: "My Identity",  emoji: "✦" },
  { id: "vision",    label: "My Vision",    emoji: "✦" },
  { id: "content",   label: "My Content",   emoji: "✦" },
  { id: "mindset",   label: "My Mindset",   emoji: "✦" },
  { id: "goals",     label: "My Goals",     emoji: "✦" },
  { id: "nextstep",  label: "My Next Step", emoji: "✦" },
] as const;

type TopicId = typeof topics[number]["id"];

// ─── Muse opening messages ────────────────────────────────────────────────────

const openingMessages: Record<TopicId, string> = {
  business:  "Let's explore what's alive in your business right now. What's something that's been sitting with you — a challenge you haven't been able to shake, or something exciting that's just beginning to take shape?",
  identity:  "Your identity is the foundation everything else is built on. In this season of your founder journey — who are you showing up as, and who are you still in the process of becoming?",
  vision:    "Vision is the north star that carries you through the hard days. If you could paint a picture of your business and life twelve months from now — what does it look, feel, and sound like?",
  content:   "Great content starts with a clear point of view. Tell me about the person you most want to reach — what do they quietly struggle with, and what do you want them to feel after encountering your work?",
  mindset:   "Mindset is where every business is first won or lost. What's a belief or story you've been carrying lately — about your capability, your timing, or what's truly possible for you?",
  goals:     "Clarity on a single goal can change everything. What's the one thing — if you achieved it in the next 90 days — that would feel like a real breakthrough for you?",
  nextstep:  "Sometimes the path forward is clearer than we let ourselves admit. What's the one action you've been circling around, that you know at some level is ready to be taken?",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "muse" | "user";
  text: string;
  timestamp: Date;
}

interface Props {
  onClose: () => void;
}

// ─── Muse Avatar ─────────────────────────────────────────────────────────────

function MuseAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #f07832 0%, #e8365c 50%, #7b4ec8 100%)",
        boxShadow: "0 4px 20px rgba(232,54,92,0.4)",
      }}
    >
      <Sparkles size={size * 0.42} className="text-white" strokeWidth={1.8} />
    </div>
  );
}

// ─── Explore Phase ────────────────────────────────────────────────────────────

function ExplorePhase({ onTopicSelect, onClose }: { onTopicSelect: (id: TopicId) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: "#0a0710" }}>

      {/* Ambient gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: "120%", height: "60%",
          background: "radial-gradient(ellipse at 50% 0%, rgba(240,120,50,0.18) 0%, rgba(232,54,92,0.12) 35%, rgba(123,78,200,0.06) 60%, transparent 80%)",
        }} />
        <div style={{
          position: "absolute", bottom: "0", left: "0", right: "0", height: "40%",
          background: "radial-gradient(ellipse at 30% 100%, rgba(123,78,200,0.12) 0%, transparent 65%)",
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <ArrowLeft size={17} className="text-white/70" />
        </button>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
            MEET MUSE
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-10" style={{ scrollbarWidth: "none" }}>

        {/* Muse hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-10"
        >
          {/* Avatar with pulse ring */}
          <div className="relative mb-5">
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.08, 0.3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #f07832, #e8365c, #7b4ec8)", filter: "blur(16px)" }}
            />
            <MuseAvatar size={68} />
          </div>

          <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#ffffff" }}>
            Muse
          </h1>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.4)", marginTop: "8px", lineHeight: 1.6, maxWidth: "240px" }}>
            Your personal guide inside<br />The Inspired Club
          </p>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mb-7 text-center"
        >
          <p style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3, color: "#ffffff" }}>
            What would you like<br />to explore today?
          </p>
        </motion.div>

        {/* Topics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col gap-2.5"
        >
          {topics.map((topic, i) => (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.07, ease: "easeOut" }}
              onClick={() => onTopicSelect(topic.id)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-98"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <span style={{ fontSize: "14px", color: "rgba(232,54,92,0.9)" }}>✦</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                {topic.label}
              </span>
              <div className="ml-auto" style={{ color: "rgba(255,255,255,0.2)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-center mt-8"
          style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}
        >
          Muse is here whenever you need her —<br />guiding you back to your vision.
        </motion.p>
      </div>
    </div>
  );
}

// ─── Chat Phase ───────────────────────────────────────────────────────────────

function ChatPhase({
  topic,
  onBack,
  onClose,
}: {
  topic: TopicId;
  onBack: () => void;
  onClose: () => void;
}) {
  const topicLabel = topics.find((t) => t.id === topic)?.label ?? "";

  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Muse types her opening message on mount
  useEffect(() => {
    setIsTyping(true);
    const t = setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        id: "open",
        role: "muse",
        text: openingMessages[topic],
        timestamp: new Date(),
      }]);
    }, 1200);
    return () => clearTimeout(t);
  }, [topic]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsTyping(true);

    try {
      const { supabase } = await import("../../lib/supabase");
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const { data: { session } } = await supabase.auth.getSession();
      const apiMessages = updated
        .filter((m) => m.id !== "open")
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch(`${supabaseUrl}/functions/v1/muse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          messages: apiMessages,
          context: { topic: topicLabel },
        }),
      });

      const json = await res.json();
      const reply = json.reply ?? "I'm here — tell me more.";
      setMessages((prev) => [...prev, {
        id: `m-${Date.now()}`,
        role: "muse",
        text: reply,
        timestamp: new Date(),
      }]);
    } catch {
      // Fallback to a graceful error message
      setMessages((prev) => [...prev, {
        id: `m-err-${Date.now()}`,
        role: "muse",
        text: "Something interrupted us — check your connection and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#0a0710" }}>

      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(232,54,92,0.12) 0%, rgba(123,78,200,0.06) 50%, transparent 80%)",
      }} />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 px-5 pt-14 pb-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <ArrowLeft size={17} className="text-white/70" />
        </button>

        <MuseAvatar size={36} />

        <div className="flex-1 min-w-0">
          <p style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>Muse</p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{topicLabel}</p>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: "none" }}>

        {/* Muse intro card at top */}
        <div className="flex flex-col items-center mb-8">
          <MuseAvatar size={48} />
          <p className="mt-3" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)" }}>
            MUSE · YOUR GUIDE
          </p>
          <p className="mt-1 text-center" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", lineHeight: 1.6, maxWidth: "220px" }}>
            Drawing on the philosophy and frameworks of Inspired Founders
          </p>
        </div>

        {/* Message bubbles */}
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "muse" && <MuseAvatar size={30} />}

                <div
                  className="max-w-[78%] rounded-2xl px-4 py-3"
                  style={msg.role === "muse" ? {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderTopLeftRadius: "6px",
                  } : {
                    background: "linear-gradient(135deg, #f07832 0%, #e8365c 100%)",
                    borderTopRightRadius: "6px",
                  }}
                >
                  <p style={{
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: msg.role === "muse" ? "rgba(255,255,255,0.82)" : "#ffffff",
                    fontWeight: msg.role === "muse" ? 400 : 500,
                  }}>
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-end gap-3"
              >
                <MuseAvatar size={30} />
                <div
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderTopLeftRadius: "6px" }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      style={{ display: "block", width: "6px", height: "6px", borderRadius: "50%", background: "rgba(232,54,92,0.7)" }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="relative z-10 flex-shrink-0 px-4 pb-8 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Share what's on your mind…"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none"
            style={{
              fontSize: "14px",
              lineHeight: 1.5,
              color: "#ffffff",
              fontWeight: 400,
              maxHeight: "100px",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: input.trim() ? "linear-gradient(135deg, #f07832 0%, #e8365c 100%)" : "rgba(255,255,255,0.08)",
              opacity: input.trim() ? 1 : 0.5,
            }}
          >
            <Send size={14} className="text-white" style={{ marginLeft: "1px", marginBottom: "1px" }} />
          </button>
        </div>
        <p className="text-center mt-2" style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)" }}>
          Muse is an AI guide. Not a substitute for professional advice.
        </p>
      </div>
    </div>
  );
}

// ─── MuseScreen ───────────────────────────────────────────────────────────────

export function MuseScreen({ onClose }: Props) {
  const [phase, setPhase]           = useState<"explore" | "chat">("explore");
  const [selectedTopic, setTopic]   = useState<TopicId | null>(null);

  const handleTopicSelect = (id: TopicId) => {
    setTopic(id);
    setPhase("chat");
  };

  return (
    <motion.div
      className="absolute inset-0 z-50"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 300 }}
    >
      <AnimatePresence mode="wait">
        {phase === "explore" ? (
          <motion.div
            key="explore"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <ExplorePhase onTopicSelect={handleTopicSelect} onClose={onClose} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            className="absolute inset-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <ChatPhase
              topic={selectedTopic!}
              onBack={() => setPhase("explore")}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
