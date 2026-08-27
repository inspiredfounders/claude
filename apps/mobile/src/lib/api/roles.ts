import { supabase } from "../supabase";

export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select(`
      *,
      poster:profiles!roles_poster_id_fkey(id, full_name, avatar_url, company)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function submitApplication(application: {
  role_id: string;
  applicant_id: string;
  full_name: string;
  email: string;
  phone?: string;
  website?: string;
  linkedin_url?: string;
  pitch: string;
  experience?: string;
}) {
  const { data, error } = await supabase
    .from("applications")
    .insert(application)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, role:roles(*)")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}
