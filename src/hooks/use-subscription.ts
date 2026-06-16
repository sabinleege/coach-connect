import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: "free" | "starter" | "pro" | "team";
  status: "active" | "trialing" | "cancelled" | "past_due";
  seat_limit: number | null;
  covers_athletes: boolean;
  current_period_end: string | null;
}

export function useMySubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async (): Promise<Subscription | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await (supabase as any)
        .from("subscriptions").select("*").eq("user_id", u.user.id).maybeSingle();
      return data as Subscription | null;
    },
  });
}

export function useUpsertSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Subscription>) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await (supabase as any)
        .from("subscriptions")
        .upsert({ user_id: u.user.id, ...patch }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subscription updated");
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useToggleAthleteCoverage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ athleteId, covered }: { athleteId: string; covered: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("coach_athlete_relations")
        .update({ covered_by_coach: covered })
        .eq("coach_id", u.user.id).eq("athlete_id", athleteId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-athletes-coverage"] }),
    onError: (e: any) => toast.error(e.message),
  });
}

export function useAthleteCoverage() {
  return useQuery({
    queryKey: ["my-athletes-coverage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_athlete_relations")
        .select("athlete_id, covered_by_coach, status, profiles:athlete_id ( id, full_name, email, avatar_url )");
      if (error) throw error;
      return (data ?? []).filter((r: any) => r.profiles);
    },
  });
}
