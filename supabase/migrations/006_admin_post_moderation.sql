-- ============================================================
-- Admin post moderation
-- The initial schema only let a post's own author update/soft-delete
-- it. The admin dashboard needs to moderate any post (soft-delete via
-- is_deleted), the same way admins can already manage all events.
-- ============================================================

create policy "Admins can manage all posts"
  on public.posts for all to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage all comments"
  on public.comments for all to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
