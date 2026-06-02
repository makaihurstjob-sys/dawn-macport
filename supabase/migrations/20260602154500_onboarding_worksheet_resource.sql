INSERT INTO public.course_resources (course_id, title, description, sort_order)
SELECT
  c.id,
  'Client Onboarding Worksheet',
  'A starting worksheet for lesson planning, reflection, and next-step preparation before coaching work begins.',
  0
FROM public.courses c
WHERE c.slug = 'dawn-method'
ON CONFLICT (course_id, sort_order) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = now();
