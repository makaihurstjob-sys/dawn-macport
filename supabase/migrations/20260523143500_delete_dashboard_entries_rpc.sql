CREATE OR REPLACE FUNCTION public.delete_booking_qualification(_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]) THEN
    RAISE EXCEPTION 'Not authorized to delete booking quiz entries' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.booking_qualifications
  WHERE id = _id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_dashboard_note(_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.has_any_role(ARRAY['admin'::app_role, 'developer'::app_role]) THEN
    RAISE EXCEPTION 'Not authorized to delete dashboard notes' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.dashboard_notes
  WHERE id = _id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_booking_qualification(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_dashboard_note(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.delete_booking_qualification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_dashboard_note(UUID) TO authenticated;
