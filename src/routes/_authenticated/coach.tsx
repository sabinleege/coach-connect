import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/coach/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { useCoachProfile } from "@/hooks/use-coach-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useCoachRealtime } from "@/hooks/use-coach-realtime";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachLayout,
});

function useIsCoach() {
  return useQuery({
    queryKey: ["is-coach"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      return (data ?? []).some((r: any) => r.role === "coach");
    },
  });
}

function CoachLayout() {
  const { data: me } = useCoachProfile();
  const { data: isCoach, isLoading: roleLoading } = useIsCoach();
  const navigate = useNavigate();
  useCoachRealtime();

  useEffect(() => {
    if (!roleLoading && isCoach === false) navigate({ to: "/", replace: true });
  }, [roleLoading, isCoach, navigate]);

  if (roleLoading || isCoach === false) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (me?.full_name || me?.email || "C").split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="relative ml-2 hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search athletes…" className="h-9 w-72 pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link to="/coach/notifications" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-medium">{me?.full_name || "Coach"}</span>
                <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] uppercase tracking-widest">Coach</Badge>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={me?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
