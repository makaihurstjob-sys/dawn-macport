import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

function withTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      globalThis.setTimeout(() => reject(new Error("Supabase auth timed out")), 8000);
    }),
  ]);
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data, error } = await withTimeout(supabase.auth.getUser()).catch(() => ({
      data: { user: null },
      error: new Error("Supabase auth unavailable"),
    }));

    if (error || !data.user) {
      throw redirect({
        to: "/dawn-gate-9vK2mQ7p",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
