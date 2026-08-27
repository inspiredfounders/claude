import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MentorshipApplicationStatus } from "@/lib/database.types";
import { Badge, EmptyState, ErrorState, PageHeader, Spinner, Table, Td, Th } from "@/components/ui";

interface AppRow {
  id: string;
  created_at: string;
  building: string;
  challenge: string;
  goal: string;
  session_length_minutes: number;
  status: MentorshipApplicationStatus;
  reviewed_at: string | null;
  applicant: { full_name: string } | null;
  mentor: { title: string; profile: { full_name: string } | null } | null;
}

const STATUS_TONE: Record<MentorshipApplicationStatus, "amber" | "green" | "red"> = {
  pending: "amber",
  accepted: "green",
  declined: "red",
};

export function MentorshipApplicationsAdmin() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("mentorship_applications")
        .select(
          "id, created_at, building, challenge, goal, session_length_minutes, status, reviewed_at, applicant:profiles(full_name), mentor:mentors(title, profile:profiles(full_name))"
        )
        .order("created_at", { ascending: false })
        .limit(300);
      if (cancelled) return;
      if (err) setError(err.message);
      else setApps((data ?? []) as unknown as AppRow[]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Mentorship Applications" description="All 1:1 mentorship requests across the club." />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && apps.length === 0 && <EmptyState message="No mentorship applications yet." />}
      {!loading && !error && apps.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Applicant</Th>
              <Th>Mentor</Th>
              <Th>Building / Challenge / Goal</Th>
              <Th>Session length</Th>
              <Th>Status</Th>
              <Th>Submitted</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apps.map((a) => (
              <tr key={a.id} className="align-top">
                <Td className="font-medium">{a.applicant?.full_name ?? "—"}</Td>
                <Td>
                  {a.mentor?.profile?.full_name ?? "—"}
                  <div className="text-xs text-slate-500">{a.mentor?.title}</div>
                </Td>
                <Td className="max-w-sm text-xs">
                  <div>
                    <span className="font-medium">Building:</span> {a.building}
                  </div>
                  <div>
                    <span className="font-medium">Challenge:</span> {a.challenge}
                  </div>
                  <div>
                    <span className="font-medium">Goal:</span> {a.goal}
                  </div>
                </Td>
                <Td>{a.session_length_minutes} min</Td>
                <Td>
                  <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                </Td>
                <Td>{new Date(a.created_at).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
