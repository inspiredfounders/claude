import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, UserRole } from "@/lib/database.types";
import { EmptyState, ErrorState, Input, PageHeader, Select, Spinner, Table, Td, Th } from "@/components/ui";

const ROLE_OPTIONS: UserRole[] = ["free", "member", "mentor", "admin"];

export function Members() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(300);
      if (roleFilter !== "all") query = query.eq("role", roleFilter);
      if (search.trim()) {
        const term = search.trim().replace(/[%_]/g, "");
        query = query.or(`full_name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%`);
      }
      const { data, error: err } = await query;
      if (cancelled) return;
      if (err) setError(err.message);
      else setMembers(data ?? []);
      setLoading(false);
    }
    const t = setTimeout(load, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, roleFilter]);

  async function changeRole(id: string, role: UserRole) {
    setSavingId(id);
    const { error: err } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (err) {
      alert(`Failed to update role: ${err.message}`);
    } else {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    }
    setSavingId(null);
  }

  return (
    <div>
      <PageHeader title="Members" description="Search members and manage account roles." />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name, company, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")} className="w-auto">
          <option value="all">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && members.length === 0 && <EmptyState message="No members match your filters." />}
      {!loading && !error && members.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Company</Th>
              <Th>Location</Th>
              <Th>Role</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id}>
                <Td className="font-medium">{m.full_name}</Td>
                <Td>{m.email}</Td>
                <Td>{m.company || "—"}</Td>
                <Td>{m.location || "—"}</Td>
                <Td>
                  <Select
                    value={m.role}
                    disabled={savingId === m.id}
                    onChange={(e) => changeRole(m.id, e.target.value as UserRole)}
                    className="w-32"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
