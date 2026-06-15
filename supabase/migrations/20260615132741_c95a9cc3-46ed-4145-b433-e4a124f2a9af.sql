
-- 1. Add covered_by_coach to relations
ALTER TABLE public.coach_athlete_relations
  ADD COLUMN IF NOT EXISTS covered_by_coach boolean NOT NULL DEFAULT false;

-- 2. Coach invites
CREATE TABLE public.coach_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','revoked')),
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_coach_invites_coach ON public.coach_invites(coach_id);
CREATE INDEX idx_coach_invites_email ON public.coach_invites(email);
CREATE INDEX idx_coach_invites_code ON public.coach_invites(invite_code);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_invites TO authenticated;
GRANT ALL ON public.coach_invites TO service_role;

ALTER TABLE public.coach_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage own invites" ON public.coach_invites
  FOR ALL TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Invitee can view by email" ON public.coach_invites
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Invitee can accept" ON public.coach_invites
  FOR UPDATE TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'pending')
  WITH CHECK (accepted_by = auth.uid());

CREATE TRIGGER trg_coach_invites_updated
  BEFORE UPDATE ON public.coach_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Sessions / court bookings
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  athlete_ids uuid[] NOT NULL DEFAULT '{}',
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  location text,
  session_type text NOT NULL DEFAULT 'training' CHECK (session_type IN ('training','court','assessment','recovery','team')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_coach ON public.sessions(coach_id);
CREATE INDEX idx_sessions_scheduled ON public.sessions(scheduled_at);
CREATE INDEX idx_sessions_athletes ON public.sessions USING gin(athlete_ids);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage own sessions" ON public.sessions
  FOR ALL TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Athletes view their sessions" ON public.sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = ANY(athlete_ids));

CREATE TRIGGER trg_sessions_updated
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free','individual','team','enterprise')),
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','inactive','past_due','cancelled','trialing')),
  covers_athletes boolean NOT NULL DEFAULT false,
  seat_limit int,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own subscription" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own subscription" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;

-- 6. Helper: accept invite atomically
CREATE OR REPLACE FUNCTION public.accept_coach_invite(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite public.coach_invites%ROWTYPE;
  _user_email text;
  _relation_id uuid;
BEGIN
  SELECT email INTO _user_email FROM auth.users WHERE id = auth.uid();
  IF _user_email IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO _invite FROM public.coach_invites
    WHERE invite_code = _code AND status = 'pending' AND expires_at > now()
    FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or expired invite'; END IF;

  IF _invite.email IS NOT NULL AND _invite.email <> _user_email THEN
    RAISE EXCEPTION 'Invite is for a different email';
  END IF;

  UPDATE public.coach_invites
    SET status='accepted', accepted_by=auth.uid(), accepted_at=now()
    WHERE id = _invite.id;

  INSERT INTO public.coach_athlete_relations (coach_id, athlete_id, status)
    VALUES (_invite.coach_id, auth.uid(), 'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO _relation_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (_invite.coach_id, 'invite_accepted', 'Invite accepted',
            'An athlete accepted your invitation.',
            jsonb_build_object('athlete_id', auth.uid(), 'invite_id', _invite.id));

  RETURN _invite.id;
END $$;

GRANT EXECUTE ON FUNCTION public.accept_coach_invite(text) TO authenticated;
