CREATE TYPE public.app_role AS ENUM ('admin', 'developer');

CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  role app_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ANY(_roles)
  );
$$;

CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins/devs can view contact messages" ON public.contact_messages FOR SELECT USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));
CREATE POLICY "Admins/devs can update contact messages" ON public.contact_messages FOR UPDATE USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

CREATE TABLE public.booking_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  seeking TEXT NOT NULL,
  life_stage TEXT NOT NULL,
  session_interest TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_qualifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert booking qualifications" ON public.booking_qualifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins/devs can view booking qualifications" ON public.booking_qualifications FOR SELECT USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));
CREATE POLICY "Admins/devs can update booking qualifications" ON public.booking_qualifications FOR UPDATE USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

CREATE TABLE public.intake_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age TEXT NOT NULL,
  life_stage TEXT NOT NULL,
  lifestyle_sentence TEXT NOT NULL,
  top_challenges TEXT NOT NULL,
  negative_thoughts TEXT NOT NULL,
  purpose_clarity TEXT NOT NULL,
  purpose_unclear_reason TEXT,
  stuck_areas TEXT NOT NULL,
  holding_back_habits TEXT NOT NULL,
  struggle_area TEXT NOT NULL,
  five_year_vision TEXT NOT NULL,
  believe_you_are TEXT NOT NULL,
  becoming TEXT NOT NULL,
  limiting_beliefs TEXT NOT NULL,
  most_confident_area TEXT NOT NULL,
  setback_response TEXT NOT NULL,
  thriving_environments TEXT NOT NULL,
  willing_to_release TEXT NOT NULL,
  anew_dawn_vision TEXT NOT NULL,
  result_type TEXT,
  status TEXT DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert intake submissions" ON public.intake_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins/devs can view intake submissions" ON public.intake_submissions FOR SELECT USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));
CREATE POLICY "Admins/devs can update intake submissions" ON public.intake_submissions FOR UPDATE USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

CREATE TABLE public.dashboard_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  related_submission_id UUID,
  related_type TEXT NOT NULL,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins/devs can insert dashboard notes" ON public.dashboard_notes FOR INSERT WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));
CREATE POLICY "Admins/devs can view dashboard notes" ON public.dashboard_notes FOR SELECT USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));
CREATE POLICY "Admins/devs can update dashboard notes" ON public.dashboard_notes FOR UPDATE USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));