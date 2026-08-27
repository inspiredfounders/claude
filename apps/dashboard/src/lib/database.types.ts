export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = "free" | "member" | "mentor" | "admin";
export type PostChannel = "Wins" | "Questions" | "Resources" | "Collabs" | "Events" | "Mindset" | "Fundraising" | "Growth";
export type EventType = "assembly" | "workshop" | "networking" | "panel" | "masterclass";
export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";
export type MentorshipApplicationStatus = "pending" | "accepted" | "declined";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          company: string | null;
          company_stage: string | null;
          industry: string | null;
          location: string | null;
          website: string | null;
          linkedin_url: string | null;
          twitter_handle: string | null;
          member_since: string | null;
          is_verified: boolean;
          notification_preferences: Json;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at" | "is_verified"> & {
          created_at?: string;
          updated_at?: string;
          is_verified?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };

      posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          author_id: string;
          channel: PostChannel;
          content: string;
          media_url: string | null;
          media_type: "image" | "video" | null;
          hashtags: string[];
          collaborator_ids: string[];
          likes_count: number;
          comments_count: number;
          is_pinned: boolean;
          is_deleted: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at" | "updated_at" | "likes_count" | "comments_count" | "is_pinned" | "is_deleted"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
          comments_count?: number;
          is_pinned?: boolean;
          is_deleted?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
        Relationships: [];
      };

      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_likes"]["Row"], "created_at"> & { created_at?: string };
        Update: never;
        Relationships: [];
      };

      post_saves: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_saves"]["Row"], "created_at"> & { created_at?: string };
        Update: never;
        Relationships: [];
      };

      comments: {
        Row: {
          id: string;
          created_at: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_id: string | null;
          likes_count: number;
          is_deleted: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["comments"]["Row"], "id" | "created_at" | "likes_count" | "is_deleted"> & {
          id?: string;
          created_at?: string;
          likes_count?: number;
          is_deleted?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
        Relationships: [];
      };

      events: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
          event_type: EventType;
          starts_at: string;
          ends_at: string;
          location: string | null;
          is_virtual: boolean;
          meeting_url: string | null;
          cover_image_url: string | null;
          host_id: string;
          max_attendees: number | null;
          attendees_count: number;
          is_member_only: boolean;
          is_published: boolean;
          tags: string[];
        };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at" | "updated_at" | "attendees_count"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          attendees_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };

      event_rsvps: {
        Row: {
          event_id: string;
          user_id: string;
          created_at: string;
          status: "going" | "waitlist" | "cancelled";
        };
        Insert: Omit<Database["public"]["Tables"]["event_rsvps"]["Row"], "created_at"> & { created_at?: string };
        Update: Partial<Database["public"]["Tables"]["event_rsvps"]["Insert"]>;
        Relationships: [];
      };

      roles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          company: string;
          company_logo_url: string | null;
          description: string;
          responsibilities: string[];
          requirements: string[];
          compensation: string | null;
          role_type: "full-time" | "part-time" | "contract" | "advisory" | "co-founder";
          location: string | null;
          is_remote: boolean;
          poster_id: string;
          applications_count: number;
          is_active: boolean;
          tags: string[];
        };
        Insert: Omit<Database["public"]["Tables"]["roles"]["Row"], "id" | "created_at" | "updated_at" | "applications_count"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          applications_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };

      applications: {
        Row: {
          id: string;
          created_at: string;
          role_id: string;
          applicant_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          website: string | null;
          linkedin_url: string | null;
          pitch: string;
          experience: string | null;
          status: ApplicationStatus;
          reviewed_at: string | null;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["applications"]["Row"], "id" | "created_at" | "status" | "reviewed_at" | "notes"> & {
          id?: string;
          created_at?: string;
          status?: ApplicationStatus;
          reviewed_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [];
      };

      connections: {
        Row: {
          id: string;
          created_at: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "declined";
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["connections"]["Row"], "id" | "created_at" | "updated_at" | "status"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: "pending" | "accepted" | "declined";
        };
        Update: Partial<Database["public"]["Tables"]["connections"]["Insert"]>;
        Relationships: [];
      };

      mentors: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          profile_id: string;
          title: string;
          location: string | null;
          photo_url: string | null;
          bio: string;
          long_bio: string | null;
          expertise: string[];
          socials: Json;
          available: boolean;
          featured: boolean;
          mentored_count: number;
          rating: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["mentors"]["Row"], "id" | "created_at" | "updated_at" | "available" | "featured" | "mentored_count" | "rating"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          available?: boolean;
          featured?: boolean;
          mentored_count?: number;
          rating?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["mentors"]["Insert"]>;
        Relationships: [];
      };

      mentor_sessions: {
        Row: {
          id: string;
          created_at: string;
          mentor_id: string;
          title: string;
          starts_at: string;
          duration_minutes: number;
          max_attendees: number | null;
          attendees_count: number;
        };
        Insert: Omit<Database["public"]["Tables"]["mentor_sessions"]["Row"], "id" | "created_at" | "attendees_count"> & {
          id?: string;
          created_at?: string;
          attendees_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["mentor_sessions"]["Insert"]>;
        Relationships: [];
      };

      mentor_session_rsvps: {
        Row: {
          session_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["mentor_session_rsvps"]["Row"], "created_at"> & { created_at?: string };
        Update: never;
        Relationships: [];
      };

      mentorship_applications: {
        Row: {
          id: string;
          created_at: string;
          mentor_id: string;
          applicant_id: string;
          building: string;
          challenge: string;
          goal: string;
          session_length_minutes: number;
          availability: string[];
          status: MentorshipApplicationStatus;
          reviewed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["mentorship_applications"]["Row"], "id" | "created_at" | "status" | "reviewed_at"> & {
          id?: string;
          created_at?: string;
          status?: MentorshipApplicationStatus;
          reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["mentorship_applications"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      post_channel: PostChannel;
      event_type: EventType;
      application_status: ApplicationStatus;
      mentorship_application_status: MentorshipApplicationStatus;
    };
  };
}

// Convenience row types
export type Profile     = Database["public"]["Tables"]["profiles"]["Row"];
export type Post        = Database["public"]["Tables"]["posts"]["Row"];
export type Comment     = Database["public"]["Tables"]["comments"]["Row"];
export type Event       = Database["public"]["Tables"]["events"]["Row"];
export type EventRsvp   = Database["public"]["Tables"]["event_rsvps"]["Row"];
export type Role        = Database["public"]["Tables"]["roles"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type Connection  = Database["public"]["Tables"]["connections"]["Row"];
export type Mentor      = Database["public"]["Tables"]["mentors"]["Row"];
export type MentorSession = Database["public"]["Tables"]["mentor_sessions"]["Row"];
export type MentorshipApplication = Database["public"]["Tables"]["mentorship_applications"]["Row"];
