import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, Users, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Secure-Fit Coach — AI-powered athlete management" },
      { name: "description", content: "The coach companion for Secure-Fit-AI. Manage your athletes, track progress, and intervene with confidence." },
      { property: "og:title", content: "Secure-Fit Coach" },
      { property: "og:description", content: "AI-powered athlete management for serious coaches." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-semibold">Secure-Fit Coach</span>
          </div>
          <Link
            to="/auth"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Coach sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="grid gap-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
            Companion to Secure-Fit-AI
          </span>
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight md:text-6xl">
            The dashboard that turns athlete data into{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">coaching decisions</span>.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Built for trainers managing real bodies and real plans. Connect to your athletes' Secure-Fit accounts,
            see progress, flag risks, and adjust programs — without ever leaving the dashboard.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[var(--glow-primary)] hover:opacity-90"
            >
              Try the demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-medium hover:bg-accent/10"
            >
              Coach sign in
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            { icon: Users, title: "Roster at a glance", body: "See every athlete's status, scores and consistency on one screen." },
            { icon: BarChart3, title: "Deep progress views", body: "Weight, workouts, calories, and recovery — charted and compared." },
            { icon: ShieldCheck, title: "Privacy by design", body: "Row-level rules ensure each coach only sees their own athletes." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
