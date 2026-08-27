import { useState } from "react";
import { CommunityScreen } from "./CommunityScreen";
import { MentorsScreen } from "./MentorsScreen";
import { JobsScreen } from "./JobsScreen";
import { MessageSquare, GraduationCap, Briefcase } from "lucide-react";

const tabs = [
  { id: "community", label: "The Club", icon: MessageSquare },
  { id: "mentors",   label: "Mentors",  icon: GraduationCap },
  { id: "jobs",      label: "Projects",  icon: Briefcase },
] as const;

type ClubInnerTab = "community" | "mentors" | "jobs";

export function ClubTabScreen({ currentUserId }: { currentUserId?: string }) {
  const [active, setActive] = useState<ClubInnerTab>("community");

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Sub-nav */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3 bg-card border-b border-border flex items-center gap-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all"
              style={{
                background: on ? "var(--brand-gradient)" : "var(--muted)",
                color: on ? "#fff" : "var(--muted-foreground)",
                fontWeight: on ? 700 : 500,
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {active === "community" && <CommunityScreen />}
        {active === "mentors"   && <MentorsScreen currentUserId={currentUserId} />}
        {active === "jobs"      && <JobsScreen />}
      </div>
    </div>
  );
}
