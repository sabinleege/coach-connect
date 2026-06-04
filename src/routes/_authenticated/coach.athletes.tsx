import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useMyAthletes } from "@/hooks/use-coach-data";
import { AthleteCard } from "@/components/coach/AthleteCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/coach/athletes")({
  component: AthletesShell,
});

function AthletesShell() {
  // If we're on a child route (/coach/athletes/$athleteId), render only the Outlet.
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path !== "/coach/athletes") return <Outlet />;
  return <AthletesList />;
}

function AthletesList() {
  const { data: athletes = [], isLoading } = useMyAthletes();
  const [q, setQ] = useState("");
  const filtered = athletes.filter((a) =>
    (a.full_name || "").toLowerCase().includes(q.toLowerCase()) ||
    (a.email || "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Roster</div>
          <h1 className="font-display text-3xl font-semibold">Athletes ({athletes.length})</h1>
        </div>
        <InviteDialog />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          No athletes match your search.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => <AthleteCard key={a.id} athlete={a} />)}
        </div>
      )}
    </div>
  );
}

function InviteDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return toast.error("Not signed in"); }
    // Look up athlete profile by email
    const { data: athlete, error: e1 } = await supabase
      .from("profiles").select("id").eq("email", email.trim()).maybeSingle();
    if (e1 || !athlete) {
      setLoading(false);
      return toast.error("No Secure-Fit athlete found with that email");
    }
    const { error: e2 } = await supabase
      .from("coach_athlete_relations")
      .insert({ coach_id: u.user.id, athlete_id: athlete.id, status: "active" });
    setLoading(false);
    if (e2) return toast.error(e2.message);
    toast.success("Athlete linked");
    setEmail("");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["my-athletes"] });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Add athlete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link an athlete</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="invite-email">Athlete's Secure-Fit email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="invite-email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="athlete@email.com" />
          </div>
          <p className="text-xs text-muted-foreground">
            The athlete must already have a Secure-Fit account. They'll appear on your roster immediately.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !email}>Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
