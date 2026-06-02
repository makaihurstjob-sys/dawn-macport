import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/go/$slug")({
  component: QrResolver,
});

type ResolvedQr = {
  slug: string;
  course_slug: string;
  course_title: string;
  active: boolean;
};

function QrResolver() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const resolve = async () => {
      const { data, error: resolveError } = await supabase.rpc("resolve_qr_link", { _slug: slug });
      const resolved = (data?.[0] || null) as ResolvedQr | null;

      if (resolveError || !resolved) {
        setError("This QR link is not active or does not exist.");
        return;
      }

      const coursePath = `/course/${resolved.course_slug}`;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        await navigate({
          to: "/customer-login",
          search: { redirect: coursePath },
        });
        return;
      }

      await navigate({ to: coursePath });
    };

    void resolve();
  }, [navigate, slug]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8ea] px-4 text-foreground">
      <main className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-[0_36px_120px_-70px_rgba(45,37,54,0.9)]">
        {error ? (
          <>
            <QrCode className="mx-auto mb-4 h-9 w-9 text-primary" />
            <h1 className="font-serif text-3xl text-foreground">QR link unavailable</h1>
            <p className="mt-3 leading-7 text-muted-foreground">{error}</p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Return home
            </a>
          </>
        ) : (
          <>
            <LoaderCircle className="mx-auto mb-4 h-9 w-9 animate-spin text-primary" />
            <h1 className="font-serif text-3xl text-foreground">Opening course link</h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              Checking the QR route and sending you to the right course page.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
