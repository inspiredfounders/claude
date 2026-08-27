import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Calendar, Users, ChevronRight, Play, Star, Quote, Radio, ArrowLeft, Ticket, Check, Plus, Minus, Shield } from "lucide-react";
import { AssemblyScreen } from "./AssemblyScreen";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface UpcomingEvent {
  id: number;
  city: string;
  country: string;
  tagline: string;
  date: string;
  dateShort: string;
  venue: string;
  image: string;
  attendees: number;
  capacity: number;
  ticketPrice: string;
  status: "available" | "selling-fast" | "sold-out";
  featured?: boolean;
  speakers: { name: string; avatar: string }[];
}

interface PastEvent {
  id: number;
  city: string;
  date: string;
  image: string;
  attendees: number;
  photos: string[];
  recording?: string;
  speakers: { name: string; role: string; avatar: string; highlight: string }[];
  testimonials: { name: string; avatar: string; quote: string; rating: number }[];
}

const upcomingEvents: UpcomingEvent[] = [
  {
    id: 1,
    city: "Brisbane",
    country: "Australia",
    tagline: "Where Queensland's boldest founders converge.",
    date: "Friday, 12 September 2026",
    dateShort: "12 Sept",
    venue: "Howard Smith Wharves",
    image: "https://images.unsplash.com/photo-1571401835393-8c882a6aa15e?w=700&h=400&fit=crop&auto=format",
    attendees: 84,
    capacity: 150,
    ticketPrice: "from $97",
    status: "available",
    featured: true,
    speakers: [
      { name: "Priscilla Ava", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
      { name: "Marcus Webb",   avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format" },
      { name: "Jade Morales",  avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format" },
    ],
  },
  {
    id: 2,
    city: "Melbourne",
    country: "Australia",
    tagline: "The culture capital meets founder energy.",
    date: "Wednesday, 15 October 2026",
    dateShort: "15 Oct",
    venue: "The Glasshouse, South Wharf",
    image: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=700&h=400&fit=crop&auto=format",
    attendees: 112,
    capacity: 200,
    ticketPrice: "from $97",
    status: "selling-fast",
    speakers: [
      { name: "Priscilla Ava", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
      { name: "Devon Achebe",  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format" },
    ],
  },
  {
    id: 3,
    city: "Perth",
    country: "Australia",
    tagline: "The west awakens. Leaders gather.",
    date: "Saturday, 8 November 2026",
    dateShort: "8 Nov",
    venue: "Elizabeth Quay",
    image: "https://images.unsplash.com/photo-1573227895226-8c74d85c066a?w=700&h=400&fit=crop&auto=format",
    attendees: 47,
    capacity: 120,
    ticketPrice: "from $97",
    status: "available",
    speakers: [
      { name: "Jade Morales",  avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format" },
      { name: "Amara Osei",    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format" },
    ],
  },
  {
    id: 4,
    city: "Auckland",
    country: "New Zealand",
    tagline: "NZ's most inspiring founder gathering yet.",
    date: "Saturday, 22 November 2026",
    dateShort: "22 Nov",
    venue: "Viaduct Events Centre",
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=700&h=400&fit=crop&auto=format",
    attendees: 31,
    capacity: 100,
    ticketPrice: "from $97",
    status: "available",
    speakers: [
      { name: "Priscilla Ava", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
      { name: "Marcus Webb",   avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format" },
    ],
  },
];

const pastEvents: PastEvent[] = [
  {
    id: 1,
    city: "Sydney",
    date: "March 2026",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format",
    attendees: 210,
    photos: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=300&h=200&fit=crop&auto=format",
    ],
    speakers: [
      { name: "Priscilla Ava", role: "Brand Strategy", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", highlight: "\"Your brand is the only moat that can't be copied.\"" },
      { name: "Marcus Webb", role: "Fundraising", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format", highlight: "\"Investors fund conviction, not just ideas.\"" },
    ],
    testimonials: [
      { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format", quote: "This was the most energising event I've ever attended. I left with a clear plan and 10 new connections.", rating: 5 },
      { name: "James Okafor", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", quote: "Priscilla's keynote alone was worth flying across the country for. Genuinely life-changing.", rating: 5 },
      { name: "Sofia Reyes", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format", quote: "The community in the room was unreal. Every person I met was doing something meaningful.", rating: 5 },
    ],
  },
  {
    id: 2,
    city: "Gold Coast",
    date: "January 2026",
    image: "https://images.unsplash.com/photo-1571401835393-8c882a6aa15e?w=600&h=400&fit=crop&auto=format",
    attendees: 140,
    photos: [
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=300&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=300&h=200&fit=crop&auto=format",
    ],
    speakers: [
      { name: "Jade Morales", role: "Mindset & Wellness", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format", highlight: "\"Performance without wellness is just borrowed time.\"" },
    ],
    testimonials: [
      { name: "Kai Thornton", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format", quote: "The Gold Coast event had such an intimate, powerful energy. Small enough to go deep, big enough to feel the movement.", rating: 5 },
      { name: "Morgan Blake", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format", quote: "I've been to 50+ conferences. This was different. Every session felt intentional.", rating: 5 },
    ],
  },
];

// ─── Status helpers ────────────────────────────────────────────────────────────
const statusStyle = {
  "available":     { bg: "#dcfce7", color: "#16a34a", label: "Tickets Available" },
  "selling-fast":  { bg: "#fef9c3", color: "#ca8a04", label: "Selling Fast 🔥" },
  "sold-out":      { bg: "#fee2e2", color: "#dc2626", label: "Sold Out" },
};

// ─── Ticket Purchase Screen ───────────────────────────────────────────────────
const ticketTiers = [
  {
    id: "ga",
    name: "General Admission",
    price: 97,
    desc: "Full day access, networking, all sessions",
    perks: ["All keynotes & panels", "Lunch & refreshments", "Networking access", "Event recording (members)"],
  },
  {
    id: "fc",
    name: "Founder Circle",
    price: 197,
    desc: "Premium seating + exclusive morning workshop",
    perks: ["Everything in General", "Priority front seating", "Morning VIP workshop", "Speaker meet & greet"],
    popular: true,
  },
  {
    id: "vip",
    name: "VIP Experience",
    price: 497,
    desc: "Full VIP day including private dinner with speakers",
    perks: ["Everything in Founder Circle", "Private speaker dinner", "1:1 strategy session", "Lifetime recording access"],
  },
];

function TicketScreen({ event, onBack }: { event: UpcomingEvent; onBack: () => void }) {
  const [selected, setSelected]   = useState("fc");
  const [qty, setQty]             = useState(1);
  const [ordered, setOrdered]     = useState(false);
  const ss = statusStyle[event.status];
  const tier = ticketTiers.find((t) => t.id === selected)!;
  const total = tier.price * qty;

  if (ordered) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16, stiffness: 280 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "var(--brand-gradient)", boxShadow: "var(--shadow-brand)" }}
        >
          <Check size={36} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-foreground mb-2" style={{ fontSize: "24px", fontWeight: 800 }}>You're in! 🎉</h2>
        <p className="text-muted-foreground text-sm mb-1" style={{ lineHeight: 1.6 }}>
          Your ticket to <strong>Inspired Founders {event.city}</strong> is confirmed.
        </p>
        <p className="text-muted-foreground text-sm mb-8" style={{ lineHeight: 1.6 }}>
          Check your email for your ticket confirmation and event details.
        </p>
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl text-white text-sm"
          style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="relative flex-shrink-0" style={{ height: "200px" }}>
        <img src={event.image} alt={event.city} className="w-full h-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)" }} />
        <button onClick={onBack}
          className="absolute top-12 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={17} className="text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-white/60 text-xs mb-0.5">{event.country} · {event.dateShort}</p>
          <h1 className="text-white" style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.2 }}>
            Inspired Founders {event.city}
          </h1>
          <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
            <MapPin size={10} /> {event.venue}
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: "none" }}>
        <div className="pt-5">

          {/* Status + capacity */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: ss.bg, color: ss.color, fontWeight: 700 }}>
              {ss.label}
            </span>
            <span className="text-muted-foreground text-xs">
              {event.capacity - event.attendees} spots remaining
            </span>
          </div>

          {/* Ticket tiers */}
          <p className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 800 }}>Select your ticket</p>
          <div className="flex flex-col gap-3 mb-6">
            {ticketTiers.map((tier) => {
              const isSelected = selected === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelected(tier.id)}
                  className="w-full rounded-2xl p-4 text-left transition-all relative overflow-hidden"
                  style={{
                    background: isSelected ? "var(--brand-gradient-soft)" : "var(--card)",
                    border: isSelected ? "2px solid var(--primary)" : "2px solid var(--border)",
                    boxShadow: isSelected ? "var(--shadow-brand)" : "var(--shadow-sm)",
                  }}
                >
                  {tier.popular && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ background: "var(--brand-gradient)", fontWeight: 700, fontSize: "10px" }}>
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: isSelected ? "var(--brand-gradient)" : "var(--muted)",
                        border: isSelected ? "none" : "2px solid var(--border)",
                      }}>
                      {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>{tier.name}</p>
                        <p style={{ color: "var(--primary)", fontWeight: 800, fontSize: "15px" }}>${tier.price}</p>
                      </div>
                      <p className="text-muted-foreground text-xs mb-2" style={{ lineHeight: 1.5 }}>{tier.desc}</p>
                      <div className="flex flex-col gap-1">
                        {tier.perks.map((perk) => (
                          <div key={perk} className="flex items-center gap-1.5">
                            <Check size={10} style={{ color: "var(--primary)", flexShrink: 0 }} strokeWidth={2.5} />
                            <span className="text-muted-foreground text-xs">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quantity */}
          <p className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 800 }}>Quantity</p>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--muted)" }}>
              <Minus size={16} className="text-foreground" />
            </button>
            <span className="text-foreground" style={{ fontSize: "22px", fontWeight: 800, minWidth: "24px", textAlign: "center" }}>
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--muted)" }}>
              <Plus size={16} className="text-foreground" />
            </button>
            <span className="text-muted-foreground text-sm ml-2">ticket{qty > 1 ? "s" : ""}</span>
          </div>

          {/* Order summary */}
          <div className="rounded-2xl p-4 mb-5 border border-border bg-card" style={{ boxShadow: "var(--shadow-sm)" }}>
            <p className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 800 }}>Order Summary</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{tier.name} × {qty}</span>
              <span className="text-foreground" style={{ fontWeight: 600 }}>${tier.price * qty}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">Booking fee</span>
              <span className="text-foreground" style={{ fontWeight: 600 }}>$0</span>
            </div>
            <div className="h-px bg-border mb-3" />
            <div className="flex justify-between">
              <span className="text-foreground" style={{ fontWeight: 800 }}>Total</span>
              <span style={{ color: "var(--primary)", fontSize: "18px", fontWeight: 800 }}>${total}</span>
            </div>
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <Shield size={13} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-muted-foreground text-xs">Secure checkout · Full refund within 14 days</span>
          </div>

          {/* CTA */}
          <button
            onClick={() => setOrdered(true)}
            className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
            style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}>
            <Ticket size={17} /> Secure {qty} Ticket{qty > 1 ? "s" : ""} — ${total}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Featured hero card ───────────────────────────────────────────────────────
