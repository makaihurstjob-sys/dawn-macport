CREATE OR REPLACE FUNCTION public.accept_customer_course_invites()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.customer_enrollments
  SET status = 'active',
      accepted_at = COALESCE(accepted_at, now()),
      updated_at = now()
  WHERE customer_id = auth.uid()
    AND status = 'invited';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_customer_course_invites() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_customer_course_invites() TO authenticated;

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
