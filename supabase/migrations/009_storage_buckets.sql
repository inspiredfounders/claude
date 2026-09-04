-- ============================================================
-- Storage buckets: avatars, covers, vault-files
-- All three are public-read (the app reads them via getPublicUrl in
-- src/lib/api/storage.ts). Writes are restricted: members can only
-- write into their own userId-prefixed folder in avatars/covers;
-- vault-files is admin-managed content, not user-uploaded.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('vault-files', 'vault-files', true)
on conflict (id) do nothing;

create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own cover"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own cover"
  on storage.objects for update to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Admins can manage vault files"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'vault-files'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'vault-files'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
