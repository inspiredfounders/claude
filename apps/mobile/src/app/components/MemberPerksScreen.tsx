import { Tag, ChevronRight, Copy, CheckCircle, ExternalLink, Star, Gift } from "lucide-react";
import { useState } from "react";

const categories = ["All", "SaaS Tools", "Finance", "Legal", "Marketing", "Wellness"];

const perks = [
  {
    id: 1,
    brand: "Notion",
    logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&h=80&fit=crop&auto=format",
    offer: "6 months free on Notion Team",
    value: "$480 value",
    code: "INSPIRED6",
    category: "SaaS Tools",
    description: "Collaborate, plan, and build your startup brain in one place.",
    color: "#000000",
    claimed: false,
  },
  {
    id: 2,
    brand: "Mercury Bank",
    logo: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=80&h=80&fit=crop&auto=format",
    offer: "3 months fee-free banking + $300 bonus",
    value: "$300 bonus",
    code: "INSPIREDCLUB",
    category: "Finance",
    description: "The banking stack built for startups. No minimums, no fees.",
    color: "#5250f3",
    claimed: true,
  },
  {
    id: 3,
    brand: "Legal Zoom",
    logo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=80&h=80&fit=crop&auto=format",
    offer: "30% off incorporation & legal docs",
    value: "Save $150+",
    code: "INSPIRED30",
    category: "Legal",
    description: "Incorporate your startup, create contracts, and protect your IP.",
    color: "#0070f3",
    claimed: false,
  },
  {
    id: 4,
    brand: "Beehiiv",
    logo: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=80&h=80&fit=crop&auto=format",
    offer: "3 months free on Scale plan",
    value: "$297 value",
    code: "INSPIREDBEE",
    category: "Marketing",
    description: "Build and monetize your audience with the newsletter platform for founders.",
    color: "#f59e0b",
    claimed: false,
  },
  {
    id: 5,
    brand: "Headspace for Work",
    logo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=80&h=80&fit=crop&auto=format",
    offer: "50% off annual wellness plan",
    value: "$99 savings",
    code: "CLUBMIND50",
    category: "Wellness",
    description: "Mindfulness and meditation to help founders perform at their peak.",
    color: "#f97316",
    claimed: false,
  },
  {
    id: 6,
    brand: "Stripe",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&h=80&fit=crop&auto=format",
    offer: "Waived transaction fees for 60 days",
    value: "Up to $500 saved",
    code: "INSPIREDSTRIPE",
    category: "Finance",
    description: "The payments platform trusted by millions of businesses worldwide.",
    color: "#635bff",
    claimed: false,
  },
];

export function MemberPerksScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [copied, setCopied] = useState<number | null>(null);
  const [claimed, setClaimed] = useState<Record<number, boolean>>(
    Object.fromEntries(perks.map((p) => [p.id, p.claimed]))
  );

  const filtered = activeCategory === "All" ? perks : perks.filter((p) => p.category === activeCategory);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalValue = perks.reduce((sum, p) => {
    const match = p.value.match(/\$(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div
        className="px-5 pt-5 pb-6"
        style={{ background: "var(--brand-gradient)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white" style={{ fontSize: "20px", fontWeight: 800 }}>Member Perks</h2>
          <div className="bg-white/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <Gift size={13} className="text-white" />
            <span className="text-white text-xs" style={{ fontWeight: 700 }}>{perks.length} perks</span>
          </div>
        </div>
        <p className="text-white/80 text-xs mb-4">Exclusive deals for Inspired Club members</p>

        <div className="bg-white/20 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs">Total value unlocked</p>
            <p className="text-white" style={{ fontSize: "24px", fontWeight: 800 }}>${totalValue.toLocaleString()}+</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Star size={22} className="text-yellow-300" fill="#fde68a" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all"
            style={{
              background: activeCategory === cat ? "var(--brand-gradient)" : "var(--muted)",
              color: activeCategory === cat ? "#fff" : "var(--muted-foreground)",
              fontWeight: activeCategory === cat ? 700 : 500,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Perks List */}
      <div className="px-5 flex flex-col gap-3">
        {filtered.map((perk) => {
          const isClaimed = claimed[perk.id];
          const isCopied = copied === perk.id;
          return (
            <div key={perk.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Top bar color */}
              <div className="h-1 w-full" style={{ background: perk.color }} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: `${perk.color}15` }}
                    >
                      <img src={perk.logo} alt={perk.brand} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{perk.brand}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 500 }}
                      >
                        {perk.category}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: "#dcfce7", color: "#16a34a", fontWeight: 700 }}
                  >
                    {perk.value}
                  </span>
                </div>

                <p className="text-foreground text-sm mb-1" style={{ fontWeight: 700 }}>{perk.offer}</p>
                <p className="text-muted-foreground text-xs mb-4">{perk.description}</p>

                {/* Code + CTA */}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                    <Tag size={12} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 tracking-widest" style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--foreground)" }}>
                      {perk.code}
                    </span>
                    <button
                      onClick={() => handleCopy(perk.id, perk.code)}
                      style={{ color: isCopied ? "#16a34a" : "var(--primary)" }}
                    >
                      {isCopied ? <CheckCircle size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                  <button
                    onClick={() => setClaimed((prev) => ({ ...prev, [perk.id]: true }))}
                    className="px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 flex-shrink-0 transition-all"
                    style={{
                      background: isClaimed ? "var(--muted)" : "var(--brand-gradient)",
                      color: isClaimed ? "var(--muted-foreground)" : "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {isClaimed ? (
                      <><CheckCircle size={13} /> Claimed</>
                    ) : (
                      <>Claim <ExternalLink size={13} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
