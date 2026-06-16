import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ATHLETES = [
  { first: "Alex", last: "Reyes", goal: "Marathon prep", age: 28, weight: 72, target: 70, fit: 88, rec: 76, con: 92, injuredChance: 0.1 },
  { first: "Jordan", last: "Park", goal: "Build muscle", age: 24, weight: 84, target: 88, fit: 79, rec: 82, con: 85, injuredChance: 0.3 },
  { first: "Taylor", last: "Nguyen", goal: "Lose fat", age: 31, weight: 78, target: 70, fit: 62, rec: 70, con: 58, injuredChance: 0.2 },
  { first: "Riley", last: "Kowalski", goal: "Strength", age: 35, weight: 92, target: 90, fit: 84, rec: 65, con: 74, injuredChance: 0.5 },
  { first: "Sam", last: "Diallo", goal: "General fitness", age: 22, weight: 68, target: 70, fit: 71, rec: 88, con: 80, injuredChance: 0.15 },
  { first: "Morgan", last: "Bianchi", goal: "Court conditioning", age: 27, weight: 75, target: 74, fit: 90, rec: 72, con: 95, injuredChance: 0.25 },
];

const BODY_PARTS = ["Left knee", "Right shoulder", "Lower back", "Right ankle", "Left hamstring"];
const SESSION_TEMPLATES = [
  { title: "Strength block A", type: "training" as const, location: "Main gym" },
  { title: "Court drills", type: "court" as const, location: "Court 3" },
  { title: "Recovery & mobility", type: "recovery" as const, location: "Recovery room" },
  { title: "Performance assessment", type: "assessment" as const, location: "Lab" },
];

function rand<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }
function ri(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: "coach" },
      { onConflict: "user_id,role" }
    );

    await supabaseAdmin.from("profiles").update({ full_name: "Demo Coach" })
      .eq("id", userId).is("full_name", null);

    // Seed a pro subscription
    await supabaseAdmin.from("subscriptions").upsert(
      { user_id: userId, plan_type: "pro", status: "active", seat_limit: 25, covers_athletes: false },
      { onConflict: "user_id" },
    );

    const { data: existing } = await supabase.from("coach_athlete_relations").select("id").limit(1);
    if (existing && existing.length > 0) return { ok: true, skipped: true };

    const created: string[] = [];
    for (let i = 0; i < ATHLETES.length; i++) {
      const a = ATHLETES[i];
      const email = `demo-${a.first.toLowerCase()}-${Date.now()}-${i}@securefit.demo`;
      const { data: u, error: uErr } = await supabaseAdmin.auth.admin.createUser({
        email, password: crypto.randomUUID(), email_confirm: true,
        user_metadata: { full_name: `${a.first} ${a.last}`, role: "athlete" },
      });
      if (uErr || !u.user) continue;
      const aid = u.user.id;
      created.push(aid);

      await supabaseAdmin.from("profiles").upsert({
        id: aid, full_name: `${a.first} ${a.last}`, email,
        age: a.age, weight: a.weight, target_weight: a.target,
        fitness_score: a.fit, recovery_score: a.rec, consistency_score: a.con,
        adherence_percentage: a.con, primary_goal: a.goal,
        onboarding_completed: true,
        last_active_at: new Date(Date.now() - ri(0, 5) * 86400000).toISOString(),
      });

      await supabaseAdmin.from("coach_athlete_relations").insert({
        coach_id: userId, athlete_id: aid, status: "active",
        covered_by_coach: i < 2,
      });

      // 12 weeks weight, slight trend toward target
      const dir = a.target < a.weight ? -1 : 1;
      const step = Math.abs(a.target - a.weight) / 12;
      const weights = Array.from({ length: 12 }, (_, w) => ({
        user_id: aid, week_label: `W${w + 1}`,
        weight: a.weight + dir * step * w + (Math.random() - 0.5),
        recorded_at: new Date(Date.now() - (12 - w) * 7 * 86400000).toISOString(),
      }));
      await supabaseAdmin.from("weight_history").insert(weights);

      const workouts = Array.from({ length: 25 }, (_, d) => ({
        user_id: aid,
        date: new Date(Date.now() - d * 86400000).toISOString().slice(0, 10),
        completion_rate: Math.max(0.2, Math.min(1, (a.con / 100) + (Math.random() - 0.5) * 0.3)),
      }));
      await supabaseAdmin.from("workout_logs").insert(workouts);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const activity = Array.from({ length: 14 }, (_, d) => {
        const date = new Date(Date.now() - d * 86400000);
        return {
          user_id: aid, date: date.toISOString().slice(0, 10),
          day: days[date.getDay()], calories: ri(1700, 2900),
        };
      });
      await supabaseAdmin.from("activity_data").insert(activity);

      if (Math.random() < a.injuredChance) {
        await supabaseAdmin.from("injuries").insert({
          athlete_id: aid, body_part: rand(BODY_PARTS),
          injury_type: rand(["Strain", "Sprain", "Tendinitis", "Soreness"]),
          severity: ri(1, 4), status: rand(["active", "recovering"]),
          date_reported: new Date(Date.now() - ri(1, 20) * 86400000).toISOString().slice(0, 10),
          notes: "Reported during last session.",
        });
      }

      if (Math.random() < 0.6) {
        await supabaseAdmin.from("follow_ups").insert({
          coach_id: userId, athlete_id: aid,
          title: rand(["Check in on recovery", "Review weekly plan", "Adjust nutrition targets", "Confirm court availability"]),
          priority: rand(["low", "medium", "high"]), status: "pending",
          due_date: new Date(Date.now() + ri(1, 7) * 86400000).toISOString().slice(0, 10),
        });
      }
    }

    // A few upcoming sessions across the roster
    if (created.length >= 2) {
      const sessions = SESSION_TEMPLATES.map((s, i) => ({
        coach_id: userId,
        title: s.title,
        session_type: s.type,
        location: s.location,
        scheduled_at: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
        duration_minutes: 60,
        status: "scheduled",
        athlete_ids: created.slice(0, ri(2, Math.min(4, created.length))),
        notes: null,
      }));
      await supabaseAdmin.from("sessions").insert(sessions);
    }

    return { ok: true, created: created.length };
  });
