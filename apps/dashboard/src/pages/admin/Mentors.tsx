import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Mentor, Profile } from "@/lib/database.types";
import { Modal } from "@/components/Modal";
import { SocialsEditor, type SocialLink } from "@/components/SocialsEditor";
import { Badge, Button, EmptyState, ErrorState, Field, Input, PageHeader, Spinner, Table, Td, Textarea, Th } from "@/components/ui";

interface MentorRow extends Mentor {
  profile: { full_name: string; email: string } | null;
}

type MentorForm = {
  title: string;
  location: string;
  photo_url: string;
  bio: string;
  long_bio: string;
  expertise: string;
  socials: SocialLink[];
  available: boolean;
  featured: boolean;
};

const emptyForm: MentorForm = {
  title: "",
  location: "",
  photo_url: "",
  bio: "",
  long_bio: "",
  expertise: "",
  socials: [],
  available: true,
  featured: false,
};

export function Mentors() {
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MentorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    const [mentorsRes, profilesRes] = await Promise.all([
      supabase.from("mentors").select("*, profile:profiles(full_name, email)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("full_name", { ascending: true }).limit(500),
    ]);
    if (mentorsRes.error) setError(mentorsRes.error.message);
    else setMentors((mentorsRes.data ?? []) as unknown as MentorRow[]);
    if (profilesRes.error) setError((prev) => prev ?? profilesRes.error!.message);
    else setProfiles(profilesRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const existingMentorProfileIds = useMemo(() => new Set(mentors.map((m) => m.profile_id)), [mentors]);

  const pickerMatches = useMemo(() => {
    const term = pickerSearch.trim().toLowerCase();
    return profiles
      .filter((p) => !existingMentorProfileIds.has(p.id))
      .filter((p) => !term || p.full_name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term))
      .slice(0, 8);
  }, [profiles, pickerSearch, existingMentorProfileIds]);

  function openPicker() {
    setSelectedProfile(null);
    setPickerSearch("");
    setPickerOpen(true);
  }

  function proceedFromPicker() {
    if (!selectedProfile) return;
    setPickerOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(row: MentorRow) {
    setSelectedProfile(null);
    setEditingId(row.id);
    setForm({
      title: row.title,
      location: row.location || "",
      photo_url: row.photo_url || "",
      bio: row.bio,
      long_bio: row.long_bio || "",
      expertise: row.expertise.join(", "),
      socials: Array.isArray(row.socials) ? (row.socials as unknown as SocialLink[]) : [],
      available: row.available,
      featured: row.featured,
    });
    setFormError(null);
    setEditorOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.bio.trim()) {
      setFormError("Title and bio are required.");
      return;
    }
    if (!editingId && !selectedProfile) {
      setFormError("No profile selected.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      title: form.title.trim(),
      location: form.location.trim() || null,
      photo_url: form.photo_url.trim() || null,
      bio: form.bio.trim(),
      long_bio: form.long_bio.trim() || null,
      expertise: form.expertise
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
      socials: form.socials.filter((s) => s.platform || s.handle || s.url),
      available: form.available,
      featured: form.featured,
    };

    if (editingId) {
      const { error: err } = await supabase.from("mentors").update(payload).eq("id", editingId);
      setSaving(false);
      if (err) {
        setFormError(err.message);
        return;
      }
    } else if (selectedProfile) {
      if (selectedProfile.role !== "mentor" && selectedProfile.role !== "admin") {
        const { error: roleErr } = await supabase.from("profiles").update({ role: "mentor" }).eq("id", selectedProfile.id);
        if (roleErr) {
          setSaving(false);
          setFormError(`Failed to update profile role: ${roleErr.message}`);
          return;
        }
      }
      const { error: err } = await supabase.from("mentors").insert({ profile_id: selectedProfile.id, ...payload });
      setSaving(false);
      if (err) {
        setFormError(err.message);
        return;
      }
    }

    setEditorOpen(false);
    loadAll();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this mentor profile? Their sessions and applications will also be removed.")) return;
    const { error: err } = await supabase.from("mentors").delete().eq("id", id);
    if (err) alert(`Failed to delete: ${err.message}`);
    else setMentors((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <PageHeader title="Mentors" description="Manage the mentor roster." actions={<Button onClick={openPicker}>New Mentor</Button>} />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && mentors.length === 0 && <EmptyState message="No mentors yet." />}
      {!loading && !error && mentors.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Title</Th>
              <Th>Available</Th>
              <Th>Featured</Th>
              <Th>Sessions</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mentors.map((m) => (
              <tr key={m.id}>
                <Td className="font-medium">
                  {m.profile?.full_name ?? "—"}
                  <div className="text-xs font-normal text-slate-500">{m.profile?.email}</div>
                </Td>
                <Td>{m.title}</Td>
                <Td>
                  <Badge tone={m.available ? "green" : "slate"}>{m.available ? "Available" : "Unavailable"}</Badge>
                </Td>
                <Td>{m.featured ? <Badge tone="indigo">Featured</Badge> : "—"}</Td>
                <Td>
                  <Link to={`/mentors/${m.id}/sessions`} className="text-indigo-600 hover:underline">
                    Manage sessions
                  </Link>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openEdit(m)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(m.id)}>
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Select a profile to make a mentor">
        <Input
          placeholder="Search by name or email…"
          value={pickerSearch}
          onChange={(e) => setPickerSearch(e.target.value)}
          autoFocus
        />
        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {pickerMatches.length === 0 && <div className="py-4 text-center text-sm text-slate-500">No matching profiles.</div>}
          {pickerMatches.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProfile(p)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                selectedProfile?.id === p.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="font-medium text-slate-800">{p.full_name}</div>
              <div className="text-xs text-slate-500">
                {p.email} · role: {p.role}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPickerOpen(false)}>
            Cancel
          </Button>
          <Button onClick={proceedFromPicker} disabled={!selectedProfile}>
            Continue
          </Button>
        </div>
      </Modal>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? "Edit Mentor" : `New Mentor — ${selectedProfile?.full_name ?? ""}`}
        width="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <div className="col-span-2">
            <Field label="Photo URL">
              <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Bio (short)">
              <Textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Long bio">
              <Textarea rows={4} value={form.long_bio} onChange={(e) => setForm({ ...form, long_bio: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Expertise (comma-separated)">
              <Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Social links">
              <SocialsEditor value={form.socials} onChange={(socials) => setForm({ ...form, socials })} />
            </Field>
          </div>
          <div className="col-span-2 flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured
            </label>
          </div>
        </div>

        {formError && (
          <div className="mt-4">
            <ErrorState message={formError} />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditorOpen(false)}>
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
