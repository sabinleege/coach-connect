import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Settings, LogOut, Dumbbell, Bell, ShieldAlert, ClipboardList, BarChart3, CalendarDays, UserPlus } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AthleteRosterList } from "./AthleteRosterList";

const items = [
  { title: "Overview", url: "/coach", icon: LayoutDashboard, exact: true },
  { title: "Athletes", url: "/coach/athletes", icon: Users, exact: false },
  { title: "Sessions", url: "/coach/sessions", icon: CalendarDays, exact: false },
  { title: "Invites", url: "/coach/invites", icon: UserPlus, exact: false },
  { title: "Injuries", url: "/coach/injuries", icon: ShieldAlert, exact: false },
  { title: "Follow-ups", url: "/coach/follow-ups", icon: ClipboardList, exact: false },
  { title: "Analytics", url: "/coach/analytics", icon: BarChart3, exact: false },
  { title: "Notifications", url: "/coach/notifications", icon: Bell, exact: false },
  { title: "Settings", url: "/coach/settings", icon: Settings, exact: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isActive = (url: string, exact: boolean) => (exact ? path === url : path.startsWith(url));

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold">Secure-Fit</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Coach</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Roster</SidebarGroupLabel>
            <SidebarGroupContent>
              <AthleteRosterList />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
