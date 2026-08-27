import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useMyMentor } from "@/lib/useMyMentor";
import type { MentorshipApplicationStatus } from "@/lib/database.types";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Spinner } from "@/components/ui";

interface AppRow {
  id: string;
  created_at: string;
  building: string;
  challenge: string;
  goal: string;
  session_length_minutes: number;
  availability: string[];
  status: MentorshipApplicationStatus;
  reviewed_at: string | null;
  applicant: { full_name: string; email: string } | null;
}

const STATUS_TONE: Record<MentorshipApplicationStatus, "amber" | "green" | "red"> = {
  pending: "amber",
  accepted: "green",
  declined: "red",
};

export function MyApplications() {
  const { mentor, loading: mentorLoading, error: mentorError } = useMyMentor();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadApps(mentorId: string) {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("mentorship_applications")
      .select(
        "id, created_at, building, challenge, goal, session_length_minutes, availability, status, reviewed_at, applicant:profiles(full_name, email)"
      )
      .eq("mentor_id", mentorId)
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setApps((data ?? []) as unknown as AppRow[]);
    setLoading(false);
  }

  useEffect(() => {
    if (mentor) loadApps(mentor.id);
    else setLoading(false);
  }, [mentor]);

  async function updateStatus(id: string, status: MentorshipApplicationStatus) {
    setUpdatingId(id);
    const { error: err } = await supabase
      .from("mentorship_applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setUpdatingId(null);
    if (err) {
      alert(`Failed to update: ${err.message}`);
      return;
    }
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status, reviewed_at: new Date().toISOString() } : a)));
  }

  if (mentorLoading) return <Spinner />;
  if (mentorError) return <ErrorState message={mentorError} />;
  if (!mentor) {
    return (
      <div>
        <PageHeader title="Applications" />
        <EmptyState message="Your mentor profile hasn't been set up yet — contact an admin." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Applications" description="Mentorship requests addressed to you." />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && apps.length === 0 && <EmptyState message="No mentorship applications yet." />}
      {!loading && !error && apps.length > 0 && (
        <div className="space-y-4">
          {apps.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-900">{a.applicant?.full_name ?? "—"}</div>
                  <div className="text-xs text-slate-500">{a.applicant?.email}</div>
                </div>
                <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <div>
                  <div className="text-xs font-medium uppercase text-slate-500">Building</div>
                  <div className="mt-0.5 text-slate-800">{a.building}</div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-slate-500">Challenge</div>
                  <div className="mt-0.5 text-slate-800">{a.challenge}</div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-slate-500">Goal</div>
                  <div className="mt-0.5 text-slate-800">{a.goal}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Session length: {a.session_length_minutes} min</span>
                <span>Availability: {a.availability.length ? a.availability.join(", ") : "—"}</span>
                <span>Submitted: {new Date(a.created_at).toLocaleString()}</span>
              </div>

              {a.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => updateStatus(a.id, "accepted")} disabled={updatingId === a.id}>
                    Accept
                  </Button>
                  <Button variant="danger" onClick={() => updateStatus(a.id, "declined")} disabled={updatingId === a.id}>
                    Decline
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
