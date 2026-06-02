INSERT INTO public.site_settings (key, value)
VALUES ('testimonials_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
