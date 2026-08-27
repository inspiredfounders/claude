import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Mentor, MentorSession } from "@/lib/database.types";
import { Modal } from "@/components/Modal";
import { Button, EmptyState, ErrorState, Field, Input, PageHeader, Spinner, Table, Td, Th } from "@/components/ui";

type SessionForm = {
  title: string;
  starts_at: string;
  duration_minutes: string;
  max_attendees: string;
};

const emptyForm: SessionForm = { title: "", starts_at: "", duration_minutes: "60", max_attendees: "" };

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

export function MentorSessionsAdmin() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [mentor, setMentor] = useState<(Mentor & { profile?: { full_name: string } | null }) | null>(null);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadAll() {
    if (!mentorId) return;
    setLoading(true);
    setError(null);
    const [mentorRes, sessionsRes] = await Promise.all([
      supabase.from("mentors").select("*, profile:profiles(full_name)").eq("id", mentorId).maybeSingle(),
      supabase.from("mentor_sessions").select("*").eq("mentor_id", mentorId).order("starts_at", { ascending: false }),
    ]);
    if (mentorRes.error) setError(mentorRes.error.message);
    else setMentor(mentorRes.data as unknown as Mentor & { profile?: { full_name: string } | null });
    if (sessionsRes.error) setError((prev) => prev ?? sessionsRes.error!.message);
    else setSessions(sessionsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(s: MentorSession) {
    setEditingId(s.id);
    setForm({
      title: s.title,
      starts_at: toLocalInput(s.starts_at),
      duration_minutes: String(s.duration_minutes),
      max_attendees: s.max_attendees != null ? String(s.max_attendees) : "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!mentorId || !form.title.trim() || !form.starts_at) {
      setFormError("Title and start time are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      mentor_id: mentorId,
      title: form.title.trim(),
      starts_at: fromLocalInput(form.starts_at),
      duration_minutes: Number(form.duration_minutes) || 60,
      max_attendees: form.max_attendees.trim() ? Number(form.max_attendees) : null,
    };
    const result = editingId
      ? await supabase.from("mentor_sessions").update(payload).eq("id", editingId)
      : await supabase.from("mentor_sessions").insert(payload);
    setSaving(false);
    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setModalOpen(false);
    loadAll();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this session?")) return;
    const { error: err } = await supabase.from("mentor_sessions").delete().eq("id", id);
    if (err) alert(`Failed to delete: ${err.message}`);
    else setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <Link to="/mentors" className="text-sm text-indigo-600 hover:underline">
        ← Back to Mentors
      </Link>
      <PageHeader
        title={`Sessions${mentor?.profile?.full_name ? ` — ${mentor.profile.full_name}` : ""}`}
        actions={<Button onClick={openCreate}>New Session</Button>}
      />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && sessions.length === 0 && <EmptyState message="No sessions scheduled yet." />}
      {!loading && !error && sessions.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Starts</Th>
              <Th>Duration</Th>
              <Th>Attendees</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <tr key={s.id}>
                <Td className="font-medium">{s.title}</Td>
                <Td>{new Date(s.starts_at).toLocaleString()}</Td>
                <Td>{s.duration_minutes} min</Td>
                <Td>
                  {s.attendees_count}
                  {s.max_attendees ? ` / ${s.max_attendees}` : ""}
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openEdit(s)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(s.id)}>
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Session" : "New Session"}>
        <div className="space-y-4">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Starts at">
            <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </Field>
          <Field label="Duration (minutes)">
            <Input type="number" min={1} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </Field>
          <Field label="Max attendees">
            <Input type="number" min={0} value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} />
          </Field>
        </div>

        {formError && (
          <div className="mt-4">
            <ErrorState message={formError} />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
