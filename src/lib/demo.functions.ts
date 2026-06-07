import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FIRST = ["Alex", "Jordan", "Taylor", "Riley", "Sam", "Morgan", "Casey", "Drew"];
const LAST = ["Reyes", "Park", "Nguyen", "Kowalski", "Diallo", "Bianchi", "Okafor", "Singh"];
const GOALS = ["Lose fat", "Build muscle", "Marathon prep", "General fitness", "Strength"];
const BODY_PARTS = ["Left knee", "Right shoulder", "Lower back", "Right ankle"];

function rand<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }
function ri(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure caller is a coach
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: "coach" },
      { onConflict: "user_id,role" }
    );

    // Update coach profile name if empty
    await supabaseAdmin.from("profiles").update({ full_name: "Demo Coach" }).eq("id", userId).is("full_name", null);

    // Check existing
    const { data: existing } = await supabase
      .from("coach_athlete_relations")
      .select("id")
      .limit(1);
    if (existing && existing.length > 0) return { ok: true, skipped: true };

    const created: string[] = [];
    for (let i = 0; i < 6; i++) {
      const first = rand(FIRST);
      const last = rand(LAST);
      const email = `demo-${first.toLowerCase()}-${Date.now()}-${i}@securefit.demo`;
      const { data: u, error: uErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: { full_name: `${first} ${last}`, role: "athlete" },
      });
      if (uErr || !u.user) continue;
      const aid = u.user.id;
      created.push(aid);

      await supabaseAdmin.from("profiles").upsert({
        id: aid,
        full_name: `${first} ${last}`,
        email,
        age: ri(20, 45),
        weight: ri(60, 95),
        target_weight: ri(55, 85),
        fitness_score: ri(40, 95),
        recovery_score: ri(40, 95),
        consistency_score: ri(30, 98),
        adherence_percentage: ri(40, 98),
        primary_goal: rand(GOALS),
        onboarding_completed: true,
        last_active_at: new Date(Date.now() - ri(0, 5) * 86400000).toISOString(),
      });

      await supabaseAdmin.from("coach_athlete_relations").insert({
        coach_id: userId, athlete_id: aid, status: "active",
      });

      // Weight history (12 weeks)
      const baseW = ri(65, 90);
      const weights = Array.from({ length: 12 }, (_, w) => ({
        user_id: aid,
        week_label: `W${w + 1}`,
        weight: baseW - w * 0.3 + (Math.random() - 0.5),
        recorded_at: new Date(Date.now() - (12 - w) * 7 * 86400000).toISOString(),
      }));
      await supabaseAdmin.from("weight_history").insert(weights);

      // Workouts (last 30 days, ~70% completion)
      const workouts = Array.from({ length: 20 }, (_, d) => ({
        user_id: aid,
        date: new Date(Date.now() - d * 86400000).toISOString().slice(0, 10),
        completion_rate: Math.random() * 0.6 + 0.4,
      }));
      await supabaseAdmin.from("workout_logs").insert(workouts);

      // Activity
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const activity = Array.from({ length: 14 }, (_, d) => ({
        user_id: aid,
        date: new Date(Date.now() - d * 86400000).toISOString().slice(0, 10),
        day: days[new Date(Date.now() - d * 86400000).getDay()],
        calories: ri(1600, 2800),
      }));
      await supabaseAdmin.from("activity_data").insert(activity);

      // 30% chance injury
      if (Math.random() < 0.35) {
        await supabaseAdmin.from("injuries").insert({
          athlete_id: aid,
          body_part: rand(BODY_PARTS),
          injury_type: rand(["Strain", "Sprain", "Tendinitis", "Soreness"]),
          severity: ri(1, 4),
          status: rand(["active", "recovering"]),
          date_reported: new Date(Date.now() - ri(1, 20) * 86400000).toISOString().slice(0, 10),
          notes: "Reported during last session.",
        });
      }

      // Follow-up
      if (Math.random() < 0.5) {
        await supabaseAdmin.from("follow_ups").insert({
          coach_id: userId,
          athlete_id: aid,
          title: rand(["Check in on recovery", "Review weekly plan", "Adjust nutrition targets"]),
          priority: rand(["low", "medium", "high"]),
          status: "pending",
          due_date: new Date(Date.now() + ri(1, 7) * 86400000).toISOString().slice(0, 10),
        });
      }
    }

    return { ok: true, created: created.length };
  });
