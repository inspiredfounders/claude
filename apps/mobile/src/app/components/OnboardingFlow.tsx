import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Camera, MapPin, Check, ArrowLeft, Eye, EyeOff } from "lucide-react";
import northStarIcon from "../../imports/InspiredFounders_NorthStarIcon_White.png";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = "create-account" | "interests" | "founder-profile";

interface OnboardingData {
  name: string;
  email: string;
  password: string;
  interests: string[];
  company: string;
  stage: string;
  location: string;
  bio: string;
  avatarPreview: string | null;
}

const STEPS: Step[] = ["create-account", "interests", "founder-profile"];

const INTERESTS = [
  { id: "branding",       label: "Branding",        emoji: "✦" },
  { id: "marketing",      label: "Marketing",        emoji: "📣" },
  { id: "leadership",     label: "Leadership",       emoji: "👑" },
  { id: "ai",             label: "AI",               emoji: "⚡" },
  { id: "ecommerce",      label: "Ecommerce",        emoji: "🛒" },
  { id: "personal-brand", label: "Personal Brand",   emoji: "🌟" },
  { id: "mindset",        label: "Mindset",          emoji: "🧠" },
];

const STAGES = [
  { id: "idea",   label: "Idea Stage",    sub: "Still validating" },
  { id: "early",  label: "Early Stage",   sub: "Pre-revenue or <$1M ARR" },
  { id: "growth", label: "Growth Stage",  sub: "$1M–$10M ARR" },
  { id: "scale",  label: "Scale Stage",   sub: "$10M+ ARR" },
];

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format",
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? "24px" : "6px",
            height: "6px",
            background: i <= current ? "var(--primary)" : "rgba(255,255,255,0.3)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Create Account ───────────────────────────────────────────────────
function CreateAccount({
  data, onChange, onNext,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const valid = data.name.trim().length > 1 && data.email.includes("@") && data.password.length >= 6;

  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-8">
      <h2 className="text-white mb-1" style={{ fontSize: "26px", fontWeight: 800 }}>
        Create your account
      </h2>
      <p className="text-white/50 text-sm mb-8">Join 2,400+ founders already inside.</p>

      <div className="flex flex-col gap-4 mb-6">
        {/* Full Name */}
        <div>
          <label className="text-white/60 text-xs mb-1.5 block" style={{ fontWeight: 600 }}>Full Name</label>
          <input
            type="text"
            placeholder="e.g. Priscilla Ava"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl text-white outline-none text-sm"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 500,
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-white/60 text-xs mb-1.5 block" style={{ fontWeight: 600 }}>Email</label>
          <input
            type="email"
            placeholder="you@yourstartup.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl text-white outline-none text-sm"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 500,
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-white/60 text-xs mb-1.5 block" style={{ fontWeight: 600 }}>Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl text-white outline-none text-sm pr-12"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontWeight: 500,
              }}
            />
            <button
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        <span className="text-white/30 text-xs">or continue with</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
      </div>

      {/* Social */}
      <div className="flex gap-3 mb-8">
        {["Google", "Apple"].map((provider) => (
          <button
            key={provider}
            onClick={onNext}
            className="flex-1 py-3 rounded-2xl text-white text-sm"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontWeight: 600 }}
          >
            {provider}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-4 rounded-2xl text-white text-sm flex items-center justify-center gap-2 transition-opacity"
        style={{ background: "var(--brand-gradient)", fontWeight: 700, opacity: valid ? 1 : 0.4 }}
      >
        Continue <ChevronRight size={17} />
      </button>

      <p className="text-white/30 text-xs text-center mt-4">
        By continuing you agree to our Terms & Privacy Policy
      </p>
    </div>
  );
}

// ─── Step 2: Choose Interests ─────────────────────────────────────────────────
function ChooseInterests({
  data, onChange, onNext, onBack,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggle = (id: string) => {
    const next = data.interests.includes(id)
      ? data.interests.filter((i) => i !== id)
      : [...data.interests, id];
    onChange({ interests: next });
  };
  const valid = data.interests.length >= 2;

  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 text-sm mb-6" style={{ fontWeight: 600 }}>
        <ArrowLeft size={14} />
      </button>

      <h2 className="text-white mb-1" style={{ fontSize: "26px", fontWeight: 800 }}>
        What are you into?
      </h2>
      <p className="text-white/50 text-sm mb-8">
        Pick your focus areas — we'll tailor your experience. Choose at least 2.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {INTERESTS.map((interest) => {
          const selected = data.interests.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              className="relative rounded-2xl p-4 text-left transition-all"
              style={{
                background: selected ? "rgba(255,95,109,0.2)" : "rgba(255,255,255,0.07)",
                border: selected ? "1.5px solid var(--primary)" : "1.5px solid rgba(255,255,255,0.12)",
              }}
            >
              {selected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  <Check size={10} className="text-white" />
                </div>
              )}
              <span className="block text-lg mb-1">{interest.emoji}</span>
              <span className="text-white text-sm" style={{ fontWeight: 700 }}>{interest.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-4 rounded-2xl text-white text-sm flex items-center justify-center gap-2 transition-opacity"
        style={{ background: "var(--brand-gradient)", fontWeight: 700, opacity: valid ? 1 : 0.4 }}
      >
        Continue <ChevronRight size={17} />
      </button>
    </div>
  );
}

