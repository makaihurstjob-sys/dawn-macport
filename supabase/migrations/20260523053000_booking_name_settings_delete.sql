ALTER TABLE public.booking_qualifications
ADD COLUMN IF NOT EXISTS client_name TEXT;

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins/devs can insert site settings" ON public.site_settings;
CREATE POLICY "Admins/devs can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Admins/devs can update site settings" ON public.site_settings;
CREATE POLICY "Admins/devs can update site settings"
ON public.site_settings
FOR UPDATE
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]))
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Admins/devs can delete site settings" ON public.site_settings;
CREATE POLICY "Admins/devs can delete site settings"
ON public.site_settings
FOR DELETE
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Admins/devs can delete booking qualifications" ON public.booking_qualifications;
CREATE POLICY "Admins/devs can delete booking qualifications"
ON public.booking_qualifications
FOR DELETE
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Admins/devs can delete dashboard notes" ON public.dashboard_notes;
CREATE POLICY "Admins/devs can delete dashboard notes"
ON public.dashboard_notes
FOR DELETE
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

INSERT INTO public.site_settings (key, value)
VALUES ('cal_booking_url', '')
ON CONFLICT (key) DO NOTHING;
