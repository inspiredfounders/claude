-- ============================================================
-- The Inspired Club — Initial Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('free', 'member', 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_channel') THEN
    CREATE TYPE post_channel AS ENUM ('Wins', 'Questions', 'Resources', 'Collabs', 'Events', 'Mindset', 'Fundraising', 'Growth');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('assembly', 'workshop', 'networking', 'panel', 'masterclass');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rsvp_status') THEN
    CREATE TYPE rsvp_status AS ENUM ('going', 'waitlist', 'cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
    CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
    CREATE TYPE role_type AS ENUM ('full-time', 'part-time', 'contract', 'advisory', 'co-founder');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE media_type AS ENUM ('image', 'video');
  END IF;
END $$;

-- ── Profiles ─────────────────────────────────────────────────
-- Extends Supabase auth.users
create table if not exists public.profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  email                     text not null unique,
  full_name                 text not null,
  avatar_url                text,
  bio                       text,
  role                      user_role not null default 'free',
  company                   text,
  company_stage             text,
  industry                  text,
  location                  text,
  website                   text,
  linkedin_url              text,
  twitter_handle            text,
  member_since              date,
  is_verified               boolean not null default false,
  notification_preferences  jsonb not null default '{
    "assembly_reminders": true,
    "new_comments": true,
    "post_likes": true,
    "connection_requests": true,
    "event_reminders": true,
    "mentions": true,
    "vault_drops": true
  }'::jsonb
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── Posts ─────────────────────────────────────────────────────
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  author_id        uuid not null references public.profiles(id) on delete cascade,
  channel          post_channel not null,
  content          text not null check (length(content) between 1 and 500),
  media_url        text,
  media_type       media_type,
  hashtags         text[] not null default '{}',
  collaborator_ids uuid[] not null default '{}',
  likes_count      integer not null default 0,
  comments_count   integer not null default 0,
  is_pinned        boolean not null default false,
  is_deleted       boolean not null default false
);

create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.set_updated_at();

create index posts_author_id_idx on public.posts(author_id);
create index posts_channel_idx on public.posts(channel);
create index posts_created_at_idx on public.posts(created_at desc);

-- ── Post Likes ────────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Maintain likes_count automatically
create or replace function public.update_post_likes_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger post_likes_count
  after insert or delete on public.post_likes
  for each row execute procedure public.update_post_likes_count();

-- ── Post Saves ────────────────────────────────────────────────
create table if not exists public.post_saves (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ── Comments ──────────────────────────────────────────────────
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  content      text not null check (length(content) between 1 and 1000),
  parent_id    uuid references public.comments(id) on delete cascade,
  likes_count  integer not null default 0,
  is_deleted   boolean not null default false
);

create index comments_post_id_idx on public.comments(post_id);

-- Maintain comments_count automatically
create or replace function public.update_post_comments_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and new.is_deleted = false then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'UPDATE' and old.is_deleted = false and new.is_deleted = true then
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = new.post_id;
  end if;
  return null;
end;
$$;

create trigger comments_count
  after insert or update on public.comments
  for each row execute procedure public.update_post_comments_count();

-- ── Events ────────────────────────────────────────────────────
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  title            text not null,
  description      text not null,
  event_type       event_type not null default 'workshop',
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  location         text,
  is_virtual       boolean not null default true,
  meeting_url      text,
  cover_image_url  text,
  host_id          uuid not null references public.profiles(id) on delete cascade,
  max_attendees    integer,
  attendees_count  integer not null default 0,
  is_member_only   boolean not null default false,
  is_published     boolean not null default true,
  tags             text[] not null default '{}'
);

create trigger events_updated_at before update on public.events
  for each row execute procedure public.set_updated_at();

create index events_starts_at_idx on public.events(starts_at);
create index events_host_id_idx on public.events(host_id);

-- ── Event RSVPs ───────────────────────────────────────────────
create table if not exists public.event_rsvps (
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  status     rsvp_status not null default 'going',
  primary key (event_id, user_id)
);

-- Maintain attendees_count automatically
create or replace function public.update_event_attendees_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and new.status = 'going' then
    update public.events set attendees_count = attendees_count + 1 where id = new.event_id;
  elsif tg_op = 'UPDATE' then
    if old.status != 'going' and new.status = 'going' then
      update public.events set attendees_count = attendees_count + 1 where id = new.event_id;
    elsif old.status = 'going' and new.status != 'going' then
      update public.events set attendees_count = greatest(attendees_count - 1, 0) where id = new.event_id;
    end if;
  elsif tg_op = 'DELETE' and old.status = 'going' then
    update public.events set attendees_count = greatest(attendees_count - 1, 0) where id = old.event_id;
  end if;
  return null;
end;
$$;

create trigger event_rsvps_count
  after insert or update or delete on public.event_rsvps
  for each row execute procedure public.update_event_attendees_count();

-- ── Roles (Job Board) ─────────────────────────────────────────
create table if not exists public.roles (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  title              text not null,
  company            text not null,
  company_logo_url   text,
  description        text not null,
  responsibilities   text[] not null default '{}',
  requirements       text[] not null default '{}',
  compensation       text,
  role_type          role_type not null default 'full-time',
  location           text,
  is_remote          boolean not null default true,
  poster_id          uuid not null references public.profiles(id) on delete cascade,
  applications_count integer not null default 0,
  is_active          boolean not null default true,
  tags               text[] not null default '{}'
);

