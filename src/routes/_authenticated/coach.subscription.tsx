import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useMySubscription, useUpsertSubscription,
  useAthleteCoverage, useToggleAthleteCoverage,
} from "@/hooks/use-subscription";

export const Route = createFileRoute("/_authenticated/coach/subscription")({
  component: SubscriptionPage,
});

type Plan = { id: "starter" | "pro" | "team"; name: string; price: string; seats: number; popular?: boolean; features: string[] };
const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: "$19", seats: 5,
    features: ["Up to 5 athletes", "Roster + analytics", "Manual invites"] },
  { id: "pro", name: "Pro", price: "$49", seats: 25, popular: true,
    features: ["Up to 25 athletes", "AI coaching assistant", "Sessions & court booking", "Realtime alerts"] },
  { id: "team", name: "Team", price: "$129", seats: 100,
    features: ["Up to 100 athletes", "Covers athlete subscriptions", "Priority support", "Custom branding"] },
];

function SubscriptionPage() {
  const { data: sub, isLoading } = useMySubscription();
  const upsert = useUpsertSubscription();
  const { data: coverage = [] } = useAthleteCoverage();
  const toggle = useToggleAthleteCoverage();

  const current = sub?.plan_type ?? "free";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Billing</div>
          <h1 className="font-display text-3xl font-semibold">Subscription</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a plan for your coaching team. Payments will be enabled in a future release.
          </p>
        </div>
        {sub && (
          <Badge variant="secondary" className="bg-primary/15 text-primary uppercase tracking-widest">
            {sub.status} · {sub.plan_type}
          </Badge>
        )}
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-card" />)
        ) : PLANS.map((p) => {
          const active = current === p.id;
          return (
            <Card key={p.id} className={`relative flex flex-col p-6 ${active ? "border-primary shadow-[var(--glow-primary)]" : ""}`}>
              {p.popular && (
                <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground">
                  <Sparkles className="mr-1 h-3 w-3" /> Popular
                </Badge>
              )}
              <div className="font-display text-lg font-semibold">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold">{p.price}</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{p.seats} athlete seats</div>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6"
                variant={active ? "outline" : "default"}
                disabled={active || upsert.isPending}
                onClick={() => upsert.mutate({
                  plan_type: p.id, status: "active", seat_limit: p.seats,
                  covers_athletes: p.id === "team",
                })}
              >
                {active ? "Current plan" : "Select"}
              </Button>
            </Card>
          );
        })}
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold">Athlete coverage</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle which athletes are covered by your team plan. Covered athletes don't need their own subscription.
        </p>
        <Card className="mt-4 divide-y divide-border">
          {coverage.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No athletes on roster.</div>
          ) : coverage.map((r: any) => {
            const a = r.profiles;
            const initials = (a.full_name || a.email || "?").split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={r.athlete_id} className="flex items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={a.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.full_name || "Unnamed"}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.email}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.covered_by_coach ? "Covered" : "Self-pay"}</span>
                  <Switch
                    checked={!!r.covered_by_coach}
                    onCheckedChange={(v) => toggle.mutate({ athleteId: r.athlete_id, covered: v })}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
}
