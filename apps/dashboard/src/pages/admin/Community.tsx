import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge, Button, EmptyState, ErrorState, PageHeader, Spinner, Table, Td, Th } from "@/components/ui";

interface PostRow {
  id: string;
  created_at: string;
  channel: string;
  content: string;
  likes_count: number;
  comments_count: number;
  is_deleted: boolean;
  author: { full_name: string } | null;
}

const PAGE_SIZE = 50;

export function Community() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  async function load(offset: number) {
    const { data, error: err } = await supabase
      .from("posts")
      .select("id, created_at, channel, content, likes_count, comments_count, is_deleted, author:profiles(full_name)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (err) {
      setError(err.message);
      return;
    }
    const rows = (data ?? []) as unknown as PostRow[];
    setHasMore(rows.length === PAGE_SIZE);
    return rows;
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    load(0).then((rows) => {
      if (rows) setPosts(rows);
      setLoading(false);
    });
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    const rows = await load(posts.length);
    if (rows) setPosts((prev) => [...prev, ...rows]);
    setLoadingMore(false);
  }

  async function removePost(id: string) {
    if (!confirm("Remove this post from the community feed?")) return;
    const { data, error: err } = await supabase.from("posts").update({ is_deleted: true }).eq("id", id).select("id");
    if (err) {
      alert(`Failed to remove post: ${err.message}`);
      return;
    }
    if (!data || data.length === 0) {
      alert(
        "The post wasn't removed — the current RLS policy on `posts` only lets the original author update their own post. An admin-wide UPDATE policy needs to be added to migration for this to work for posts authored by others."
      );
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <PageHeader title="Community" description="Recent posts across the feed. Removing a post soft-deletes it." />

      {error && <ErrorState message={error} />}
      {loading && <Spinner />}
      {!loading && !error && posts.length === 0 && <EmptyState message="No posts yet." />}
      {!loading && !error && posts.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Author</Th>
                <Th>Channel</Th>
                <Th>Content</Th>
                <Th>Likes</Th>
                <Th>Comments</Th>
                <Th>Posted</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((p) => (
                <tr key={p.id}>
                  <Td className="font-medium">{p.author?.full_name ?? "—"}</Td>
                  <Td>
                    <Badge tone="indigo">{p.channel}</Badge>
                  </Td>
                  <Td className="max-w-md truncate">{p.content}</Td>
                  <Td>{p.likes_count}</Td>
                  <Td>{p.comments_count}</Td>
                  <Td>{new Date(p.created_at).toLocaleString()}</Td>
                  <Td>
                    <Button variant="danger" onClick={() => removePost(p.id)}>
                      Remove
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
