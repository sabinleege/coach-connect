import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type InjuryStatus = "active" | "recovering" | "resolved";
export type Injury = {
  id: string;
  athlete_id: string;
  body_part: string;
  injury_type: string;
  severity: number;
  status: InjuryStatus;
  date_reported: string;
  expected_return: string | null;
  notes: string | null;
  recovery_timeline: any;
  created_at: string;
  updated_at: string;
  athlete?: { id: string; full_name: string | null; avatar_url: string | null; email: string | null } | null;
};

export function useInjuries(opts?: { athleteId?: string; activeOnly?: boolean }) {
  return useQuery({
    queryKey: ["injuries", opts?.athleteId ?? "all", opts?.activeOnly ?? false],
    queryFn: async (): Promise<Injury[]> => {
      let q = supabase
        .from("injuries")
        .select("*, athlete:athlete_id ( id, full_name, avatar_url, email )")
        .order("date_reported", { ascending: false });
      if (opts?.athleteId) q = q.eq("athlete_id", opts.athleteId);
      if (opts?.activeOnly) q = q.neq("status", "resolved");
      const { data, error } = await q;
      if (error) throw error;
      return (data as any) ?? [];
    },
  });
}

export function useCreateInjury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Injury, "id" | "created_at" | "updated_at" | "athlete">) => {
      const { error } = await supabase.from("injuries").insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Injury logged");
      qc.invalidateQueries({ queryKey: ["injuries"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateInjury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Omit<Injury, "athlete" | "id">> }) => {
      const { error } = await supabase.from("injuries").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Injury updated");
      qc.invalidateQueries({ queryKey: ["injuries"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}
