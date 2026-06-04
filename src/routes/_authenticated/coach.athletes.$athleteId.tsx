import { createFileRoute, Link } from "@tanstack/react-router";
import { useAthleteDetail } from "@/hooks/use-coach-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/coach/StatCard";
import { ArrowLeft, Activity, Flame, Heart, Scale } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/_authenticated/coach/athletes/$athleteId")({
  component: AthleteDetail,
});

function AthleteDetail() {
  const { athleteId } = Route.useParams();
  const { data, isLoading } = useAthleteDetail(athleteId);
  const p = data?.profile;

  if (isLoading) return <div className="mx-auto max-w-6xl">Loading…</div>;
  if (!p) return (
    <div className="mx-auto max-w-6xl">
      <BackLink />
      <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        Athlete not found, or you don't have access.
      </div>
    </div>
  );

  const initials = (p.full_name || "?").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();
  const weightData = (data?.weights ?? []).map((w: any) => ({ label: w.week_label, weight: Number(w.weight) }));
  const activityData = (data?.activity ?? []).slice().reverse().map((a: any) => ({ day: a.day, calories: a.calories }));

  return (
    <div className="mx-auto max-w-6xl">
      <BackLink />

      <header className="mt-4 flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={p.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold">{p.full_name || "Unnamed athlete"}</h1>
          <div className="text-sm text-muted-foreground">{p.email}</div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {p.age && <span>{p.age} yrs</span>}
            {p.gender && <span>{p.gender}</span>}
            {p.height && <span>{p.height} cm</span>}
            {p.goal_description && <span className="text-foreground/80">Goal: {p.goal_description}</span>}
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame} label="Fitness" value={p.fitness_score ?? "—"} />
        <StatCard icon={Heart} label="Recovery" value={p.recovery_score ?? "—"} accent="accent" />
        <StatCard icon={Activity} label="Consistency" value={(p.consistency_score ?? 0) + "%"} />
        <StatCard icon={Scale} label="Weight" value={`${p.weight ?? "—"} kg`} hint={`Goal: ${p.target_weight ?? "—"} kg`} accent="accent" />
      </section>

      <Tabs defaultValue="progress" className="mt-8">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <ChartCard title="Weight trend">
            {weightData.length === 0 ? <Empty msg="No weight history yet." /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weightData}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={["dataMin-2", "dataMax+2"]} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="workouts" className="mt-6">
          <ChartCard title="Recent sessions">
            {(data?.workouts ?? []).length === 0 ? <Empty msg="No workouts logged." /> : (
              <ul className="divide-y divide-border">
                {data!.workouts.map((w: any) => (
                  <li key={w.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium">{new Date(w.date).toLocaleDateString()}</div>
                      {w.notes && <div className="text-xs text-muted-foreground">{w.notes}</div>}
                    </div>
                    <div className="font-display text-lg text-primary">{Math.round(Number(w.completion_rate))}%</div>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ChartCard title="Calories — last 14 days">
            {activityData.length === 0 ? <Empty msg="No activity yet." /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={activityData}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Bar dataKey="calories" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="grid h-32 place-items-center text-sm text-muted-foreground">{msg}</div>;
}

function BackLink() {
  return (
    <Link to="/coach/athletes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Back to athletes
    </Link>
  );
}
