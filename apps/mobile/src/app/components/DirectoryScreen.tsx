import { Search, MapPin, Star, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const industries = ["All", "Tech", "Health", "Finance", "Media", "Consumer", "Impact"];

const members = [
  { id: 1, name: "Priscilla Ava", role: "CEO & Founder", company: "Nova Labs", industry: "Tech", location: "New York, NY", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format", score: 820, badge: "Top Founder", connections: 312 },
  { id: 2, name: "Marcus Webb", role: "Founder & Investor", company: "Shift Capital", industry: "Finance", location: "San Francisco, CA", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format", score: 760, badge: "Mentor", connections: 284 },
  { id: 3, name: "Jade Morales", role: "Co-Founder & CEO", company: "Aura Health", industry: "Health", location: "Austin, TX", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&auto=format", score: 690, badge: "Rising Star", connections: 198 },
  { id: 4, name: "Devon Achebe", role: "Founder & CTO", company: "Luminary AI", industry: "Tech", location: "London, UK", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format", score: 740, badge: "Mentor", connections: 231 },
  { id: 5, name: "Amara Osei", role: "Founder", company: "Collab Studio", industry: "Media", location: "Atlanta, GA", avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&auto=format", score: 610, badge: "Member", connections: 144 },
  { id: 6, name: "Kai Thornton", role: "Co-Founder", company: "GreenRoot", industry: "Impact", location: "Portland, OR", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format", score: 580, badge: "Member", connections: 97 },
  { id: 7, name: "Sofia Reyes", role: "Founder & CEO", company: "Fonda", industry: "Consumer", location: "Miami, FL", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&auto=format", score: 660, badge: "Rising Star", connections: 176 },
];

const badgeColor: Record<string, string> = {
  "Top Founder": "var(--primary)",
  "Mentor": "var(--purple)",
  "Rising Star": "var(--accent)",
  "Member": "var(--teal)",
};

export function DirectoryScreen() {
  const [activeIndustry, setActiveIndustry] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = members.filter((m) => {
    const matchIndustry = activeIndustry === "All" || m.industry === activeIndustry;
    const matchQuery = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.company.toLowerCase().includes(query.toLowerCase());
    return matchIndustry && matchQuery;
  });

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-card border-b border-border">
        <h1 className="text-foreground mb-1" style={{ fontSize: "24px", fontWeight: 800 }}>Directory</h1>
        <p className="text-muted-foreground text-sm mb-4">{members.length} founders in the community</p>
        <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-2.5">
          <Search size={15} className="text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Search founders, companies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
            <SlidersHorizontal size={12} className="text-white" />
          </button>
        </div>
      </div>

      {/* Industry Filter */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {industries.map((ind) => (
          <button
            key={ind}
            onClick={() => setActiveIndustry(ind)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all"
            style={{
              background: activeIndustry === ind ? "var(--brand-gradient)" : "var(--muted)",
              color: activeIndustry === ind ? "#fff" : "var(--muted-foreground)",
              fontWeight: activeIndustry === ind ? 700 : 500,
            }}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Member List */}
      <div className="px-5 flex flex-col gap-3">
        {filtered.map((member) => (
          <div key={member.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-2xl object-cover" />
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center"
                style={{ background: badgeColor[member.badge] || "var(--primary)" }}
              >
                <Star size={8} fill="white" stroke="none" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{member.name}</p>
                  <p className="text-muted-foreground text-xs">{member.role} · {member.company}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${badgeColor[member.badge] || "var(--primary)"}18`, color: badgeColor[member.badge] || "var(--primary)", fontWeight: 700 }}
                >
                  {member.badge}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={10} />{member.location}</span>
                <span>{member.connections} connections</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No members found</p>
          </div>
        )}
      </div>
    </div>
  );
}
