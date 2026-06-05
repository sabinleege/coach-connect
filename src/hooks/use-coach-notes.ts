import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CoachNote = {
  id: string;
  coach_id: string;
  athlete_id: string;
  content: string;
  visible_to_athlete: boolean;
  created_at: string;
  updated_at: string;
};

export function useCoachNotes(athleteId: string) {
  return useQuery({
    queryKey: ["coach-notes", athleteId],
    enabled: !!athleteId,
    queryFn: async (): Promise<CoachNote[]> => {
      const { data, error } = await supabase
        .from("coach_notes")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateCoachNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { athlete_id: string; content: string; visible_to_athlete: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("coach_notes").insert({ ...input, coach_id: u.user.id });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success("Note saved");
      qc.invalidateQueries({ queryKey: ["coach-notes", v.athlete_id] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteCoachNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coach_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-notes"] }),
  });
}
