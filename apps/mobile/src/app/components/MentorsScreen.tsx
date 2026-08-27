import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Instagram, Linkedin, Globe, Play, Calendar, Clock, Users, Star, ChevronRight, MessageCircle, CheckCircle, ExternalLink, Check, Sparkles } from "lucide-react";
import {
  getMentors,
  rsvpToMentorSession,
  cancelMentorSessionRsvp,
  getMyMentorSessionRsvps,
  submitMentorshipApplication,
  type MentorWithSessions,
} from "../../lib/api/mentors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return { date, time };
}

function socialIconFor(platform: string) {
  if (platform === "instagram") return <Instagram size={15} />;
  if (platform === "linkedin")  return <Linkedin  size={15} />;
  return <Globe size={15} />;
}

interface Social { platform: string; handle: string; url: string }

// ─── Mentor Card (listing) ────────────────────────────────────────────────────
function MentorCard({ mentor, onSelect }: { mentor: MentorWithSessions; onSelect: () => void }) {
  return (
    <div onClick={onSelect} className="w-full text-left cursor-pointer">
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ height: "320px", background: "#c9a48a", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        {/* Photo */}
        <img
          src={mentor.photo_url ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&auto=format"}
          alt={mentor.title}
          className="w-full h-full object-cover object-top"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,4,12,0.95) 0%, rgba(10,4,12,0.4) 55%, transparent 100%)" }}
        />

        {/* Available badge */}
        <div className="absolute top-3 right-3">
          {mentor.available ? (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e", fontWeight: 700, border: "1px solid rgba(34,197,94,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Available
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              Waitlist
            </span>
          )}
        </div>

        {/* Featured badge */}
        {mentor.featured && (
          <div className="absolute top-3 left-3">
            <span className="text-white text-xs px-2.5 py-1 rounded-full"
              style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
              ⭐ Featured
            </span>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white mb-0.5" style={{ fontSize: "20px", fontWeight: 800 }}>Mentor</h3>
          <p className="text-white/60 text-sm mb-3">{mentor.title}</p>

          {/* Expertise pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {mentor.expertise.slice(0, 3).map((e) => (
              <span key={e} className="text-white/80 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", fontWeight: 600, fontSize: "11px" }}>
                {e}
              </span>
            ))}
          </div>

          {/* Stats + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-white text-sm" style={{ fontWeight: 800 }}>{mentor.mentored_count}+</p>
                <p className="text-white/40 text-xs">Mentored</p>
              </div>
              {mentor.rating != null && (
                <div>
                  <p className="text-white text-sm" style={{ fontWeight: 800 }}>{mentor.rating}</p>
                  <p className="text-white/40 text-xs">Rating</p>
                </div>
              )}
            </div>
            <div
              className="flex items-center gap-1.5 text-white text-xs px-4 py-2 rounded-xl"
              style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
            >
              View <ChevronRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mentor Detail ────────────────────────────────────────────────────────────
function MentorDetail({
  mentor, myRsvps, onBack, onBook, onToggleRsvp,
}: {
  mentor: MentorWithSessions;
  myRsvps: Set<string>;
  onBack: () => void;
  onBook: () => void;
  onToggleRsvp: (sessionId: string, currentlyRsvpd: boolean) => void;
}) {
  const socials = (Array.isArray(mentor.socials) ? mentor.socials : []) as Social[];

  return (
    <div className="flex flex-col">
      {/* Hero photo */}
      <div className="relative" style={{ height: "380px" }}>
        <img
          src={mentor.photo_url ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&auto=format"}
          alt={mentor.title}
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, var(--background) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.15) 100%)" }} />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-5 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
        >
          <ArrowLeft size={17} className="text-white" />
        </button>

        {/* Available */}
        <div className="absolute top-5 right-4">
          {mentor.available ? (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e", fontWeight: 700, backdropFilter: "blur(8px)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Available
            </span>
          ) : (
            <span className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.6)", fontWeight: 600, backdropFilter: "blur(8px)" }}>
              Waitlist
            </span>
          )}
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-muted-foreground text-sm mb-1">{mentor.title}</p>
          {mentor.location && <h1 className="text-foreground" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.1 }}>{mentor.location}</h1>}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-5 px-5 pt-4 pb-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>{mentor.mentored_count}+</p>
            <p className="text-muted-foreground text-xs mt-0.5">Mentored</p>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>{mentor.rating ?? "—"}</p>
            <p className="text-muted-foreground text-xs mt-0.5">Rating</p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-foreground text-sm mb-2" style={{ fontWeight: 700 }}>About</p>
          <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.7 }}>{mentor.long_bio ?? mentor.bio}</p>
        </div>

        {/* Expertise */}
        <div>
          <p className="text-foreground text-sm mb-3" style={{ fontWeight: 700 }}>Expertise</p>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((e) => (
              <span
                key={e}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full"
                style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}
              >
                <CheckCircle size={12} />
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Socials */}
        {socials.length > 0 && (
          <div>
            <p className="text-foreground text-sm mb-3" style={{ fontWeight: 700 }}>Connect</p>
            <div className="flex flex-col gap-2">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border w-full text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--muted)" }}>
                    {socialIconFor(s.platform)}
                  </div>
                  <span className="text-foreground text-sm flex-1" style={{ fontWeight: 600 }}>{s.handle}</span>
                  <ExternalLink size={13} className="text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {mentor.sessions.length > 0 && (
          <div>
            <p className="text-foreground text-sm mb-3" style={{ fontWeight: 700 }}>Upcoming Sessions</p>
            <div className="flex flex-col gap-3">
              {mentor.sessions.map((session) => {
                const isRsvp = myRsvps.has(session.id);
                const spotsLeft = session.max_attendees != null ? session.max_attendees - session.attendees_count : null;
                const almost = spotsLeft != null && spotsLeft <= 8;
                const { date, time } = formatSessionDate(session.starts_at);
                return (
                  <div key={session.id}
                    className="bg-card rounded-2xl p-4 border border-border"
                    style={{ borderLeft: "3px solid var(--primary)" }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-foreground text-sm" style={{ fontWeight: 700, lineHeight: 1.35 }}>
                        {session.title}
                      </p>
                      {almost && (
                        <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}>
                          {spotsLeft} left
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Calendar size={11} />{date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{time}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{session.attendees_count}</span>
                    </div>
                    <button
                      onClick={() => onToggleRsvp(session.id, isRsvp)}
                      className="w-full py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        background: isRsvp ? "var(--secondary)" : "var(--brand-gradient)",
                        color: isRsvp ? "var(--primary)" : "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {isRsvp ? "✓ RSVP'd — See you there" : "RSVP for This Session"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Request Mentorship CTA */}
        <button
          onClick={onBook}
          className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
          style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}
        >
          <MessageCircle size={18} /> Request 1:1 Mentorship
        </button>
      </div>
    </div>
  );
}

// ─── Mentor Booking Screen ────────────────────────────────────────────────────
const sessionLengths = [
  { id: "30", label: "30 minutes", sub: "Quick focus session" },
  { id: "60", label: "60 minutes", sub: "Deep dive session" },
];

const timeSlots = ["Morning (8am–12pm)", "Afternoon (12pm–5pm)", "Evening (5pm–8pm)"];

function MentorBookingScreen({
  mentor, currentUserId, onBack,
}: {
  mentor: MentorWithSessions;
  currentUserId?: string;
  onBack: () => void;
}) {
  const [building, setBuilding]     = useState("");
  const [challenge, setChallenge]   = useState("");
  const [goal, setGoal]             = useState("");
  const [length, setLength]         = useState("60");
  const [times, setTimes]           = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  const toggleTime = (t: string) =>
    setTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const valid = building.trim().length > 10 && challenge.trim().length > 10 && goal.trim().length > 10 && times.length > 0;

  const handleSubmit = async () => {
    if (!valid) return;
    if (!currentUserId) { setError("Please sign in to request mentorship."); return; }
    setSubmitting(true);
    setError("");
    try {
      await submitMentorshipApplication({
        mentor_id: mentor.id,
        applicant_id: currentUserId,
        building: building.trim(),
        challenge: challenge.trim(),
        goal: goal.trim(),
        session_length_minutes: parseInt(length, 10),
        availability: times,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-8 text-center py-20">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16, stiffness: 260 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}
        >
          <Check size={36} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-foreground mb-2" style={{ fontSize: "24px", fontWeight: 800 }}>Application Sent!</h2>
        <p className="text-muted-foreground text-sm mb-2" style={{ lineHeight: 1.7, maxWidth: "260px" }}>
          Your application has been received.
        </p>
        <p className="text-muted-foreground text-sm mb-10" style={{ lineHeight: 1.7, maxWidth: "260px" }}>
          The mentor reviews applications personally and will be in touch soon.
        </p>
        <div
          className="w-full rounded-2xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.18)" }}
        >
          <Sparkles size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-muted-foreground text-sm text-left" style={{ lineHeight: 1.6 }}>
            While you wait, explore The Vault to make the most of your upcoming session.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl text-white"
          style={{ background: "var(--brand-gradient)", fontWeight: 700 }}
        >
          Back to Mentor's Profile
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-10">
      {/* Header */}
      <div className="relative px-5 pt-12 pb-5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-5"
          style={{ color: "var(--muted-foreground)", fontWeight: 600, fontSize: "14px" }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Mentor mini-card */}
        <div className="flex items-center gap-3">
          <img
            src={mentor.photo_url ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&auto=format"}
            alt={mentor.title}
            className="w-14 h-14 rounded-2xl object-cover object-top flex-shrink-0"
            style={{ boxShadow: "0 0 0 2px var(--primary)" }}
          />
          <div>
            <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.2 }}>
              {mentor.title}
            </p>
            {mentor.available ? (
              <span className="inline-flex items-center gap-1.5 text-xs mt-1"
                style={{ color: "#22c55e", fontWeight: 600 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Available now
              </span>
            ) : (
              <span className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Waitlist open</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-5">
        <div>
          <h2 className="text-foreground mb-1" style={{ fontSize: "20px", fontWeight: 800 }}>
            Apply for 1:1 Mentorship
          </h2>
          <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>
            Tell your mentor about your founder journey so they can make the most of your session together.
          </p>
        </div>

        {/* Q1 */}
        <div>
          <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>
            What are you building? *
          </label>
          <textarea
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            placeholder="Tell us about your business, your vision, and where you are right now…"
            rows={3}
            className="w-full px-4 py-3.5 rounded-2xl text-foreground outline-none text-sm resize-none"
            style={{
              background: "var(--muted)",
              border: "1.5px solid var(--border)",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Q2 */}
        <div>
          <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>
            What's your biggest challenge right now? *
          </label>
          <textarea
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            placeholder="Be specific — the more honest you are, the more your mentor can help…"
            rows={3}
            className="w-full px-4 py-3.5 rounded-2xl text-foreground outline-none text-sm resize-none"
            style={{
              background: "var(--muted)",
              border: "1.5px solid var(--border)",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Q3 */}
        <div>
          <label className="text-foreground text-sm mb-2 block" style={{ fontWeight: 700 }}>
            What would you like to walk away with? *
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="A clear next step, a decision made, a strategy refined…"
            rows={3}
            className="w-full px-4 py-3.5 rounded-2xl text-foreground outline-none text-sm resize-none"
            style={{
              background: "var(--muted)",
              border: "1.5px solid var(--border)",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Session length */}
        <div>
          <label className="text-foreground text-sm mb-3 block" style={{ fontWeight: 700 }}>
            Session length
          </label>
          <div className="flex gap-3">
            {sessionLengths.map((sl) => {
              const on = length === sl.id;
              return (
                <button
                  key={sl.id}
                  onClick={() => setLength(sl.id)}
                  className="flex-1 rounded-2xl p-3.5 text-left transition-all"
                  style={{
                    background: on ? "var(--brand-gradient-soft)" : "var(--muted)",
                    border: on ? "2px solid var(--primary)" : "2px solid transparent",
                  }}
                >
                  <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>{sl.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{sl.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="text-foreground text-sm mb-3 block" style={{ fontWeight: 700 }}>
            Your availability * <span className="text-muted-foreground font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-col gap-2">
            {timeSlots.map((slot) => {
              const on = times.includes(slot);
              return (
                <button
                  key={slot}
                  onClick={() => toggleTime(slot)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all"
                  style={{
                    background: on ? "var(--brand-gradient-soft)" : "var(--muted)",
                    border: on ? "2px solid var(--primary)" : "2px solid transparent",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: on ? "var(--brand-gradient)" : "var(--card)",
                      border: on ? "none" : "2px solid var(--border)",
                    }}
                  >
                    {on && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-foreground text-sm" style={{ fontWeight: on ? 700 : 500 }}>{slot}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div
          className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.18)" }}
        >
          <Sparkles size={15} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-muted-foreground text-xs" style={{ lineHeight: 1.7 }}>
            <span className="text-foreground" style={{ fontWeight: 700 }}>Your mentor reviews all applications personally.</span>{" "}
            You'll receive a response soon. This is a complimentary benefit of your Inspired Club membership.
          </p>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--destructive)", fontWeight: 600 }}>{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!valid || submitting}
          className="w-full py-4 rounded-2xl text-white text-sm flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: "var(--brand-gradient)",
            fontWeight: 700,
            opacity: valid && !submitting ? 1 : 0.4,
            boxShadow: valid ? "var(--shadow-brand)" : "none",
          }}
        >
          <MessageCircle size={17} /> {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

// ─── Main MentorsScreen ────────────────────────────────────────────────────────
export function MentorsScreen({ currentUserId }: { currentUserId?: string }) {
  const [mentors, setMentors]       = useState<MentorWithSessions[] | null>(null);
  const [selected, setSelected]     = useState<MentorWithSessions | null>(null);
  const [booking, setBooking]       = useState(false);
  const [myRsvps, setMyRsvps]       = useState<Set<string>>(new Set());

  useEffect(() => {
    getMentors().then(setMentors);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    getMyMentorSessionRsvps(currentUserId).then((ids) => setMyRsvps(new Set(ids)));
  }, [currentUserId]);

  const handleToggleRsvp = async (sessionId: string, currentlyRsvpd: boolean) => {
    if (!currentUserId) return;
    if (currentlyRsvpd) {
      await cancelMentorSessionRsvp(sessionId, currentUserId).catch(() => {});
      setMyRsvps((prev) => { const next = new Set(prev); next.delete(sessionId); return next; });
    } else {
      await rsvpToMentorSession(sessionId, currentUserId).catch(() => {});
      setMyRsvps((prev) => new Set(prev).add(sessionId));
    }
  };

  if (mentors === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading mentors…</p>
      </div>
    );
  }

  if (selected && booking) {
    return (
      <div className="overflow-y-auto flex flex-col" style={{ scrollbarWidth: "none" }}>
        <MentorBookingScreen mentor={selected} currentUserId={currentUserId} onBack={() => setBooking(false)} />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <MentorDetail
          mentor={selected}
          myRsvps={myRsvps}
          onBack={() => setSelected(null)}
          onBook={() => setBooking(true)}
          onToggleRsvp={handleToggleRsvp}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-5">
        <h1 className="text-foreground mb-1" style={{ fontSize: "22px", fontWeight: 800 }}>Mentors</h1>
        <p className="text-muted-foreground text-sm">Learn from founders who've done it.</p>
      </div>

      {mentors.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-muted-foreground text-sm">No mentors are listed yet — check back soon.</p>
        </div>
      ) : (
        /* Mentor cards — vertical stack, each full-width */
        <div className="flex flex-col gap-4 px-5">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} onSelect={() => setSelected(mentor)} />
          ))}
        </div>
      )}
    </div>
  );
}
