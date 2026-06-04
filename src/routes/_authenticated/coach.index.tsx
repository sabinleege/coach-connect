import { createFileRoute, Link } from "@tanstack/react-router";
import { useMyAthletes, useCoachProfile } from "@/hooks/use-coach-data";
import { StatCard } from "@/components/coach/StatCard";
import { Users, Activity, Flame, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { AthleteCard } from "@/components/coach/AthleteCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/coach/")({
  component: Overview,
});

function Overview() {
  const { data: me } = useCoachProfile();
  const { data: athletes = [], isLoading } = useMyAthletes();

  const active = athletes.filter((a) => a.relation_status === "active");
  const avg = (k: "fitness_score" | "recovery_score" | "consistency_score") =>
    active.length ? Math.round(active.reduce((s, a) => s + (a[k] ?? 0), 0) / active.length) : 0;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Welcome back</div>
          <h1 className="font-display text-3xl font-semibold">Coach {me?.full_name?.split(" ")[0] || "—"}</h1>
        </div>
        <Button asChild>
          <Link to="/coach/athletes"><Plus className="mr-2 h-4 w-4" /> Manage athletes</Link>
        </Button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Active athletes" value={active.length} hint={`${athletes.length} total in roster`} />
        <StatCard icon={Flame} label="Avg fitness" value={avg("fitness_score")} accent="accent" />
        <StatCard icon={Activity} label="Avg recovery" value={avg("recovery_score")} />
        <StatCard icon={TrendingUp} label="Avg consistency" value={avg("consistency_score") + "%"} accent="accent" />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your athletes</h2>
          <Link to="/coach/athletes" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : athletes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {athletes.slice(0, 6).map((a) => <AthleteCard key={a.id} athlete={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Users className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">No athletes yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Once an athlete from Secure-Fit-AI connects to your coach account, they'll appear here.
      </p>
      <Button asChild className="mt-6">
        <Link to="/coach/athletes">Invite an athlete</Link>
      </Button>
    </div>
  );
}
