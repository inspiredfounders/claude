import { supabase } from "../supabase";
import type { Profile } from "../database.types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllMembers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["member", "admin"])
    .order("full_name");
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`full_name.ilike.%${query}%,company.ilike.%${query}%`)
    .in("role", ["member", "admin"])
    .limit(20);
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function upgradToMember(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ role: "member", member_since: new Date().toISOString().split("T")[0] })
    .eq("id", userId);
  if (error) throw error;
}
