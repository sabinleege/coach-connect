import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Session {
  id: string;
  coach_id: string;
  title: string;
  athlete_ids: string[];
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  session_type: "training" | "court" | "assessment" | "recovery" | "team";
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  created_at: string;
}

export function useSessions() {
  return useQuery({
    queryKey: ["coach-sessions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sessions")
        .select("*")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Session[];
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Session>) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await (supabase as any)
        .from("sessions")
        .insert({ ...input, coach_id: u.user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Session created");
      qc.invalidateQueries({ queryKey: ["coach-sessions"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Session> & { id: string }) => {
      const { error } = await (supabase as any).from("sessions").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-sessions"] }),
    onError: (e: any) => toast.error(e.message),
  });
}
