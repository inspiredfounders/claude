import { supabase } from "../supabase";

type Bucket = "avatars" | "covers" | "vault-files";

async function uploadFile(bucket: Bucket, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  return uploadFile("avatars", `${userId}/avatar.${ext}`, file);
}

export async function uploadCover(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  return uploadFile("covers", `${userId}/cover.${ext}`, file);
}

export async function uploadVaultFile(slug: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "pdf";
  return uploadFile("vault-files", `${slug}.${ext}`, file);
}
