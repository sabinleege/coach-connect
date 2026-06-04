import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/coach/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { useCoachProfile } from "@/hooks/use-coach-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachLayout,
});

function CoachLayout() {
  const { data: me } = useCoachProfile();
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
              <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:inline">Coach</span>
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
