import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpenCheck, LogOut, Sunrise } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({ to: "/customer-login", search: { redirect: "/app" } });
    }

    const { data: profile } = await supabase.from("profiles").select("role").single();
    if (profile?.role !== "customer") {
      throw redirect({ to: "/customer-login", search: { redirect: "/app" } });
    }
  },
  component: CustomerApp,
});

type CustomerEnrollment = {
  id: string;
  status: string;
  courses: {
    id: string;
    title: string;
    slug: string;
    description: string;
  } | null;
};

function CustomerApp() {
  const [enrollments, setEnrollments] = useState<CustomerEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnrollments = async () => {
      setLoading(true);
      setError("");

      const { data, error: enrollmentError } = await supabase
        .from("customer_enrollments")
        .select("id,status,courses(id,title,slug,description)")
        .order("created_at", { ascending: false });

      if (enrollmentError) {
        setError(enrollmentError.message);
      } else {
        setEnrollments((data || []) as CustomerEnrollment[]);
      }

      setLoading(false);
    };

    void loadEnrollments();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#fff8ea] text-foreground">
      <header className="border-b border-border/70 bg-background/88 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="font-serif text-2xl text-foreground">
            A'New Dawn
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="mb-8 max-w-3xl">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sunrise className="h-7 w-7" />
          </div>
          <p className="brand-kicker">Customer portal</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.06] text-foreground sm:text-5xl">
            My Course
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Your assigned A'New Dawn resources live here. QR links will bring you back to the right
            course, but only your invited login controls access.
          </p>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border bg-background p-8 text-muted-foreground">
            Loading your course...
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <BookOpenCheck className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="font-serif text-3xl text-foreground">No course assigned yet</h2>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              Your account is active, but a course has not been assigned. Contact the coach to have
              your access connected.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses;
              if (!course) return null;

              return (
                <a
                  key={enrollment.id}
                  href={`/course/${course.slug}`}
                  className="group rounded-2xl border border-border/70 bg-background p-6 shadow-[0_22px_70px_-55px_rgba(75,50,35,0.75)] transition hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpenCheck className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
                      {enrollment.status}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl leading-tight text-foreground">
                    {course.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{course.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-medium text-primary">
                    Open course
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
