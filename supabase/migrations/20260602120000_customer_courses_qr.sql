ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins/devs can view all profiles" ON public.profiles;
CREATE POLICY "Admins/devs can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Admins/devs can insert profiles" ON public.profiles;
CREATE POLICY "Admins/devs can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Admins/devs can update profiles" ON public.profiles;
CREATE POLICY "Admins/devs can update profiles"
ON public.profiles
FOR UPDATE
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]))
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.course_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (course_id, sort_order)
);

ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.customer_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'paused', 'completed')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (customer_id, course_id)
);

ALTER TABLE public.customer_enrollments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (customer_id, course_id, item_key)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.qr_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  scan_count INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_links ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(_course_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.customer_enrollments
    WHERE customer_id = auth.uid()
      AND course_id = _course_id
      AND status IN ('invited', 'active', 'completed')
  );
$$;

CREATE OR REPLACE FUNCTION public.resolve_qr_link(_slug TEXT)
RETURNS TABLE (
  slug TEXT,
  course_slug TEXT,
  course_title TEXT,
  active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.qr_links
  SET scan_count = scan_count + 1,
      last_scanned_at = now(),
      updated_at = now()
  WHERE qr_links.slug = _slug
    AND qr_links.active = true;

  RETURN QUERY
  SELECT q.slug, c.slug, c.title, q.active
  FROM public.qr_links q
  JOIN public.courses c ON c.id = q.course_id
  WHERE q.slug = _slug
    AND q.active = true
    AND c.status = 'active'
  LIMIT 1;
END;
$$;

DROP POLICY IF EXISTS "Admins/devs can manage courses" ON public.courses;
CREATE POLICY "Admins/devs can manage courses"
ON public.courses
FOR ALL
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]))
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Customers can view enrolled active courses" ON public.courses;
CREATE POLICY "Customers can view enrolled active courses"
ON public.courses
FOR SELECT
USING (status = 'active' AND public.is_enrolled_in_course(id));

DROP POLICY IF EXISTS "Admins/devs can manage course resources" ON public.course_resources;
CREATE POLICY "Admins/devs can manage course resources"
ON public.course_resources
FOR ALL
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]))
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Customers can view enrolled active resources" ON public.course_resources;
CREATE POLICY "Customers can view enrolled active resources"
ON public.course_resources
FOR SELECT
USING (active = true AND public.is_enrolled_in_course(course_id));

DROP POLICY IF EXISTS "Admins/devs can manage customer enrollments" ON public.customer_enrollments;
CREATE POLICY "Admins/devs can manage customer enrollments"
ON public.customer_enrollments
FOR ALL
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]))
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Customers can view own enrollments" ON public.customer_enrollments;
CREATE POLICY "Customers can view own enrollments"
ON public.customer_enrollments
FOR SELECT
USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admins/devs can manage course progress" ON public.course_progress;
CREATE POLICY "Admins/devs can manage course progress"
ON public.course_progress
FOR ALL
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]))
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Customers can view own course progress" ON public.course_progress;
CREATE POLICY "Customers can view own course progress"
ON public.course_progress
FOR SELECT
USING (customer_id = auth.uid() AND public.is_enrolled_in_course(course_id));

DROP POLICY IF EXISTS "Customers can insert own course progress" ON public.course_progress;
CREATE POLICY "Customers can insert own course progress"
ON public.course_progress
FOR INSERT
WITH CHECK (customer_id = auth.uid() AND public.is_enrolled_in_course(course_id));

DROP POLICY IF EXISTS "Customers can update own course progress" ON public.course_progress;
CREATE POLICY "Customers can update own course progress"
ON public.course_progress
FOR UPDATE
USING (customer_id = auth.uid() AND public.is_enrolled_in_course(course_id))
WITH CHECK (customer_id = auth.uid() AND public.is_enrolled_in_course(course_id));

DROP POLICY IF EXISTS "Admins/devs can manage qr links" ON public.qr_links;
CREATE POLICY "Admins/devs can manage qr links"
ON public.qr_links
FOR ALL
USING (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]))
WITH CHECK (public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]));

DROP POLICY IF EXISTS "Anyone can resolve active qr links" ON public.qr_links;
CREATE POLICY "Anyone can resolve active qr links"
ON public.qr_links
FOR SELECT
USING (active = true);

INSERT INTO public.courses (title, slug, description, status)
VALUES (
  'The Dawn Method',
  'dawn-method',
  'A guided starting place for clarity, confidence, consistency, and purpose.',
  'active'
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO public.course_resources (course_id, title, description, sort_order)
SELECT c.id, resource.title, resource.description, resource.sort_order
FROM public.courses c
CROSS JOIN (
  VALUES
    ('Discover', 'Name what season you are in and what needs attention first.', 1),
    ('Align', 'Connect the next step to your values, faith, and actual capacity.', 2),
    ('Walk', 'Turn the insight into a weekly practice you can return to.', 3),
    ('Navigate', 'Track what is shifting and where you need support.', 4)
) AS resource(title, description, sort_order)
WHERE c.slug = 'dawn-method'
ON CONFLICT DO NOTHING;

INSERT INTO public.qr_links (slug, course_id, label)
SELECT 'dawn-method', c.id, 'The Dawn Method QR'
FROM public.courses c
WHERE c.slug = 'dawn-method'
ON CONFLICT (slug) DO UPDATE
SET course_id = EXCLUDED.course_id,
    label = EXCLUDED.label,
    active = true,
    updated_at = now();
