import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CoachInvite {
  id: string;
  coach_id: string;
  email: string | null;
  invite_code: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

export function useMyInvites() {
  return useQuery({
    queryKey: ["coach-invites"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("coach_invites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CoachInvite[];
    },
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string | null) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { data, error } = await (supabase as any)
        .from("coach_invites")
        .insert({ coach_id: u.user.id, email: email || null })
        .select()
        .single();
      if (error) throw error;
      return data as CoachInvite;
    },
    onSuccess: (inv) => {
      toast.success("Invite created", { description: `Code: ${inv.invite_code}` });
      qc.invalidateQueries({ queryKey: ["coach-invites"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("coach_invites")
        .update({ status: "revoked" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-invites"] }),
  });
}
