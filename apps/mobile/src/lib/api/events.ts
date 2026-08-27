import { supabase } from "../supabase";
import type { Event } from "../database.types";

export interface EventWithHost extends Event {
  host: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    company: string | null;
  };
  rsvp_status: "going" | "waitlist" | "cancelled" | null;
}

export async function getUpcomingEvents(currentUserId: string): Promise<EventWithHost[]> {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      host:profiles!events_host_id_fkey(id, full_name, avatar_url, company),
      event_rsvps!left(user_id, status)
    `)
    .eq("is_published", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) { console.error(error); return []; }

  return (data ?? []).map((e: any) => ({
    ...e,
    rsvp_status: e.event_rsvps?.find((r: any) => r.user_id === currentUserId)?.status ?? null,
    event_rsvps: undefined,
  }));
}

export async function getPastEvents(currentUserId: string): Promise<EventWithHost[]> {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      host:profiles!events_host_id_fkey(id, full_name, avatar_url, company),
      event_rsvps!left(user_id, status)
    `)
    .eq("is_published", true)
    .lt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: false })
    .limit(20);

  if (error) { console.error(error); return []; }

  return (data ?? []).map((e: any) => ({
    ...e,
    rsvp_status: e.event_rsvps?.find((r: any) => r.user_id === currentUserId)?.status ?? null,
    event_rsvps: undefined,
  }));
}

export async function rsvpToEvent(eventId: string, userId: string) {
  const { error } = await supabase
    .from("event_rsvps")
    .upsert({ event_id: eventId, user_id: userId, status: "going" });
  if (error) throw error;
}

export async function cancelRsvp(eventId: string, userId: string) {
  const { error } = await supabase
    .from("event_rsvps")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", userId);
  if (error) throw error;
}
