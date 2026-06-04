import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AthleteSummary = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  age: number | null;
  weight: number | null;
  target_weight: number | null;
  fitness_score: number | null;
  recovery_score: number | null;
  consistency_score: number | null;
  onboarding_completed: boolean;
  relation_status: string;
};

export function useMyAthletes() {
  return useQuery({
    queryKey: ["my-athletes"],
    queryFn: async (): Promise<AthleteSummary[]> => {
      const { data: rels, error } = await supabase
        .from("coach_athlete_relations")
        .select("status, athlete_id, profiles:athlete_id ( id, full_name, email, avatar_url, age, weight, target_weight, fitness_score, recovery_score, consistency_score, onboarding_completed )")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (rels ?? [])
        .filter((r: any) => r.profiles)
        .map((r: any) => ({ ...r.profiles, relation_status: r.status }));
    },
  });
}

export function useAthleteDetail(athleteId: string) {
  return useQuery({
    queryKey: ["athlete", athleteId],
    queryFn: async () => {
      const [profile, weights, workouts, activity] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", athleteId).maybeSingle(),
        supabase.from("weight_history").select("*").eq("user_id", athleteId).order("recorded_at", { ascending: true }).limit(12),
        supabase.from("workout_logs").select("*").eq("user_id", athleteId).order("date", { ascending: false }).limit(30),
        supabase.from("activity_data").select("*").eq("user_id", athleteId).order("date", { ascending: false }).limit(14),
      ]);
      return {
        profile: profile.data,
        weights: weights.data ?? [],
        workouts: workouts.data ?? [],
        activity: activity.data ?? [],
      };
    },
    enabled: !!athleteId,
  });
}

export function useCoachProfile() {
  return useQuery({
    queryKey: ["coach-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return { ...data, email: u.user.email, id: u.user.id };
    },
  });
}
