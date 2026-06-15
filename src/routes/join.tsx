import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/join")({
  validateSearch: (s: Record<string, unknown>) => ({ code: (s.code as string) ?? "" }),
  component: JoinPage,
});

function JoinPage() {
  const { code: initial } = useSearch({ from: "/join" });
  const navigate = useNavigate();
  const [code, setCode] = useState(initial || "");
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      sessionStorage.setItem("pending_invite_code", code);
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await (supabase as any).rpc("accept_coach_invite", { _code: code });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Linked to coach!");
    navigate({ to: "/coach" });
  }

  useEffect(() => {
    const pending = sessionStorage.getItem("pending_invite_code");
    if (pending && !initial) setCode(pending);
  }, [initial]);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="font-display text-2xl font-semibold">Join your coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter the invite code your coach shared.</p>
        <div className="mt-4 grid gap-3">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Invite code" className="font-mono" />
          <Button onClick={accept} disabled={loading || !code}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept invite"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
