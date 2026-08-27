import { supabase } from "../supabase";
import type { Mentor, MentorSession, MentorshipApplication } from "../database.types";

export interface MentorWithSessions extends Mentor {
  sessions: MentorSession[];
}

export async function getMentors(): Promise<MentorWithSessions[]> {
  const { data, error } = await supabase
    .from("mentors")
    .select(`
      *,
      sessions:mentor_sessions(*)
    `)
    .order("featured", { ascending: false })
    .order("mentored_count", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []) as MentorWithSessions[];
}

export async function getMentor(mentorId: string): Promise<MentorWithSessions | null> {
  const { data, error } = await supabase
    .from("mentors")
    .select(`
      *,
      sessions:mentor_sessions(*)
    `)
    .eq("id", mentorId)
    .single();
  if (error) { console.error(error); return null; }
  return data as MentorWithSessions;
}

export async function getMentorByProfileId(profileId: string): Promise<Mentor | null> {
  const { data, error } = await supabase
    .from("mentors")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

export async function updateMentorProfile(mentorId: string, updates: Partial<Mentor>) {
  const { data, error } = await supabase
    .from("mentors")
    .update(updates)
    .eq("id", mentorId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function rsvpToMentorSession(sessionId: string, userId: string) {
  const { error } = await supabase
    .from("mentor_session_rsvps")
    .upsert({ session_id: sessionId, user_id: userId });
  if (error) throw error;
}

export async function cancelMentorSessionRsvp(sessionId: string, userId: string) {
  const { error } = await supabase
    .from("mentor_session_rsvps")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getMyMentorSessionRsvps(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("mentor_session_rsvps")
    .select("session_id")
    .eq("user_id", userId);
  if (error) { console.error(error); return []; }
  return (data ?? []).map((r) => r.session_id);
}

export async function submitMentorshipApplication(application: {
  mentor_id: string;
  applicant_id: string;
  building: string;
  challenge: string;
  goal: string;
  session_length_minutes: number;
  availability: string[];
}): Promise<MentorshipApplication> {
  const { data, error } = await supabase
    .from("mentorship_applications")
    .insert(application)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyMentorshipApplications(applicantId: string): Promise<MentorshipApplication[]> {
  const { data, error } = await supabase
    .from("mentorship_applications")
    .select("*")
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

// ─── Mentor-portal side (used by the dashboard, exported here for reuse) ──────

export async function getApplicationsForMentor(mentorId: string): Promise<MentorshipApplication[]> {
  const { data, error } = await supabase
    .from("mentorship_applications")
    .select(`
      *,
      applicant:profiles!mentorship_applications_applicant_id_fkey(id, full_name, avatar_url, company, email)
    `)
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function setMentorshipApplicationStatus(
  applicationId: string,
  status: "accepted" | "declined",
) {
  const { error } = await supabase
    .from("mentorship_applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", applicationId);
  if (error) throw error;
}
