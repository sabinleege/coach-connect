import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/** Subscribes to live updates on injuries, coach_notes, follow_ups, workout_logs and invalidates relevant queries. */
export function useCoachRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("coach-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "injuries" }, () =>
        qc.invalidateQueries({ queryKey: ["injuries"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "coach_notes" }, () =>
        qc.invalidateQueries({ queryKey: ["coach-notes"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, () =>
        qc.invalidateQueries({ queryKey: ["follow-ups"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "workout_logs" }, () => {
        qc.invalidateQueries({ queryKey: ["athlete"] });
        qc.invalidateQueries({ queryKey: ["my-athletes"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () =>
        qc.invalidateQueries({ queryKey: ["coach-sessions"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "coach_invites" }, () =>
        qc.invalidateQueries({ queryKey: ["coach-invites"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "coach_athlete_relations" }, () => {
        qc.invalidateQueries({ queryKey: ["my-athletes"] });
        qc.invalidateQueries({ queryKey: ["my-athletes-coverage"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () =>
        qc.invalidateQueries({ queryKey: ["subscription"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () =>
        qc.invalidateQueries({ queryKey: ["notifications"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);
}
