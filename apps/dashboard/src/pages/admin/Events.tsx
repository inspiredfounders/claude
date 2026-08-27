import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Event, EventType, Profile } from "@/lib/database.types";
import { Modal } from "@/components/Modal";
import { Button, EmptyState, ErrorState, Field, Input, PageHeader, Select, Spinner, Table, Td, Textarea, Th, Badge } from "@/components/ui";

const EVENT_TYPES: EventType[] = ["assembly", "workshop", "networking", "panel", "masterclass"];

type EventForm = {
  title: string;
  description: string;
  event_type: EventType;
  starts_at: string; // datetime-local value
  ends_at: string;
  location: string;
  is_virtual: boolean;
  meeting_url: string;
  cover_image_url: string;
  host_id: string;
  max_attendees: string;
  is_member_only: boolean;
  is_published: boolean;
  tags: string;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  event_type: "workshop",
  starts_at: "",
  ends_at: "",
  location: "",
  is_virtual: true,
  meeting_url: "",
  cover_image_url: "",
  host_id: "",
  max_attendees: "",
  is_member_only: false,
  is_published: true,
  tags: "",
};

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from("events").select("*").order("starts_at", { ascending: false }).limit(300);
    if (err) setError(err.message);
    else setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true })
      .limit(500)
      .then(({ data }) => setProfiles(data ?? []));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(ev: Event) {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description,
      event_type: ev.event_type,
      starts_at: toLocalInput(ev.starts_at),
      ends_at: toLocalInput(ev.ends_at),
      location: ev.location || "",
      is_virtual: ev.is_virtual,
      meeting_url: ev.meeting_url || "",
      cover_image_url: ev.cover_image_url || "",
      host_id: ev.host_id,
      max_attendees: ev.max_attendees != null ? String(ev.max_attendees) : "",
      is_member_only: ev.is_member_only,
      is_published: ev.is_published,
      tags: ev.tags.join(", "),
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim() || !form.starts_at || !form.ends_at || !form.host_id) {
      setFormError("Title, description, start/end time, and host are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      event_type: form.event_type,
      starts_at: fromLocalInput(form.starts_at),
      ends_at: fromLocalInput(form.ends_at),
      location: form.location.trim() || null,
      is_virtual: form.is_virtual,
      meeting_url: form.meeting_url.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      host_id: form.host_id,
      max_attendees: form.max_attendees.trim() ? Number(form.max_attendees) : null,
      is_member_only: form.is_member_only,
      is_published: form.is_published,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const result = editingId
      ? await supabase.from("events").update(payload).eq("id", editingId)
      : await supabase.from("events").insert(payload);

    setSaving(false);
    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setModalOpen(false);
    loadEvents();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    const { error: err } = await supabase.from("events").delete().eq("id", id);
    if (err) alert(`Failed to delete: ${err.message}`);
    else setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div>
      <PageHeader
        title="Events"
        description="Manage community events and assemblies."
        actions={<Button onClick={openCreate}>New Event</Button>}
      />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && events.length === 0 && <EmptyState message="No events yet." />}
      {!loading && !error && events.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Type</Th>
              <Th>Starts</Th>
              <Th>Published</Th>
              <Th>Attendees</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((ev) => (
              <tr key={ev.id}>
                <Td className="font-medium">{ev.title}</Td>
                <Td className="capitalize">{ev.event_type}</Td>
                <Td>{new Date(ev.starts_at).toLocaleString()}</Td>
                <Td>
                  <Badge tone={ev.is_published ? "green" : "slate"}>{ev.is_published ? "Published" : "Draft"}</Badge>
                </Td>
                <Td>
                  {ev.attendees_count}
                  {ev.max_attendees ? ` / ${ev.max_attendees}` : ""}
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openEdit(ev)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(ev.id)}>
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Event" : "New Event"} width="max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Description">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <Field label="Event type">
            <Select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Host">
            <Select value={form.host_id} onChange={(e) => setForm({ ...form, host_id: e.target.value })}>
              <option value="">Select a host…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.email})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Starts at">
            <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </Field>
          <Field label="Ends at">
            <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Max attendees">
            <Input type="number" min={0} value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} />
          </Field>
          <Field label="Meeting URL">
            <Input value={form.meeting_url} onChange={(e) => setForm({ ...form, meeting_url: e.target.value })} />
          </Field>
          <Field label="Cover image URL">
            <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
          </Field>
          <div className="col-span-2">
            <Field label="Tags (comma-separated)">
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_virtual} onChange={(e) => setForm({ ...form, is_virtual: e.target.checked })} />
              Virtual
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_member_only}
                onChange={(e) => setForm({ ...form, is_member_only: e.target.checked })}
              />
              Member-only
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
              Published
            </label>
          </div>
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