// ─── Step 3: Founder Profile ──────────────────────────────────────────────────
function FounderProfile({
  data, onChange, onNext, onBack,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [avatarIdx, setAvatarIdx] = useState(0);
  const valid = data.company.trim().length > 0 && data.stage !== "";

  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 text-sm mb-6" style={{ fontWeight: 600 }}>
        <ArrowLeft size={14} />
      </button>

      <h2 className="text-white mb-1" style={{ fontSize: "26px", fontWeight: 800 }}>
        Your founder profile
      </h2>
      <p className="text-white/50 text-sm mb-6">
        This is how the community will know you.
      </p>

      {/* Avatar picker */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          <img
            src={data.avatarPreview ?? AVATAR_OPTIONS[avatarIdx]}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl object-cover border-2"
            style={{ borderColor: "var(--primary)" }}
          />
          <button
            onClick={() => {
              const next = (avatarIdx + 1) % AVATAR_OPTIONS.length;
              setAvatarIdx(next);
              onChange({ avatarPreview: AVATAR_OPTIONS[next] });
            }}
            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#0f0a10]"
            style={{ background: "var(--brand-gradient)" }}
          >
            <Camera size={12} className="text-white" />
          </button>
        </div>
        <p className="text-white/40 text-xs">Tap camera to change photo</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Company */}
        <div>
          <label className="text-white/60 text-xs mb-1.5 block" style={{ fontWeight: 600 }}>Company / Startup</label>
          <input
            type="text"
            placeholder="e.g. Nova Labs"
            value={data.company}
            onChange={(e) => onChange({ company: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl text-white outline-none text-sm"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontWeight: 500 }}
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-white/60 text-xs mb-1.5 block" style={{ fontWeight: 600 }}>Location (optional)</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="e.g. New York, NY"
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-white outline-none text-sm"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontWeight: 500 }}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-white/60 text-xs mb-1.5 block" style={{ fontWeight: 600 }}>Short Bio (optional)</label>
          <textarea
            placeholder="What are you building and why does it matter?"
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            rows={3}
            className="w-full px-4 py-3.5 rounded-2xl text-white outline-none text-sm resize-none"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontWeight: 500 }}
          />
        </div>
      </div>

      {/* Stage */}
      <div className="mb-8">
        <label className="text-white/60 text-xs mb-3 block" style={{ fontWeight: 600 }}>Founder Stage</label>
        <div className="grid grid-cols-2 gap-2">
          {STAGES.map((s) => {
            const selected = data.stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onChange({ stage: s.id })}
                className="rounded-2xl p-3 text-left transition-all"
                style={{
                  background: selected ? "rgba(255,95,109,0.2)" : "rgba(255,255,255,0.07)",
                  border: selected ? "1.5px solid var(--primary)" : "1.5px solid rgba(255,255,255,0.12)",
                }}
              >
                <p className="text-white text-xs" style={{ fontWeight: 700 }}>{s.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-4 rounded-2xl text-white text-sm flex items-center justify-center gap-2 transition-opacity"
        style={{ background: "var(--brand-gradient)", fontWeight: 700, opacity: valid ? 1 : 0.4 }}
      >
        Complete Profile <ChevronRight size={17} />
      </button>
    </div>
  );
}

// ─── Main OnboardingFlow ──────────────────────────────────────────────────────
interface Props {
  onComplete: (data: OnboardingData) => void;
  onBack: () => void;
}

export function OnboardingFlow({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    email: "",
    password: "",
    interests: [],
    company: "",
    stage: "",
    location: "",
    bio: "",
    avatarPreview: null,
  });

  const patch = (p: Partial<OnboardingData>) => setData((d) => ({ ...d, ...p }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  const currentStep = STEPS[step];

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#0f0a10]">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff5f6d 0%, transparent 70%)", transform: "translate(35%,-35%)" }} />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c4dff 0%, transparent 70%)", transform: "translate(-35%, 35%)" }} />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 pt-14 pb-5 flex-shrink-0">
        {/* Back button — always visible */}
        <button
          onClick={back}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Go back"
        >
          <ArrowLeft size={17} className="text-white" />
        </button>

        <ProgressDots current={step} />

        {/* Logo mark */}
        <img src={northStarIcon} alt="" className="w-8 h-8 object-contain opacity-60" />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex flex-col flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {currentStep === "create-account" && (
            <CreateAccount data={data} onChange={patch} onNext={next} />
          )}
          {currentStep === "interests" && (
            <ChooseInterests data={data} onChange={patch} onNext={next} onBack={back} />
          )}
          {currentStep === "founder-profile" && (
            <FounderProfile data={data} onChange={patch} onNext={() => onComplete(data)} onBack={back} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export type { OnboardingData };
