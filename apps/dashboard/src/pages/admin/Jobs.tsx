import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Profile, Role } from "@/lib/database.types";
import { Modal } from "@/components/Modal";
import { Badge, Button, EmptyState, ErrorState, Field, Input, PageHeader, Select, Spinner, Table, Td, Textarea, Th } from "@/components/ui";

const ROLE_TYPES: Role["role_type"][] = ["full-time", "part-time", "contract", "advisory", "co-founder"];

type RoleForm = {
  title: string;
  company: string;
  company_logo_url: string;
  description: string;
  responsibilities: string;
  requirements: string;
  compensation: string;
  role_type: Role["role_type"];
  location: string;
  is_remote: boolean;
  poster_id: string;
  is_active: boolean;
  tags: string;
};

const emptyForm: RoleForm = {
  title: "",
  company: "",
  company_logo_url: "",
  description: "",
  responsibilities: "",
  requirements: "",
  compensation: "",
  role_type: "full-time",
  location: "",
  is_remote: true,
  poster_id: "",
  is_active: true,
  tags: "",
};

const listSplit = (value: string) =>
  value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);

export function Jobs() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadRoles() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from("roles").select("*").order("created_at", { ascending: false }).limit(300);
    if (err) setError(err.message);
    else setRoles(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadRoles();
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

  function openEdit(role: Role) {
    setEditingId(role.id);
    setForm({
      title: role.title,
      company: role.company,
      company_logo_url: role.company_logo_url || "",
      description: role.description,
      responsibilities: role.responsibilities.join("\n"),
      requirements: role.requirements.join("\n"),
      compensation: role.compensation || "",
      role_type: role.role_type,
      location: role.location || "",
      is_remote: role.is_remote,
      poster_id: role.poster_id,
      is_active: role.is_active,
      tags: role.tags.join(", "),
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.company.trim() || !form.description.trim() || !form.poster_id) {
      setFormError("Title, company, description, and poster are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      company_logo_url: form.company_logo_url.trim() || null,
      description: form.description.trim(),
      responsibilities: listSplit(form.responsibilities),
      requirements: listSplit(form.requirements),
      compensation: form.compensation.trim() || null,
      role_type: form.role_type,
      location: form.location.trim() || null,
      is_remote: form.is_remote,
      poster_id: form.poster_id,
      is_active: form.is_active,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const result = editingId
      ? await supabase.from("roles").update(payload).eq("id", editingId)
      : await supabase.from("roles").insert(payload);

    setSaving(false);
    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setModalOpen(false);
    loadRoles();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this job role? This cannot be undone.")) return;
    const { error: err } = await supabase.from("roles").delete().eq("id", id);
    if (err) alert(`Failed to delete: ${err.message}`);
    else setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  async function toggleActive(role: Role) {
    const { error: err } = await supabase.from("roles").update({ is_active: !role.is_active }).eq("id", role.id);
    if (err) alert(`Failed to update: ${err.message}`);
    else setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, is_active: !r.is_active } : r)));
  }

  return (
    <div>
      <PageHeader title="Jobs" description="Manage the job board." actions={<Button onClick={openCreate}>New Role</Button>} />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && roles.length === 0 && <EmptyState message="No roles posted yet." />}
      {!loading && !error && roles.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Company</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Applications</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr key={role.id}>
                <Td className="font-medium">{role.title}</Td>
                <Td>{role.company}</Td>
                <Td className="capitalize">{role.role_type}</Td>
                <Td>
                  <button onClick={() => toggleActive(role)}>
                    <Badge tone={role.is_active ? "green" : "slate"}>{role.is_active ? "Active" : "Inactive"}</Badge>
                  </button>
                </Td>
                <Td>
                  <Link to={`/jobs/${role.id}/applications`} className="text-indigo-600 hover:underline">
                    {role.applications_count} applications
                  </Link>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openEdit(role)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(role.id)}>
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Role" : "New Role"} width="max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Company">
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <Field label="Responsibilities (one per line)">
            <Textarea rows={3} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} />
          </Field>
          <Field label="Requirements (one per line)">
            <Textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </Field>
          <Field label="Role type">
            <Select value={form.role_type} onChange={(e) => setForm({ ...form, role_type: e.target.value as Role["role_type"] })}>
              {ROLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Compensation">
            <Input value={form.compensation} onChange={(e) => setForm({ ...form, compensation: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Company logo URL">
            <Input value={form.company_logo_url} onChange={(e) => setForm({ ...form, company_logo_url: e.target.value })} />
          </Field>
          <Field label="Posted by">
            <Select value={form.poster_id} onChange={(e) => setForm({ ...form, poster_id: e.target.value })}>
              <option value="">Select a poster…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.email})
                </option>
              ))}
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Tags (comma-separated)">
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-2 flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_remote} onChange={(e) => setForm({ ...form, is_remote: e.target.checked })} />
              Remote
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
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
