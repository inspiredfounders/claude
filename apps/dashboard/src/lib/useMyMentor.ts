import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Mentor } from "@/lib/database.types";
import { useAuth } from "@/context/AuthContext";

/**
 * Loads the mentor row for the currently signed-in mentor user
 * (mentors.profile_id = auth.uid()). A logged-in `mentor` profile may not yet
 * have a mentors row if an admin changed their role but hasn't finished
 * setting up their mentor profile — callers should handle `mentor === null`.
 */
export function useMyMentor() {
  const { session } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    if (!session) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from("mentors").select("*").eq("profile_id", session.user.id).maybeSingle();
    if (err) setError(err.message);
    else setMentor(data);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  return { mentor, setMentor, loading, error, reload };
}
