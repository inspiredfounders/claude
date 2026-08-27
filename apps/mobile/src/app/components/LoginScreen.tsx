import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import northStarIcon from "../../imports/InspiredFounders_NorthStarIcon_White.png";

type LoginStep = "signin" | "forgot" | "reset-sent";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export function LoginScreen({ onLogin, onBack }: Props) {
  const [step, setStep]             = useState<LoginStep>("signin");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setError("");
    setLoading(true);
    try {
      const { signIn } = await import("../../lib/api/auth");
      await signIn(email.trim(), password);
      onLogin();
    } catch (err: any) {
      setError(err?.message ?? "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail.trim()) { setError("Please enter your email."); return; }
    setError("");
    try {
      const { supabase } = await import("../../lib/supabase");
      await supabase.auth.resetPasswordForEmail(resetEmail.trim());
    } catch { /* ignore */ }
    setStep("reset-sent");
  };

  return (
    <div className="flex flex-col min-h-full relative overflow-hidden bg-background">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(240,120,50,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
        style={{ background: "radial-gradient(circle at 30% 70%, rgba(123,78,200,0.06) 0%, transparent 65%)" }} />

      <div className="relative flex flex-col flex-1 px-6 pt-14 pb-10">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-10 w-fit"
          style={{ color: "var(--muted-foreground)", fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--brand-gradient)" }}>
            <img src={northStarIcon} alt="" className="w-full h-full object-contain p-1.5" />
          </div>
          <span className="text-foreground text-sm" style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
            Inspired Club
          </span>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Sign In ── */}
          {step === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col flex-1"
            >
              <h1 className="text-foreground mb-1" style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm mb-8" style={{ lineHeight: 1.6 }}>
                Sign in to your Club account
              </p>

              <div className="flex flex-col gap-4 mb-6">
                {/* Email */}
                <div>
                  <label className="text-foreground text-xs mb-1.5 block" style={{ fontWeight: 700 }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 rounded-2xl text-foreground text-sm outline-none"
                    style={{
                      background: "var(--muted)",
                      border: error && !email ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-foreground text-xs" style={{ fontWeight: 700 }}>Password</label>
                    <button
                      onClick={() => setStep("forgot")}
                      className="text-xs"
                      style={{ color: "var(--primary)", fontWeight: 600 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 pr-12 rounded-2xl text-foreground text-sm outline-none"
                      style={{
                        background: "var(--muted)",
                        border: error && !password ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                      }}
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPass
                        ? <EyeOff size={16} className="text-muted-foreground" />
                        : <Eye size={16} className="text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs -mt-1"
                      style={{ color: "var(--primary)", fontWeight: 600 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Sign in button */}
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-4 rounded-2xl text-white text-sm mb-4 transition-all active:scale-98"
                style={{
                  background: "var(--brand-gradient)",
                  fontWeight: 700,
                  boxShadow: "var(--shadow-brand)",
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={onBack} style={{ color: "var(--primary)", fontWeight: 700 }}>
                  Get started
                </button>
              </p>
            </motion.div>
          )}

          {/* ── Forgot Password ── */}
          {step === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col flex-1"
            >
              <h1 className="text-foreground mb-1" style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Reset password
              </h1>
              <p className="text-muted-foreground text-sm mb-8" style={{ lineHeight: 1.6 }}>
                Enter your email and we'll send a reset link.
              </p>

              <div className="mb-6">
                <label className="text-foreground text-xs mb-1.5 block" style={{ fontWeight: 700 }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => { setResetEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-2xl text-foreground text-sm outline-none"
                  style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}
                />
                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs mt-2" style={{ color: "var(--primary)", fontWeight: 600 }}>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-4 rounded-2xl text-white text-sm mb-4"
                style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
              >
                Send Reset Link
              </button>
              <button
                onClick={() => { setStep("signin"); setError(""); }}
                className="w-full py-3 text-center text-sm"
                style={{ color: "var(--muted-foreground)", fontWeight: 600 }}
              >
                Back to Sign In
              </button>
            </motion.div>
          )}

          {/* ── Reset Sent ── */}
          {step === "reset-sent" && (
            <motion.div
              key="reset-sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="flex flex-col flex-1 items-center justify-center text-center pb-16"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 16, stiffness: 260 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}
              >
                <Check size={36} className="text-white" strokeWidth={2.5} />
              </motion.div>
              <h2 className="text-foreground mb-2" style={{ fontSize: "22px", fontWeight: 800 }}>Check your inbox</h2>
              <p className="text-muted-foreground text-sm mb-8" style={{ lineHeight: 1.7, maxWidth: "260px" }}>
                We've sent a reset link to <strong>{resetEmail}</strong>. Follow the link to set a new password.
              </p>
              <button
                onClick={() => { setStep("signin"); setError(""); }}
                className="w-full py-4 rounded-2xl text-white text-sm"
                style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
              >
                Back to Sign In
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
