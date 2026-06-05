import { createFileRoute } from "@tanstack/react-router";
import { InjuryTable } from "@/components/coach/InjuryTable";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/coach/injuries")({
  component: InjuriesPage,
});

function InjuriesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <div className="text-sm text-muted-foreground">Health</div>
          <h1 className="font-display text-3xl font-semibold">Injuries & Recovery</h1>
        </div>
      </div>
      <InjuryTable />
    </div>
  );
}
