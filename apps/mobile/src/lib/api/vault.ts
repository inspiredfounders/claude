import { supabase } from "../supabase";

export interface VaultItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  pages: number | null;
  is_featured: boolean;
  is_new: boolean;
  sort_order: number;
  created_at: string;
}

export async function getVaultItems(category?: string): Promise<VaultItem[]> {
  let query = supabase
    .from("vault_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createVaultItem(item: Omit<VaultItem, "id" | "created_at">): Promise<VaultItem> {
  const { data, error } = await supabase
    .from("vault_items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVaultItem(id: string): Promise<void> {
  const { error } = await supabase.from("vault_items").delete().eq("id", id);
  if (error) throw error;
}
