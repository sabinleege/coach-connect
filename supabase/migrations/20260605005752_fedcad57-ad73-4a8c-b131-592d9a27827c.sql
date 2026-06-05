
-- Injuries
CREATE TABLE public.injuries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body_part text NOT NULL,
  injury_type text NOT NULL,
  severity smallint NOT NULL CHECK (severity BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','recovering','resolved')),
  date_reported date NOT NULL DEFAULT CURRENT_DATE,
  expected_return date,
  notes text,
  recovery_timeline jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.injuries TO authenticated;
GRANT ALL ON public.injuries TO service_role;
ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athlete manages own injuries" ON public.injuries
  FOR ALL TO authenticated USING (athlete_id = auth.uid()) WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Coach views linked athlete injuries" ON public.injuries
  FOR SELECT TO authenticated USING (public.coaches_athlete(auth.uid(), athlete_id));
CREATE POLICY "Coach updates linked athlete injuries" ON public.injuries
  FOR UPDATE TO authenticated USING (public.coaches_athlete(auth.uid(), athlete_id))
  WITH CHECK (public.coaches_athlete(auth.uid(), athlete_id));
CREATE POLICY "Coach inserts injury for linked athlete" ON public.injuries
  FOR INSERT TO authenticated WITH CHECK (public.coaches_athlete(auth.uid(), athlete_id));
CREATE TRIGGER injuries_set_updated BEFORE UPDATE ON public.injuries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Coach notes
CREATE TABLE public.coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  visible_to_athlete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_notes TO authenticated;
GRANT ALL ON public.coach_notes TO service_role;
ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach manages own notes" ON public.coach_notes
  FOR ALL TO authenticated USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid() AND public.coaches_athlete(auth.uid(), athlete_id));
CREATE POLICY "Athlete views visible notes" ON public.coach_notes
  FOR SELECT TO authenticated USING (athlete_id = auth.uid() AND visible_to_athlete = true);
CREATE TRIGGER coach_notes_set_updated BEFORE UPDATE ON public.coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Follow-ups
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','snoozed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach manages own follow-ups" ON public.follow_ups
  FOR ALL TO authenticated USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid() AND public.coaches_athlete(auth.uid(), athlete_id));
CREATE POLICY "Athlete views own follow-ups" ON public.follow_ups
  FOR SELECT TO authenticated USING (athlete_id = auth.uid());
CREATE TRIGGER follow_ups_set_updated BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Adherence + primary goal on profiles for roster display
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS adherence_percentage smallint,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz,
  ADD COLUMN IF NOT EXISTS primary_goal text;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.injuries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_logs;
