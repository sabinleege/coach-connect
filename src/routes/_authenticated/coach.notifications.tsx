import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/coach/notifications")({
  component: () => (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">Notifications</h1>
      <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
        <Bell className="h-8 w-8 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No new notifications.</p>
      </div>
    </div>
  ),
});
