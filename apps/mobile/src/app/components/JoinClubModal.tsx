import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Star, Lock, Sparkles, Users, BookOpen, GraduationCap, Mic2, Gift, Eye, EyeOff, ArrowLeft, User, Mail, AtSign, Send, Calendar, Clock, MapPin } from "lucide-react";
import northStarIcon from "../../imports/InspiredFounders_NorthStarIcon_White.png";

const clubFeatures = [
  { icon: Users,         label: "Community", desc: "Private founder feed & discussions" },
  { icon: BookOpen,      label: "Vault",     desc: "50+ decks, templates & masterclasses" },
  { icon: GraduationCap, label: "Mentors",   desc: "1:1 access to top founders" },
  { icon: Mic2,          label: "Assembly",  desc: "Live rooms & fireside chats" },
  { icon: Gift,          label: "Perks",     desc: "$1,700+ in exclusive member deals" },
];

const testimonials = [
  { name: "Marcus W.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format", quote: "Best investment I made for my founder journey." },
  { name: "Jade M.",   avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&auto=format", quote: "The community alone is worth 10x the price." },
];

interface Props {
  visible: boolean;
  onSubscribe: () => void;
  onDismiss: () => void;
}

interface SignUpForm {
  name: string;
  email: string;
  username: string;
  password: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
}

export function JoinClubModal({ visible, onSubscribe, onDismiss }: Props) {
  const [billing, setBilling]       = useState<"annual" | "monthly">("annual");
  const [step, setStep]             = useState<"offer" | "signup" | "confirm-email">("offer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState<Partial<SignUpForm>>({});
  const [form, setForm]             = useState<SignUpForm>({ name: "", email: "", username: "", password: "", birthDate: "", birthTime: "", birthCity: "" });
  const [resendCooldown, setResendCooldown] = useState(0);

  function handleDismiss() {
    setStep("offer");
    setForm({ name: "", email: "", username: "", password: "", birthDate: "", birthTime: "", birthCity: "" });
    setErrors({});
    setResendCooldown(0);
    onDismiss();
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      const { supabase } = await import("../../lib/supabase");
      await supabase.auth.resend({ type: "signup", email: form.email.trim() });
    } catch { /* ignore */ }
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 1000);
  }

  function setField(key: keyof SignUpForm, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<SignUpForm> = {};
    if (!form.name.trim())                             e.name     = "Full name is required";
    if (!form.email.includes("@"))                     e.email    = "Enter a valid email";
    if (form.username.trim().length < 3)               e.username = "At least 3 characters";
    if (form.password.length < 8)                      e.password = "At least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { signUp } = await import("../../lib/api/auth");
      const { updateProfile } = await import("../../lib/api/profiles");
      const data = await signUp(form.email.trim(), form.password, form.name.trim());
      const userId = data.user?.id;
      if (userId) {
        const { getSunSign, getMoonSign, getRisingSign, parseBirthDate } = await import("../../lib/astrology");
        const parsed = parseBirthDate(form.birthDate);
        const sunSign   = parsed ? getSunSign(parsed.month, parsed.day).id : null;
        const moonSign  = form.birthDate ? getMoonSign(form.birthDate).id : null;
        const rising    = form.birthTime ? getRisingSign(form.birthTime)?.id ?? null : null;
        await updateProfile(userId, {
          full_name:    form.name.trim(),
          role:         "member",
          member_since: new Date().toISOString().split("T")[0],
        });
      }
      setStep("confirm-email");
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setErrors((p) => ({ ...p, email: "An account with this email already exists." }));
      } else {
        setErrors((p) => ({ ...p, email: msg || "Sign up failed. Please try again." }));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-40"
            style={{ background: "rgba(20,10,20,0.55)", backdropFilter: "blur(8px)" }}
            onClick={handleDismiss}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col"
            style={{
              borderTopLeftRadius: "2rem",
              borderTopRightRadius: "2rem",
              background: "#ffffff",
              maxHeight: "93%",
            }}
          >
            {/* Brand glow */}
            <div
              className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(240,120,50,0.07) 0%, transparent 70%)",
                borderTopLeftRadius: "2rem",
                borderTopRightRadius: "2rem",
              }}
            />

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 relative z-10 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="overflow-y-auto relative z-10" style={{ scrollbarWidth: "none" }}>
              <AnimatePresence mode="wait">
                {step === "offer" && (
                  <motion.div
                    key="offer"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pt-3 pb-8"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "var(--brand-gradient)" }}
                        >
                          <img src={northStarIcon} alt="" className="w-full h-full object-contain p-1.5" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>Inspired Club</p>
                          <p className="text-muted-foreground text-xs">Membership</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDismiss}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Lock icon + headline */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: "spring", damping: 18 }}
                        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.2)" }}
                      >
                        <Lock size={26} style={{ color: "var(--primary)" }} />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.22 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 2px 12px rgba(34,197,94,0.3)" }}
                      >
                        <Gift size={12} className="text-white" />
                        <span className="text-white text-xs" style={{ fontWeight: 800, letterSpacing: "0.02em" }}>
                          7 DAYS FREE — No card required
                        </span>
                      </motion.div>

                      <h2 className="text-foreground mb-2" style={{ fontSize: "24px", fontWeight: 800, lineHeight: 1.2 }}>
                        Try The Club Free
                      </h2>
                      <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>
                        Everything you need to build, connect,<br />and grow as a founder.
                      </p>
                    </div>

                    {/* Feature list */}
                    <div className="flex flex-col gap-2 mb-6">
                      {clubFeatures.map((f, i) => {
                        const Icon = f.icon;
                        return (
                          <motion.div
                            key={f.label}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.06, duration: 0.22 }}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-gray-50 border border-gray-100"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "var(--brand-gradient-soft)" }}
                            >
                              <Icon size={15} style={{ color: "var(--primary)" }} />
                            </div>
                            <div className="flex-1">
                              <span className="text-foreground text-sm" style={{ fontWeight: 700 }}>{f.label}</span>
                              <span className="text-muted-foreground text-xs"> — {f.desc}</span>
                            </div>
                            <CheckCircle size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Billing toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
                      {(["annual", "monthly"] as const).map((plan) => (
                        <button
                          key={plan}
                          onClick={() => setBilling(plan)}
                          className="flex-1 py-2.5 rounded-xl text-sm transition-all relative"
                          style={{
                            background: billing === plan ? "#fff" : "transparent",
                            color: billing === plan ? "var(--foreground)" : "var(--muted-foreground)",
                            fontWeight: billing === plan ? 700 : 500,
                            boxShadow: billing === plan ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                          }}
                        >
                          {plan === "annual" ? "Annual" : "Monthly"}
                          {plan === "annual" && (
                            <span
                              className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: "var(--brand-gradient)", color: "#fff", fontWeight: 700, fontSize: "9px" }}
                            >
                              SAVE 20%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Pricing card */}
                    <div
                      className="rounded-2xl p-5 mb-4 relative overflow-hidden"
                      style={{ background: "var(--brand-gradient)" }}
                    >
                      <img
                        src={northStarIcon}
                        alt=""
                        className="absolute right-2 top-2 w-24 h-24 object-contain opacity-10 pointer-events-none"
                      />

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={billing}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}>
                            <Gift size={11} className="text-white" />
                            <span className="text-white text-xs" style={{ fontWeight: 700 }}>First 7 days free</span>
                          </div>

                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-white/50 text-sm line-through mr-1">
                              ${billing === "annual" ? "44" : "55"}
                            </span>
                            <span className="text-white" style={{ fontSize: "42px", fontWeight: 800, lineHeight: 1 }}>
                              $0
                            </span>
                            <span className="text-white/70 text-sm">for 7 days</span>
                          </div>
                          <p className="text-white/70 text-xs mb-3">
                            Then ${billing === "annual" ? "44" : "55"}/mo ·{" "}
                            {billing === "annual" ? "Billed annually · $528/year" : "Cancel anytime"}
                          </p>
                        </motion.div>
                      </AnimatePresence>

                      <div className="flex items-center gap-1.5">
                        {[1,2,3,4,5].map((s) => <Star key={s} size={12} fill="#fde68a" stroke="none" />)}
                        <span className="text-white/70 text-xs ml-1">4.9 · 2,400+ members</span>
                      </div>
                    </div>

                    {/* Scarcity */}
                    <div
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-5"
                      style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.18)" }}
                    >
                      <Sparkles size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <p className="text-muted-foreground text-xs">
                        <span className="text-foreground" style={{ fontWeight: 700 }}>Only 48 founding spots left.</span>{" "}
                        Annual rate locks in for life once you join.
                      </p>
                    </div>

                    {/* Testimonials */}
                    <div className="flex gap-2 mb-6">
                      {testimonials.map((t) => (
                        <div
                          key={t.name}
                          className="flex-1 rounded-xl p-3 bg-gray-50 border border-gray-100"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <img src={t.avatar} alt={t.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-foreground text-xs" style={{ fontWeight: 600 }}>{t.name}</span>
                          </div>
                          <p className="text-muted-foreground text-xs" style={{ lineHeight: 1.5 }}>"{t.quote}"</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA → goes to sign-up step */}
                    <button
                      onClick={() => setStep("signup")}
                      className="w-full py-4 rounded-2xl text-white text-sm mb-2 flex items-center justify-center gap-2"
                      style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}
                    >
                      <Gift size={15} className="text-white" />
                      Start My Free 7 Days
                    </button>
                    <p className="text-center text-xs text-muted-foreground mb-3" style={{ fontWeight: 500 }}>
                      No credit card needed · Cancel anytime
                    </p>
                    <button
                      onClick={handleDismiss}
                      className="w-full py-3 text-center text-xs text-muted-foreground"
                      style={{ fontWeight: 500 }}
                    >
                      Maybe later
                    </button>
                  </motion.div>
                )}

                {step === "signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.22 }}
                    className="px-6 pt-3 pb-8"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => setStep("offer")}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
                      >
                        <ArrowLeft size={14} className="text-gray-500" />
                      </button>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--brand-gradient)" }}
                        >
                          <img src={northStarIcon} alt="" className="w-full h-full object-contain p-1" />
                        </div>
                        <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>Create Your Account</p>
                      </div>
                      <button
                        onClick={handleDismiss}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Free trial reminder */}
                    <div
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-6"
                      style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.06))", border: "1px solid rgba(34,197,94,0.2)" }}
                    >
                      <Gift size={14} style={{ color: "#16a34a", flexShrink: 0 }} />
                      <div>
                        <p className="text-sm" style={{ fontWeight: 700, color: "#15803d" }}>7-day free trial starts today</p>
                        <p className="text-xs" style={{ color: "#16a34a" }}>
                          Then ${billing === "annual" ? "44" : "55"}/mo · No card required now
                        </p>
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="flex flex-col gap-4 mb-6">
                      {/* Full name */}
                      <div>
                        <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                          Full Name
                        </label>
                        <div
                          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
                          style={{
                            background: errors.name ? "rgba(239,68,68,0.04)" : "var(--muted)",
                            borderColor: errors.name ? "rgba(239,68,68,0.5)" : "var(--border)",
                          }}
                        >
                          <User size={15} className="text-muted-foreground flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={(e) => setField("name", e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        {errors.name && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.name}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                          Email Address
                        </label>
                        <div
                          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
                          style={{
                            background: errors.email ? "rgba(239,68,68,0.04)" : "var(--muted)",
                            borderColor: errors.email ? "rgba(239,68,68,0.5)" : "var(--border)",
                          }}
                        >
                          <Mail size={15} className="text-muted-foreground flex-shrink-0" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setField("email", e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        {errors.email && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.email}</p>}
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                          Handle
                        </label>
                        <div
                          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
                          style={{
                            background: errors.username ? "rgba(239,68,68,0.04)" : "var(--muted)",
                            borderColor: errors.username ? "rgba(239,68,68,0.5)" : "var(--border)",
                          }}
                        >
                          <AtSign size={15} className="text-muted-foreground flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="yourhandle"
                            value={form.username}
                            onChange={(e) => setField("username", e.target.value.replace(/\s/g, "").toLowerCase())}
                            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        {errors.username && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.username}</p>}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                          Password
                        </label>
                        <div
                          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
                          style={{
                            background: errors.password ? "rgba(239,68,68,0.04)" : "var(--muted)",
                            borderColor: errors.password ? "rgba(239,68,68,0.5)" : "var(--border)",
                          }}
                        >
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={(e) => setField("password", e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="text-muted-foreground flex-shrink-0"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.password}</p>}
                        {/* Strength hint */}
                        {form.password.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4].map((n) => (
                              <div
                                key={n}
                                className="flex-1 h-1 rounded-full transition-all"
                                style={{
                                  background: form.password.length >= n * 3
                                    ? n <= 1 ? "#ef4444" : n <= 2 ? "#f97316" : n <= 3 ? "#eab308" : "#22c55e"
                                    : "var(--border)",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Birth data section */}
                      <div
                        className="rounded-2xl p-4 mb-2"
                        style={{ background: "linear-gradient(135deg, rgba(123,78,200,0.06), rgba(232,54,92,0.04))", border: "1px solid rgba(123,78,200,0.15)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span style={{ fontSize: "18px" }}>✨</span>
                          <div>
                            <p className="text-foreground text-xs" style={{ fontWeight: 800 }}>Your Astrology Chart</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Powers your daily cosmic reading</p>
                          </div>
                        </div>

                        {/* Date of birth */}
                        <div className="mb-3">
                          <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                            Date of Birth
                          </label>
                          <div
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
                            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                          >
                            <Calendar size={14} className="text-muted-foreground flex-shrink-0" />
                            <input
                              type="date"
                              value={form.birthDate}
                              onChange={(e) => setField("birthDate", e.target.value)}
                              className="flex-1 bg-transparent text-sm outline-none text-foreground"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Time of birth */}
                          <div>
                            <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                              Time of Birth
                            </label>
                            <div
                              className="flex items-center gap-2 rounded-2xl px-3 py-3 border"
                              style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                            >
                              <Clock size={13} className="text-muted-foreground flex-shrink-0" />
                              <input
                                type="time"
                                value={form.birthTime}
                                onChange={(e) => setField("birthTime", e.target.value)}
                                className="flex-1 bg-transparent text-xs outline-none text-foreground"
                              />
                            </div>
                            <p className="text-muted-foreground mt-1" style={{ fontSize: "10px" }}>For rising sign</p>
                          </div>

                          {/* Birth city */}
                          <div>
                            <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "var(--foreground)" }}>
                              Birth City
                            </label>
                            <div
                              className="flex items-center gap-2 rounded-2xl px-3 py-3 border"
                              style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                            >
                              <MapPin size={13} className="text-muted-foreground flex-shrink-0" />
                              <input
                                type="text"
                                placeholder="City"
                                value={form.birthCity}
                                onChange={(e) => setField("birthCity", e.target.value)}
                                className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-muted-foreground text-center mb-5" style={{ lineHeight: 1.6 }}>
                      By creating an account you agree to our{" "}
                      <span className="underline" style={{ color: "var(--primary)" }}>Terms of Service</span>{" "}
                      and{" "}
                      <span className="underline" style={{ color: "var(--primary)" }}>Privacy Policy</span>.
                    </p>

                    {/* Submit */}
                    <button
                      onClick={handleSignUp}
                      disabled={loading}
                      className="w-full py-4 rounded-2xl text-white text-sm mb-2 flex items-center justify-center gap-2 transition-opacity"
                      style={{
                        background: "var(--brand-gradient)",
                        fontWeight: 700,
                        boxShadow: "var(--shadow-brand)",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <Gift size={15} />
                      )}
                      {loading ? "Creating your account…" : "Start My Free 7 Days"}
                    </button>
                    <p className="text-center text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                      No credit card needed · Cancel anytime
                    </p>
                  </motion.div>
                )}

                {step === "confirm-email" && (
                  <motion.div
                    key="confirm-email"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 pt-6 pb-10 flex flex-col items-center text-center"
                  >
                    {/* Close */}
                    <div className="w-full flex justify-end mb-4">
                      <button
                        onClick={handleDismiss}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Envelope illustration */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, type: "spring", damping: 16, stiffness: 260 }}
                      className="relative w-24 h-24 mb-6"
                    >
                      <div
                        className="w-24 h-24 rounded-3xl flex items-center justify-center"
                        style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}
                      >
                        <Send size={36} className="text-white" strokeWidth={1.75} />
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "#22c55e", boxShadow: "0 2px 10px rgba(34,197,94,0.4)" }}
                      >
                        <CheckCircle size={16} className="text-white" strokeWidth={2.5} />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-foreground mb-2" style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                        Check your inbox
                      </h2>
                      <p className="text-muted-foreground text-sm mb-2" style={{ lineHeight: 1.7 }}>
                        We sent a confirmation link to
                      </p>
                      <div
                        className="inline-block px-4 py-1.5 rounded-xl mb-4"
                        style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                      >
                        <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{form.email}</p>
                      </div>
                      <p className="text-muted-foreground text-xs mb-8" style={{ lineHeight: 1.7, maxWidth: "260px" }}>
                        Click the link in the email to activate your account and start your 7-day free trial. Check your spam folder if you don't see it.
                      </p>

                      {/* Resend */}
                      <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        className="w-full py-4 rounded-2xl text-white text-sm mb-3 transition-opacity"
                        style={{
                          background: "var(--brand-gradient)",
                          fontWeight: 700,
                          opacity: resendCooldown > 0 ? 0.6 : 1,
                        }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation email"}
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="w-full py-3 text-sm text-muted-foreground"
                        style={{ fontWeight: 600 }}
                      >
                        I'll do this later
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
