import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Hardcoded fallbacks so the client works even when .env is absent.
// The anon key is intentionally public — Supabase RLS enforces all access rules.
const SUPABASE_URL      = "https://yrqixvpprmbokxaosmez.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycWl4dnBwcm1ib2t4YW9zbWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODQyMjIsImV4cCI6MjEwMDQ2MDIyMn0.qDYTwuZi1aRecckCgVlc0F_uFky_bbDP8UVJPAuR5NQ";

const supabaseUrl     = (import.meta.env.VITE_SUPABASE_URL     as string) || SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type { Database };
