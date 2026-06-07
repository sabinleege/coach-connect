import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dumbbell, Loader2, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { seedDemoData } from "@/lib/demo.functions";


export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Coach sign in — Secure-Fit Coach" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const seed = useServerFn(seedDemoData);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/coach" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/coach`,
        data: { full_name: fullName, role: "coach" },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created.");
    // auto-confirm is on; session should exist
    const { data: s } = await supabase.auth.getSession();
    if (s.session) navigate({ to: "/coach" });
  }

  async function handleDemo() {
    setDemoLoading(true);
    try {
      const demoEmail = "demo.coach@securefit.demo";
      const demoPass = "DemoCoach!2026";
      let { error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail, password: demoPass,
      });
      if (signInErr) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: { data: { full_name: "Demo Coach", role: "coach" } },
        });
        if (signUpErr && !signUpErr.message.toLowerCase().includes("registered")) {
          throw signUpErr;
        }
        const retry = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
        if (retry.error) throw retry.error;
      }
      toast.success("Seeding demo athletes…");
      await seed({});
      toast.success("Welcome to the demo");
      navigate({ to: "/coach" });
    } catch (e: any) {
      toast.error(e.message || "Demo failed");
    } finally {
      setDemoLoading(false);
    }
  }


  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--glow-primary)]">
            <Dumbbell className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Secure-Fit Coach</h1>
          <p className="text-sm text-muted-foreground">Manage your athletes with confidence.</p>
        </div>

        <div className="mb-4">
          <Button onClick={handleDemo} disabled={demoLoading} variant="secondary" className="w-full">
            {demoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Try the demo (one click)
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Signs you in as a demo coach with 6 sample athletes.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password2">Password</Label>
                  <Input id="password2" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create coach account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