function FeaturedEventCard({ event, onSelect, onGetTickets }: { event: UpcomingEvent; onSelect: () => void; onGetTickets: () => void }) {
  const ss = statusStyle[event.status];
  const pct = Math.round((event.attendees / event.capacity) * 100);

  return (
    <div className="px-5 mb-6">
      <div
        className="rounded-3xl overflow-hidden bg-card border border-border"
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
      >
        {/* Image — tappable to open detail */}
        <div onClick={onSelect} className="relative cursor-pointer">
          <img src={event.image} alt={event.city} className="w-full object-cover" style={{ height: "200px" }} />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(10,4,12,0.85) 0%, rgba(10,4,12,0.1) 60%, transparent 100%)" }} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-white text-xs px-2.5 py-1 rounded-full"
              style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
              🌟 Next Up
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: ss.bg, color: ss.color, fontWeight: 700 }}>
              {ss.label}
            </span>
          </div>

          {/* City name overlaid on image bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <p className="text-white/60 text-xs">{event.country}</p>
            <h2 className="text-white" style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1.1 }}>
              {event.city}
            </h2>
          </div>
        </div>

        {/* Content below image */}
        <div className="p-4">
          {/* Tagline */}
          <p className="text-muted-foreground text-sm mb-3" style={{ lineHeight: 1.5 }}>{event.tagline}</p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-muted-foreground text-xs mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} style={{ color: "var(--primary)" }} />
              {event.dateShort}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} style={{ color: "var(--primary)" }} />
              {event.venue}
            </span>
          </div>

          {/* Speakers + price row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {event.speakers.map((s, i) => (
                  <img key={i} src={s.avatar} alt={s.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-card" />
                ))}
              </div>
              <span className="text-muted-foreground text-xs">{event.speakers.length} speakers</span>
            </div>
            <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: "15px" }}>{event.ticketPrice}</span>
          </div>

          {/* Capacity bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{event.attendees} registered</span>
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>{event.capacity - event.attendees} spots left</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--brand-gradient)" }} />
            </div>
          </div>

          <button
            onClick={onGetTickets}
            className="w-full py-3.5 rounded-2xl text-white text-sm flex items-center justify-center gap-2"
            style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}>
            <Ticket size={15} /> Get Your Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Small upcoming card ───────────────────────────────────────────────────────
function UpcomingCard({ event, onSelect, onGetTickets }: { event: UpcomingEvent; onSelect: () => void; onGetTickets: () => void }) {
  const ss = statusStyle[event.status];
  const pct = Math.round((event.attendees / event.capacity) * 100);

  return (
    <div className="flex-shrink-0 w-60 bg-card rounded-2xl overflow-hidden border border-border text-left"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
      <div onClick={onSelect} className="relative cursor-pointer">
        <img src={event.image} alt={event.city} className="w-full h-32 object-cover" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
        <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full"
          style={{ background: ss.bg, color: ss.color, fontWeight: 700, fontSize: "10px" }}>
          {ss.label}
        </span>
        <div className="absolute bottom-2 left-2">
          <p className="text-white/70 text-xs" style={{ fontSize: "10px" }}>{event.country}</p>
          <p className="text-white font-bold" style={{ fontSize: "16px", fontWeight: 800 }}>{event.city}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1"><Calendar size={10} />{event.dateShort}</span>
          <span className="flex items-center gap-1"><MapPin size={10} />{event.venue.split(",")[0]}</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--brand-gradient)" }} />
        </div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-muted-foreground text-xs">{event.capacity - event.attendees} spots left</span>
          <span className="text-xs" style={{ color: "var(--primary)", fontWeight: 700 }}>{event.ticketPrice}</span>
        </div>
        <button
          onClick={onGetTickets}
          className="w-full py-2 rounded-xl text-white text-xs flex items-center justify-center gap-1.5"
          style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
          <Ticket size={12} /> Get Tickets
        </button>
      </div>
    </div>
  );
}

// ─── Event Detail Modal ────────────────────────────────────────────────────────
function EventDetail({ event, onBack, onGetTickets }: { event: UpcomingEvent; onBack: () => void; onGetTickets: () => void }) {
  const ss = statusStyle[event.status];
  const pct = Math.round((event.attendees / event.capacity) * 100);

  return (
    <div className="flex flex-col pb-8">
      {/* Hero */}
      <div className="relative" style={{ height: "300px" }}>
        <img src={event.image} alt={event.city} className="w-full h-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, var(--background) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%)" }} />
        <button onClick={onBack}
          className="absolute top-5 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={17} className="text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-muted-foreground text-sm">{event.country}</p>
          <h1 className="text-foreground" style={{ fontSize: "30px", fontWeight: 800 }}>Inspired Founders {event.city}</h1>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-5 pt-4">
        {/* Status + price */}
        <div className="flex items-center gap-3">
          <span className="text-sm px-3 py-1.5 rounded-full" style={{ background: ss.bg, color: ss.color, fontWeight: 700 }}>{ss.label}</span>
          <span className="text-foreground text-sm" style={{ fontWeight: 700 }}>{event.ticketPrice}</span>
        </div>

        {/* Details */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
          {[
            { icon: Calendar, label: event.date },
            { icon: MapPin, label: event.venue + ", " + event.city },
            { icon: Users, label: `${event.attendees} registered · ${event.capacity} capacity` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--secondary)" }}>
                <Icon size={14} style={{ color: "var(--primary)" }} />
              </div>
              <span className="text-foreground text-sm">{label}</span>
            </div>
          ))}
          <div className="mt-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Filling up</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>{pct}% full</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--brand-gradient)" }} />
            </div>
          </div>
        </div>

        {/* Speakers */}
        <div>
          <p className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 800 }}>Speakers</p>
          <div className="flex flex-col gap-2">
            {event.speakers.map((s) => (
              <div key={s.name} className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border">
                <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover border-2"
                  style={{ borderColor: "var(--primary)" }} />
                <span className="text-foreground text-sm" style={{ fontWeight: 700 }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button onClick={onGetTickets} className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
          style={{ background: "var(--brand-gradient)", fontWeight: 700 }}>
          <Ticket size={17} /> Get Your Ticket
        </button>
      </div>
    </div>
  );
}

// ─── Past Event Detail ─────────────────────────────────────────────────────────
function PastEventDetail({ event, onBack }: { event: PastEvent; onBack: () => void }) {
  return (
    <div className="flex flex-col pb-8">
      {/* Hero */}
      <div className="relative" style={{ height: "240px" }}>
        <img src={event.image} alt={event.city} className="w-full h-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, var(--background) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1) 100%)" }} />
        <button onClick={onBack}
          className="absolute top-5 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={17} className="text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-muted-foreground text-sm">{event.date}</p>
          <h1 className="text-foreground" style={{ fontSize: "26px", fontWeight: 800 }}>Inspired Founders {event.city}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{event.attendees} founders attended</p>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-6 pt-4">

        {/* Photo Grid */}
        <div>
          <p className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 800 }}>📸 Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {event.photos.map((photo, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ aspectRatio: "1" }}>
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Recording */}
        <div>
          <p className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 800 }}>🎬 Event Recording</p>
          <div className="rounded-2xl overflow-hidden relative border border-border"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            <img src={event.image} alt="Recording" className="w-full h-40 object-cover brightness-75" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <button className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "var(--brand-gradient)", boxShadow: "0 6px 24px rgba(255,95,109,0.5)" }}>
                <Play size={22} className="text-white" style={{ marginLeft: 3 }} />
              </button>
              <span className="text-white text-sm" style={{ fontWeight: 700 }}>Watch Full Event</span>
            </div>
            <span className="absolute top-3 left-3 text-white text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.5)", fontWeight: 600 }}>
              Members Only
            </span>
          </div>
        </div>

        {/* Speaker Highlights */}
        <div>
          <p className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 800 }}>🎤 Speaker Highlights</p>
          <div className="flex flex-col gap-3">
            {event.speakers.map((speaker) => (
              <div key={speaker.name} className="bg-card rounded-2xl p-4 border border-border"
                style={{ borderLeft: "3px solid var(--primary)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <img src={speaker.avatar} alt={speaker.name}
                    className="w-10 h-10 rounded-full object-cover border-2"
                    style={{ borderColor: "var(--primary)" }} />
                  <div>
                    <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{speaker.name}</p>
                    <p className="text-muted-foreground text-xs">{speaker.role}</p>
                  </div>
                </div>
                <p className="text-foreground text-sm" style={{ lineHeight: 1.6, fontStyle: "italic", fontWeight: 500 }}>
                  {speaker.highlight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <p className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 800 }}>💬 What Founders Said</p>
          <div className="flex flex-col gap-3">
            {event.testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                    <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{t.name}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="#ffd166" stroke="none" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Quote size={14} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
                  <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.65 }}>{t.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Past Events Section ──────────────────────────────────────────────────────
function PastEventsSection({ onSelectPast }: { onSelectPast: (e: PastEvent) => void }) {
  return (
    <div className="px-5 flex flex-col gap-3">
      {pastEvents.map((ev) => (
        <button key={ev.id} onClick={() => onSelectPast(ev)} className="w-full text-left">
          <div className="rounded-2xl overflow-hidden border border-border flex"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="relative w-28 flex-shrink-0">
              <img src={ev.image} alt={ev.city} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.35)" }}>
                <Play size={20} className="text-white" />
              </div>
            </div>
            <div className="p-4 flex-1 bg-card">
              <p className="text-muted-foreground text-xs mb-0.5">{ev.date}</p>
              <p className="text-foreground text-sm mb-1" style={{ fontWeight: 800 }}>Inspired Founders {ev.city}</p>
              <p className="text-muted-foreground text-xs mb-2">{ev.attendees} founders · {ev.photos.length} photos</p>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}>Photos</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--primary)", fontWeight: 600 }}>Recording</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Main EventsScreen ────────────────────────────────────────────────────────
type EventsTab   = "upcoming" | "past" | "assembly";
type DetailState =
  | { type: "upcoming"; event: UpcomingEvent }
  | { type: "past";     event: PastEvent }
  | null;

export function EventsScreen({
  isMember = false,
  onJoin,
  initialTab = "upcoming",
}: {
  isMember?: boolean;
  onJoin?: () => void;
  initialTab?: EventsTab;
}) {
  const [tab, setTab]               = useState<EventsTab>(initialTab);
  const [detail, setDetail]         = useState<DetailState>(null);
  const [ticketEvent, setTicketEvent] = useState<UpcomingEvent | null>(null);

  // Ticket purchase screen
  if (ticketEvent) {
    return (
      <div className="h-full overflow-hidden flex flex-col" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence>
          <motion.div
            key="tickets"
            className="absolute inset-0 bg-background z-30 flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <TicketScreen event={ticketEvent} onBack={() => setTicketEvent(null)} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Upcoming event detail
  if (detail?.type === "upcoming") {
    return (
      <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <EventDetail
          event={detail.event}
          onBack={() => setDetail(null)}
          onGetTickets={() => setTicketEvent(detail.event)}
        />
      </div>
    );
  }

  // Past event detail
  if (detail?.type === "past") {
    return (
      <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <PastEventDetail event={detail.event} onBack={() => setDetail(null)} />
      </div>
    );
  }

  const featured = upcomingEvents[0];
  const rest     = upcomingEvents.slice(1);

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 800 }}>Events</h1>
            <p className="text-muted-foreground text-xs mt-0.5">{upcomingEvents.length} cities this season</p>
          </div>
          {/* Live indicator pill — decorative, tab handles navigation */}
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700 }}>
            <Radio size={11} />
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live Monthly
          </div>
        </div>

        {/* Tab switcher — 3 tabs */}
        <div className="flex bg-muted rounded-2xl p-1 gap-0.5">
          {([
            { id: "upcoming",  label: "Upcoming", live: false },
            { id: "assembly",  label: "Sessions", live: true },
            { id: "past",      label: "Past", live: false },
          ] as const).map(({ id, label, live }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
              style={{
                background: tab === id ? (id === "assembly" ? "var(--brand-gradient)" : "#fff") : "transparent",
                color: tab === id ? (id === "assembly" ? "#fff" : "var(--foreground)") : "var(--muted-foreground)",
                fontWeight: tab === id ? 700 : 500,
                boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>
              {live && tab === id && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {live && tab !== id && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "assembly" ? (
        isMember ? (
          <div className="flex-1">
            <AssemblyScreen onViewAllSessions={() => setTab("upcoming")} />
          </div>
        ) : (
          /* ── Member gate ── */
          <div className="flex flex-col items-center justify-center px-8 text-center py-16 gap-5">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(232,54,92,0.2)" }}>
              <Radio size={32} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h2 className="text-foreground mb-2" style={{ fontSize: "22px", fontWeight: 800 }}>Members Only</h2>
              <p className="text-muted-foreground text-sm" style={{ lineHeight: 1.7, maxWidth: "260px" }}>
                Assembly is our monthly live session — exclusive to Club members. Join to RSVP and attend.
              </p>
            </div>
            <div className="w-full rounded-2xl p-4 border border-border bg-card flex flex-col gap-2 text-left">
              {[
                "Monthly live sessions with Priscilla",
                "Pitch hot-seats & founder Q&As",
                "Replays in The Vault after each session",
                "Member-only community access",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--brand-gradient)" }}>
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-foreground text-xs" style={{ fontWeight: 600 }}>{feat}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onJoin}
              className="w-full py-4 rounded-2xl text-white text-sm"
              style={{ background: "var(--brand-gradient)", fontWeight: 700, boxShadow: "var(--shadow-brand)" }}
            >
              Join The Club to Attend
            </button>
            <button
              onClick={() => setTab("upcoming")}
              className="text-muted-foreground text-sm"
              style={{ fontWeight: 600 }}
            >
              Back to Upcoming Events
            </button>
          </div>
        )
      ) : tab === "upcoming" ? (
        <>
          <div className="h-5" />

          {/* Featured */}
          <FeaturedEventCard
            event={featured}
            onSelect={() => setDetail({ type: "upcoming", event: featured })}
            onGetTickets={() => setTicketEvent(featured)}
          />

          {/* Section heading */}
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 800 }}>More Dates</h2>
            <span className="text-muted-foreground text-xs">{rest.length} upcoming</span>
          </div>

          {/* Horizontal scroll of remaining */}
          <div className="flex gap-3 px-5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {rest.map((ev) => (
              <UpcomingCard
                key={ev.id}
                event={ev}
                onSelect={() => setDetail({ type: "upcoming", event: ev })}
                onGetTickets={() => setTicketEvent(ev)}
              />
            ))}
          </div>

          {/* Tour map teaser */}
          <div
            className="mx-5 mt-6 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "var(--brand-gradient-soft)", border: "1px solid rgba(255,95,109,0.2)" }}
          >
            <span style={{ fontSize: "24px" }}>🗺️</span>
            <div className="flex-1">
              <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>2026 Australasia Tour</p>
              <p className="text-muted-foreground text-xs">Brisbane · Melbourne · Perth · Auckland</p>
            </div>
            <ChevronRight size={16} style={{ color: "var(--primary)" }} />
          </div>
        </>
      ) : (
        <>
          <div className="h-5" />

          {/* Past stats strip */}
          <div className="flex gap-3 px-5 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[
              { label: "Events run", value: "12" },
              { label: "Founders met", value: "1,400+" },
              { label: "Cities", value: "8" },
              { label: "Avg rating", value: "4.9 ★" },
            ].map((s) => (
              <div key={s.label} className="flex-shrink-0 bg-card rounded-2xl px-4 py-3 border border-border text-center" style={{ minWidth: "80px" }}>
                <p className="text-foreground text-base" style={{ fontWeight: 800, color: "var(--primary)" }}>{s.value}</p>
                <p className="text-muted-foreground text-xs mt-0.5" style={{ whiteSpace: "nowrap" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <PastEventsSection onSelectPast={(ev) => setDetail({ type: "past", event: ev })} />
        </>
      )}
    </div>
  );
}
