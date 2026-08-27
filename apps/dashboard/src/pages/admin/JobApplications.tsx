import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Application, ApplicationStatus, Role } from "@/lib/database.types";
import { Badge, Button, EmptyState, ErrorState, PageHeader, Select, Spinner, Table, Td, Textarea, Th } from "@/components/ui";

const STATUS_OPTIONS: ApplicationStatus[] = ["pending", "reviewed", "accepted", "rejected"];
const STATUS_TONE: Record<ApplicationStatus, "slate" | "green" | "amber" | "red" | "indigo"> = {
  pending: "amber",
  reviewed: "indigo",
  accepted: "green",
  rejected: "red",
};

function ApplicationRow({ app, onUpdate }: { app: Application; onUpdate: (id: string, patch: Partial<Application>) => void }) {
  const [notes, setNotes] = useState(app.notes || "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  async function updateStatus(status: ApplicationStatus) {
    setSavingStatus(true);
    const { error: err } = await supabase
      .from("applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", app.id);
    setSavingStatus(false);
    if (err) alert(`Failed to update status: ${err.message}`);
    else onUpdate(app.id, { status, reviewed_at: new Date().toISOString() });
  }

  async function saveNotes() {
    setSavingNotes(true);
    const { error: err } = await supabase.from("applications").update({ notes }).eq("id", app.id);
    setSavingNotes(false);
    if (err) alert(`Failed to save notes: ${err.message}`);
    else onUpdate(app.id, { notes });
  }

  return (
    <tr className="align-top">
      <Td className="font-medium">
        {app.full_name}
        <div className="text-xs font-normal text-slate-500">{app.email}</div>
        {app.linkedin_url && (
          <a href={app.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
            LinkedIn
          </a>
        )}
      </Td>
      <Td className="max-w-sm whitespace-pre-wrap text-sm">{app.pitch}</Td>
      <Td>
        <Select value={app.status} disabled={savingStatus} onChange={(e) => updateStatus(e.target.value as ApplicationStatus)} className="w-32">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <div className="mt-1">
          <Badge tone={STATUS_TONE[app.status]}>{app.status}</Badge>
        </div>
      </Td>
      <Td className="min-w-[16rem]">
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes…" />
        <Button variant="secondary" className="mt-1" onClick={saveNotes} disabled={savingNotes}>
          {savingNotes ? "Saving…" : "Save notes"}
        </Button>
      </Td>
    </tr>
  );
}

export function JobApplications() {
  const { roleId } = useParams<{ roleId: string }>();
  const [role, setRole] = useState<Role | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const [roleRes, appsRes] = await Promise.all([
        supabase.from("roles").select("*").eq("id", roleId as string).maybeSingle(),
        supabase.from("applications").select("*").eq("role_id", roleId as string).order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      if (roleRes.error) setError(roleRes.error.message);
      else setRole(roleRes.data);
      if (appsRes.error) setError(appsRes.error.message);
      else setApps(appsRes.data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [roleId]);

  function onUpdate(id: string, patch: Partial<Application>) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <div>
      <Link to="/jobs" className="text-sm text-indigo-600 hover:underline">
        ← Back to Jobs
      </Link>
      <PageHeader title={`Applications${role ? ` — ${role.title}` : ""}`} description={role ? `${role.company}` : undefined} />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && apps.length === 0 && <EmptyState message="No applications for this role yet." />}
      {!loading && !error && apps.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Applicant</Th>
              <Th>Pitch</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apps.map((app) => (
              <ApplicationRow key={app.id} app={app} onUpdate={onUpdate} />
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
