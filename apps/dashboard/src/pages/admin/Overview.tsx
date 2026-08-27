import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ErrorState, PageHeader, Spinner, StatCard } from "@/components/ui";

interface Stats {
  members: number;
  mentors: number;
  upcomingEvents: number;
  openRoles: number;
  pendingMentorshipApplications: number;
  pendingJobApplications: number;
}

export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      const nowIso = new Date().toISOString();
      const [members, mentors, upcomingEvents, openRoles, pendingMentorshipApplications, pendingJobApplications] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("mentors").select("id", { count: "exact", head: true }),
          supabase.from("events").select("id", { count: "exact", head: true }).gte("starts_at", nowIso),
          supabase.from("roles").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("mentorship_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);

      const firstError =
        members.error || mentors.error || upcomingEvents.error || openRoles.error || pendingMentorshipApplications.error || pendingJobApplications.error;
      if (firstError) {
        if (!cancelled) setError(firstError.message);
        return;
      }
      if (!cancelled) {
        setStats({
          members: members.count ?? 0,
          mentors: mentors.count ?? 0,
          upcomingEvents: upcomingEvents.count ?? 0,
          openRoles: openRoles.count ?? 0,
          pendingMentorshipApplications: pendingMentorshipApplications.count ?? 0,
          pendingJobApplications: pendingJobApplications.count ?? 0,
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Overview" description="A snapshot of The Inspired Club community." />
      {error && <ErrorState message={error} />}
      {!error && !stats && <Spinner />}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Members" value={stats.members} />
          <StatCard label="Total Mentors" value={stats.mentors} />
          <StatCard label="Upcoming Events" value={stats.upcomingEvents} />
          <StatCard label="Open Job Roles" value={stats.openRoles} />
          <StatCard label="Pending Mentorship Apps" value={stats.pendingMentorshipApplications} />
          <StatCard label="Pending Job Apps" value={stats.pendingJobApplications} />
        </div>
      )}
    </div>
  );
}
