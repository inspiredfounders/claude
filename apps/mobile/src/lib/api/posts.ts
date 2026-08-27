import { supabase } from "../supabase";
import type { Post, PostChannel } from "../database.types";

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    company: string | null;
    role: string;
  };
  liked: boolean;
  saved: boolean;
}

export async function getPosts(
  currentUserId: string,
  channel?: PostChannel,
  limit = 20,
  offset = 0,
): Promise<PostWithAuthor[]> {
  let query = supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, full_name, avatar_url, company, role),
      post_likes!left(user_id),
      post_saves!left(user_id)
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (channel) query = query.eq("channel", channel);

  const { data, error } = await query;
  if (error) { console.error(error); return []; }

  return (data ?? []).map((p: any) => ({
    ...p,
    liked: p.post_likes?.some((l: any) => l.user_id === currentUserId) ?? false,
    saved: p.post_saves?.some((s: any) => s.user_id === currentUserId) ?? false,
    post_likes: undefined,
    post_saves: undefined,
  }));
}

export async function createPost(post: {
  author_id: string;
  channel: PostChannel;
  content: string;
  media_url?: string;
  media_type?: "image" | "video";
  hashtags?: string[];
  collaborator_ids?: string[];
}) {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function toggleSave(postId: string, userId: string, saved: boolean) {
  if (saved) {
    const { error } = await supabase
      .from("post_saves")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("post_saves")
      .insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function softDeletePost(postId: string) {
  const { error } = await supabase
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", postId);
  if (error) throw error;
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      author:profiles!comments_author_id_fkey(id, full_name, avatar_url, company, role)
    `)
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function createComment(comment: {
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
}) {
  const { data, error } = await supabase
    .from("comments")
    .insert(comment)
    .select()
    .single();
  if (error) throw error;
  return data;
}
