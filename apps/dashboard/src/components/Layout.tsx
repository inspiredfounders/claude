import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const adminNav = [
  { to: "/", label: "Overview", end: true },
  { to: "/members", label: "Members" },
  { to: "/events", label: "Events" },
  { to: "/jobs", label: "Jobs" },
  { to: "/community", label: "Community" },
  { to: "/mentors", label: "Mentors" },
  { to: "/mentorship-applications", label: "Mentorship Applications" },
];

const mentorNav = [
  { to: "/", label: "My Profile", end: true },
  { to: "/sessions", label: "My Sessions" },
  { to: "/applications", label: "Applications" },
];

export function Layout() {
  const { profile, signOut } = useAuth();
  const nav = profile?.role === "admin" ? adminNav : mentorNav;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-200">
        <div className="px-5 py-5">
          <div className="text-sm font-semibold tracking-wide text-white">The Inspired Club</div>
          <div className="text-xs text-slate-400">Dashboard</div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-400">
          Signed in as
          <div className="truncate text-sm font-medium text-slate-100">{profile?.full_name}</div>
          <div className="capitalize text-slate-400">{profile?.role}</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">Inspired Founders internal tool</div>
          <button
            onClick={() => signOut()}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
