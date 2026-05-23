REVOKE EXECUTE ON FUNCTION public.has_role(app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_role(app_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(app_role[]) TO authenticated;