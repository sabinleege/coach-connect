import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FollowUpStatus = "pending" | "done" | "snoozed";
export type FollowUp = {
  id: string;
  coach_id: string;
  athlete_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: "low" | "normal" | "high";
  status: FollowUpStatus;
  created_at: string;
  updated_at: string;
  athlete?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export function useFollowUps(opts?: { athleteId?: string; status?: FollowUpStatus }) {
  return useQuery({
    queryKey: ["follow-ups", opts?.athleteId ?? "all", opts?.status ?? "any"],
    queryFn: async (): Promise<FollowUp[]> => {
      let q = supabase
        .from("follow_ups")
        .select("*, athlete:athlete_id ( id, full_name, avatar_url )")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (opts?.athleteId) q = q.eq("athlete_id", opts.athleteId);
      if (opts?.status) q = q.eq("status", opts.status);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any) ?? [];
    },
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<FollowUp, "id" | "coach_id" | "created_at" | "updated_at" | "athlete" | "status"> & { status?: FollowUpStatus }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("follow_ups").insert({ ...input, coach_id: u.user.id, status: input.status ?? "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Follow-up added");
      qc.invalidateQueries({ queryKey: ["follow-ups"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Omit<FollowUp, "athlete" | "id">> }) => {
      const { error } = await supabase.from("follow_ups").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["follow-ups"] }),
    onError: (e: any) => toast.error(e.message),
  });
}