create trigger roles_updated_at before update on public.roles
  for each row execute procedure public.set_updated_at();

-- ── Applications ──────────────────────────────────────────────
create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  role_id      uuid not null references public.roles(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  full_name    text not null,
  email        text not null,
  phone        text,
  website      text,
  linkedin_url text,
  pitch        text not null check (length(pitch) >= 30),
  experience   text,
  status       application_status not null default 'pending',
  reviewed_at  timestamptz,
  notes        text,
  unique (role_id, applicant_id)
);

-- Maintain applications_count automatically
create or replace function public.update_role_applications_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.roles set applications_count = applications_count + 1 where id = new.role_id;
  elsif tg_op = 'DELETE' then
    update public.roles set applications_count = greatest(applications_count - 1, 0) where id = old.role_id;
  end if;
  return null;
end;
$$;

create trigger applications_count
  after insert or delete on public.applications
  for each row execute procedure public.update_role_applications_count();

-- ── Connections ───────────────────────────────────────────────
create table if not exists public.connections (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status       connection_status not null default 'pending',
  check (requester_id != addressee_id),
  unique (requester_id, addressee_id)
);

create trigger connections_updated_at before update on public.connections
  for each row execute procedure public.set_updated_at();

create index connections_requester_idx on public.connections(requester_id);
create index connections_addressee_idx on public.connections(addressee_id);

-- ── Row Level Security ────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.post_likes  enable row level security;
alter table public.post_saves  enable row level security;
alter table public.comments    enable row level security;
alter table public.events      enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.roles       enable row level security;
alter table public.applications enable row level security;
alter table public.connections enable row level security;

-- Profiles: readable by all authenticated users; editable only by owner
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Posts: member-only content for is_deleted=false
create policy "Posts viewable by authenticated users"
  on public.posts for select to authenticated
  using (is_deleted = false);
create policy "Users can create posts"
  on public.posts for insert to authenticated
  with check (auth.uid() = author_id);
create policy "Users can update their own posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id);

-- Likes / saves
create policy "Anyone can like/unlike"
  on public.post_likes for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Anyone can save/unsave"
  on public.post_saves for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments
create policy "Comments viewable by authenticated users"
  on public.comments for select to authenticated
  using (is_deleted = false);
create policy "Users can create comments"
  on public.comments for insert to authenticated
  with check (auth.uid() = author_id);
create policy "Users can soft-delete their own comments"
  on public.comments for update to authenticated
  using (auth.uid() = author_id);

-- Events: published events visible to all; member-only gated by role
create policy "Published events visible to authenticated users"
  on public.events for select to authenticated
  using (is_published = true);
create policy "Admins can manage events"
  on public.events for all to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- RSVPs
create policy "Users can manage their own RSVPs"
  on public.event_rsvps for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Event attendee counts visible to all"
  on public.event_rsvps for select to authenticated using (true);

-- Roles (job board): visible to members
create policy "Active roles visible to members"
  on public.roles for select to authenticated
  using (
    is_active = true and
    exists (select 1 from public.profiles where id = auth.uid() and role in ('member', 'admin'))
  );
create policy "Members can post roles"
  on public.roles for insert to authenticated
  with check (
    auth.uid() = poster_id and
    exists (select 1 from public.profiles where id = auth.uid() and role in ('member', 'admin'))
  );

-- Applications: applicant sees own; poster sees all for their roles
create policy "Applicants can see their own applications"
  on public.applications for select to authenticated
  using (auth.uid() = applicant_id);
create policy "Role posters can see applications for their roles"
  on public.applications for select to authenticated
  using (
    exists (select 1 from public.roles where id = role_id and poster_id = auth.uid())
  );
create policy "Members can apply"
  on public.applications for insert to authenticated
  with check (
    auth.uid() = applicant_id and
    exists (select 1 from public.profiles where id = auth.uid() and role in ('member', 'admin'))
  );

-- Connections
create policy "Users can see their own connections"
  on public.connections for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Users can send connection requests"
  on public.connections for insert to authenticated
  with check (auth.uid() = requester_id);
create policy "Addressee can accept/decline"
  on public.connections for update to authenticated
  using (auth.uid() = addressee_id);

-- ── Seed Data ─────────────────────────────────────────────────
-- Note: Run this section after creating your first admin user
-- Replace 'YOUR-ADMIN-USER-ID' with your actual auth.users UUID

-- Sample events (host_id will need a real user ID)
-- insert into public.events (title, description, event_type, starts_at, ends_at, host_id, is_virtual, is_member_only, tags)
-- values
--   ('Monthly Club Assembly', 'Our flagship monthly gathering. Share wins, get feedback, and connect with the community.', 'assembly', now() + interval '7 days', now() + interval '7 days' + interval '2 hours', 'YOUR-ADMIN-USER-ID', true, true, '{"assembly","monthly","community"}'),
--   ('Brand Sprint Workshop', 'A focused 90-minute workshop on building a magnetic brand narrative for your startup.', 'workshop', now() + interval '14 days', now() + interval '14 days' + interval '90 minutes', 'YOUR-ADMIN-USER-ID', true, true, '{"brand","marketing","workshop"}'),
--   ('Founder Networking Night', 'Informal virtual hangout. No agenda, just real conversations.', 'networking', now() + interval '21 days', now() + interval '21 days' + interval '2 hours', 'YOUR-ADMIN-USER-ID', true, false, '{"networking","community"}');
