
-- 1. Role enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('coach', 'athlete', 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. Profiles (athlete data shared with coach)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text,
  avatar_url text,
  age int DEFAULT 28,
  gender text,
  height numeric DEFAULT 178,
  weight numeric DEFAULT 80,
  target_weight numeric DEFAULT 75,
  body_fat numeric DEFAULT 18,
  fitness_score int DEFAULT 72,
  recovery_score int DEFAULT 85,
  consistency_score int DEFAULT 87,
  heart_rate int DEFAULT 68,
  daily_calories_target int DEFAULT 2150,
  water_glasses int DEFAULT 0,
  water_target int DEFAULT 8,
  activity_level text DEFAULT 'moderate',
  goals text[] DEFAULT '{}',
  goal_description text DEFAULT '',
  injuries jsonb DEFAULT '[]'::jsonb,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Coach <-> Athlete relations
CREATE TABLE public.coach_athlete_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active', -- pending | active | paused | ended
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coach_id, athlete_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_athlete_relations TO authenticated;
GRANT ALL ON public.coach_athlete_relations TO service_role;
ALTER TABLE public.coach_athlete_relations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_car_coach ON public.coach_athlete_relations(coach_id, status);
CREATE INDEX idx_car_athlete ON public.coach_athlete_relations(athlete_id, status);

-- Helper: does a coach actively coach an athlete?
CREATE OR REPLACE FUNCTION public.coaches_athlete(_coach_id uuid, _athlete_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_athlete_relations
    WHERE coach_id = _coach_id AND athlete_id = _athlete_id AND status = 'active'
  )
$$;

-- Policies for coach_athlete_relations
CREATE POLICY "Coach manages own relations" ON public.coach_athlete_relations
  FOR ALL TO authenticated
  USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Athlete reads own relations" ON public.coach_athlete_relations
  FOR SELECT TO authenticated USING (auth.uid() = athlete_id);

-- Profiles policies (athlete owns; coach reads linked athletes)
CREATE POLICY "Own profile select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.coaches_athlete(auth.uid(), id));
CREATE POLICY "Own profile insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 4. Progress tables (athlete owns; coach reads)
CREATE TABLE public.weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_label text NOT NULL,
  weight numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weight_history TO authenticated;
GRANT ALL ON public.weight_history TO service_role;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  plan_id uuid,
  completion_rate numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.activity_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day text NOT NULL,
  date date NOT NULL,
  calories int NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_data TO authenticated;
GRANT ALL ON public.activity_data TO service_role;
ALTER TABLE public.activity_data ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  meals jsonb DEFAULT '[]'::jsonb,
  total_calories int DEFAULT 0,
  total_protein int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_logs TO authenticated;
GRANT ALL ON public.meal_logs TO service_role;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'tip',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Shared policy pattern: owner full access; linked coach read
CREATE POLICY "weight_history own" ON public.weight_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weight_history coach read" ON public.weight_history FOR SELECT TO authenticated
  USING (public.coaches_athlete(auth.uid(), user_id));

CREATE POLICY "workout_logs own" ON public.workout_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_logs coach read" ON public.workout_logs FOR SELECT TO authenticated
  USING (public.coaches_athlete(auth.uid(), user_id));

CREATE POLICY "activity_data own" ON public.activity_data FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_data coach read" ON public.activity_data FOR SELECT TO authenticated
  USING (public.coaches_athlete(auth.uid(), user_id));

CREATE POLICY "meal_logs own" ON public.meal_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meal_logs coach read" ON public.meal_logs FOR SELECT TO authenticated
  USING (public.coaches_athlete(auth.uid(), user_id));

CREATE POLICY "notifications own" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER meal_logs_updated_at BEFORE UPDATE ON public.meal_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER coach_athlete_relations_updated_at BEFORE UPDATE ON public.coach_athlete_relations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- New-user trigger: create profile + assign role (defaults to athlete)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  ) ON CONFLICT (id) DO NOTHING;

  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::app_role, 'athlete'::app_role);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
