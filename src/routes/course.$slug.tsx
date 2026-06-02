import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Circle, LogOut, Route as RouteIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/course/$slug")({
  beforeLoad: async ({ params }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/customer-login",
        search: { redirect: `/course/${params.slug}` },
      });
    }

    const { data: profile } = await supabase.from("profiles").select("role").single();
    if (profile?.role !== "customer") {
      throw redirect({
        to: "/customer-login",
        search: { redirect: `/course/${params.slug}` },
      });
    }
  },
  component: CoursePage,
});

type CourseResource = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  sort_order: number;
};

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  course_resources: CourseResource[];
};

type ProgressItem = {
  id: string;
  item_key: string;
  completed: boolean;
};

function CoursePage() {
  const { slug } = Route.useParams();
  const [userId, setUserId] = useState("");
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setUserId(user.id);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id,title,slug,description,course_resources(id,title,description,url,sort_order)")
        .eq("slug", slug)
        .single();

      if (courseError || !courseData) {
        setError(
          "This course is not assigned to your account yet. Please contact the coach if you expected access.",
        );
        setLoading(false);
        return;
      }

      const normalizedCourse = courseData as CourseDetail;
      normalizedCourse.course_resources = [...(normalizedCourse.course_resources || [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      setCourse(normalizedCourse);

      const { data: progressData } = await supabase
        .from("course_progress")
        .select("id,item_key,completed")
        .eq("course_id", normalizedCourse.id)
        .eq("customer_id", user.id);

      setProgress((progressData || []) as ProgressItem[]);
      setLoading(false);
    };

    void loadCourse();
  }, [slug]);

  const completedKeys = useMemo(
    () => new Set(progress.filter((item) => item.completed).map((item) => item.item_key)),
    [progress],
  );

  const toggleProgress = async (resource: CourseResource) => {
    if (!course || !userId) return;

    const alreadyComplete = completedKeys.has(resource.id);
    const nextComplete = !alreadyComplete;
    const completedAt = nextComplete ? new Date().toISOString() : null;

    const { data, error: upsertError } = await supabase
      .from("course_progress")
      .upsert({
        customer_id: userId,
        course_id: course.id,
        item_key: resource.id,
        completed: nextComplete,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      })
      .select("id,item_key,completed")
      .single();

    if (upsertError || !data) {
      setError(upsertError?.message || "Progress could not be saved.");
      return;
    }

    setProgress((current) => [
      data as ProgressItem,
      ...current.filter((item) => item.item_key !== resource.id),
    ]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#fff8ea] text-foreground">
      <header className="border-b border-border/70 bg-background/88 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/app" className="inline-flex items-center gap-2 font-medium text-foreground">
            <ArrowLeft className="h-4 w-4" />
            My Course
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
        {loading ? (
          <div className="rounded-2xl border border-border bg-background p-8 text-muted-foreground">
            Loading course...
          </div>
        ) : error && !course ? (
          <div className="rounded-2xl border border-border bg-background p-10 text-center">
            <RouteIcon className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h1 className="font-serif text-3xl text-foreground">Access not available</h1>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">{error}</p>
          </div>
        ) : course ? (
          <>
            <section className="mb-8 max-w-3xl">
              <p className="brand-kicker">A'New Dawn course</p>
              <h1 className="mt-3 font-serif text-4xl leading-[1.06] text-foreground sm:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                {course.description}
              </p>
              {error && (
                <p className="mt-5 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </p>
              )}
            </section>

            <section className="grid gap-4">
              {course.course_resources.map((resource) => {
                const complete = completedKeys.has(resource.id);
                return (
                  <article
                    key={resource.id}
                    className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-serif text-3xl leading-tight text-foreground">
                          {resource.title}
                        </h2>
                        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                          {resource.description}
                        </p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex font-medium text-primary hover:underline"
                          >
                            Open resource
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleProgress(resource)}
                        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                          complete
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        {complete ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        {complete ? "Completed" : "Mark complete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
