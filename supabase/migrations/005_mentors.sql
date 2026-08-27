-- ============================================================
-- The Inspired Club — Mentors
-- Adds a real 'mentor' role/account type, mentor profiles,
-- mentor-hosted sessions, and mentorship applications that
-- actually persist (the Figma Make prototype's mentor booking
-- form only flipped local UI state and never wrote to the DB).
-- ============================================================

-- ── Extend user_role ─────────────────────────────────────────
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mentor';

-- ── Enums ────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentorship_application_status') THEN
    CREATE TYPE mentorship_application_status AS ENUM ('pending', 'accepted', 'declined');
  END IF;
END $$;

-- ── Mentors ──────────────────────────────────────────────────
-- One row per mentor, extending their profiles row (role = 'mentor' or 'admin').
create table if not exists public.mentors (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  profile_id     uuid not null unique references public.profiles(id) on delete cascade,
  title          text not null,
  location       text,
  photo_url      text,
  bio            text not null,
  long_bio       text,
  expertise      text[] not null default '{}',
  socials        jsonb not null default '[]'::jsonb, -- [{ platform, handle, url }]
  available      boolean not null default true,
  featured       boolean not null default false,
  mentored_count integer not null default 0,
  rating         numeric(2,1)
);

create trigger mentors_updated_at before update on public.mentors
  for each row execute procedure public.set_updated_at();

create index mentors_profile_id_idx on public.mentors(profile_id);

-- ── Mentor Sessions (group sessions a mentor hosts) ─────────────
create table if not exists public.mentor_sessions (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  mentor_id         uuid not null references public.mentors(id) on delete cascade,
  title             text not null,
  starts_at         timestamptz not null,
  duration_minutes  integer not null default 60,
  max_attendees     integer,
  attendees_count   integer not null default 0
);

create index mentor_sessions_mentor_id_idx on public.mentor_sessions(mentor_id);
create index mentor_sessions_starts_at_idx on public.mentor_sessions(starts_at);

-- ── Mentor Session RSVPs ─────────────────────────────────────
create table if not exists public.mentor_session_rsvps (
  session_id uuid not null references public.mentor_sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create or replace function public.update_mentor_session_attendees_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.mentor_sessions set attendees_count = attendees_count + 1 where id = new.session_id;
  elsif tg_op = 'DELETE' then
    update public.mentor_sessions set attendees_count = greatest(attendees_count - 1, 0) where id = old.session_id;
  end if;
  return null;
end;
$$;

create trigger mentor_session_rsvps_count
  after insert or delete on public.mentor_session_rsvps
  for each row execute procedure public.update_mentor_session_attendees_count();

-- ── Mentorship Applications (1:1 mentorship requests) ────────
-- Replaces the prototype's non-persisting booking form.
create table if not exists public.mentorship_applications (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  mentor_id               uuid not null references public.mentors(id) on delete cascade,
  applicant_id            uuid not null references public.profiles(id) on delete cascade,
  building                text not null check (length(building) >= 10),
  challenge               text not null check (length(challenge) >= 10),
  goal                    text not null check (length(goal) >= 10),
  session_length_minutes  integer not null default 60,
  availability            text[] not null default '{}',
  status                  mentorship_application_status not null default 'pending',
  reviewed_at             timestamptz
);

create index mentorship_applications_mentor_id_idx on public.mentorship_applications(mentor_id);
create index mentorship_applications_applicant_id_idx on public.mentorship_applications(applicant_id);

-- ── Row Level Security ────────────────────────────────────────
alter table public.mentors                  enable row level security;
alter table public.mentor_sessions          enable row level security;
alter table public.mentor_session_rsvps     enable row level security;
alter table public.mentorship_applications  enable row level security;

-- Mentors: visible to any member/mentor/admin; a mentor can manage their own row; admins manage all.
create policy "Mentors visible to members"
  on public.mentors for select to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('member', 'mentor', 'admin'))
  );
create policy "Mentors can update their own mentor profile"
  on public.mentors for update to authenticated
  using (profile_id = auth.uid());
create policy "Admins can manage all mentor profiles"
  on public.mentors for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Mentor sessions: visible to members; mentor manages their own; admin manages all.
create policy "Mentor sessions visible to members"
  on public.mentor_sessions for select to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('member', 'mentor', 'admin'))
  );
create policy "Mentors can manage their own sessions"
  on public.mentor_sessions for all to authenticated
  using (exists (select 1 from public.mentors where id = mentor_id and profile_id = auth.uid()));
create policy "Admins can manage all mentor sessions"
  on public.mentor_sessions for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Mentor session RSVPs
create policy "Users can manage their own session RSVPs"
  on public.mentor_session_rsvps for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Session RSVP counts visible to members"
  on public.mentor_session_rsvps for select to authenticated using (true);

-- Mentorship applications: applicant sees their own; the target mentor sees applications
-- addressed to them; admins see all.
create policy "Applicants can see their own mentorship applications"
  on public.mentorship_applications for select to authenticated
  using (auth.uid() = applicant_id);
create policy "Mentors can see applications addressed to them"
  on public.mentorship_applications for select to authenticated
  using (exists (select 1 from public.mentors where id = mentor_id and profile_id = auth.uid()));
create policy "Admins can see all mentorship applications"
  on public.mentorship_applications for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Members can submit mentorship applications"
  on public.mentorship_applications for insert to authenticated
  with check (
    auth.uid() = applicant_id and
    exists (select 1 from public.profiles where id = auth.uid() and role in ('member', 'mentor', 'admin'))
  );
create policy "Mentors can update status on their own applications"
  on public.mentorship_applications for update to authenticated
  using (exists (select 1 from public.mentors where id = mentor_id and profile_id = auth.uid()));
create policy "Admins can update any mentorship application"
  on public.mentorship_applications for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
