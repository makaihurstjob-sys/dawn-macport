import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, LockKeyhole, Sunrise, UserRoundCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/customer-login")({
  component: CustomerLogin,
});

function getRedirectPath() {
  if (typeof window === "undefined") return "/app";
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (!redirect || !redirect.startsWith("/")) return "/app";
  return redirect;
}

function CustomerLogin() {
  const navigate = useNavigate();
  const redirectPath = useMemo(getRedirectPath, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [linkStatus, setLinkStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const continueActiveSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("role").single();
      if (profile?.role === "customer") {
        await supabase.rpc("accept_customer_course_invites");
        await navigate({ to: redirectPath });
      }
    };

    void continueActiveSession();
  }, [navigate, redirectPath]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .single();

    if (profileError || profile?.role !== "customer") {
      await supabase.auth.signOut();
      setError("This login is for invited customer accounts only.");
      setLoading(false);
      return;
    }

    await supabase.rpc("accept_customer_course_invites");
    await navigate({ to: redirectPath });
  };

  const sendLoginLink = async () => {
    setError("");
    setLinkStatus("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email first, then request a login link.");
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo:
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin}/customer-login?redirect=${encodeURIComponent(
                redirectPath,
              )}`,
      },
    });

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setLinkStatus("Check your email for the secure login link.");
  };

  return (
    <div className="min-h-screen bg-[#fff8ea] text-foreground">
      <div
        className="absolute inset-x-0 top-0 h-[46vh] bg-[linear-gradient(180deg,#231c2c_0%,#6d4b55_55%,#f0b66d_100%)]"
        aria-hidden="true"
      />
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-7 sm:px-6">
        <a
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </a>

        <section className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/55 bg-background/94 shadow-[0_36px_120px_-65px_rgba(45,37,54,0.95)] backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-[#2d2536] p-8 text-white sm:p-10">
              <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff8ea]/12 text-[#fff8ea]">
                <Sunrise className="h-7 w-7" />
              </div>
              <p className="brand-kicker text-[#f6cf8d]">Customer portal</p>
              <h1 className="mt-4 font-serif text-4xl leading-[1.06] text-[#fff8ea]">
                Continue your course path.
              </h1>
              <p className="mt-5 max-w-sm leading-7 text-white/72">
                Invited customers can access assigned course resources, track progress, and return
                from QR links without exposing private course material publicly.
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 sm:p-10">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    Invite only
                  </p>
                  <h2 className="font-serif text-2xl text-foreground">Customer Login</h2>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {linkStatus && (
                <div className="mb-4 rounded-xl bg-primary/10 p-3 text-sm text-primary">
                  {linkStatus}
                </div>
              )}

              <label className="block text-sm font-semibold text-foreground">
                Email
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label className="mt-4 block text-sm font-semibold text-foreground">
                Password
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary disabled:opacity-60"
              >
                {loading ? "Opening portal..." : "Open Portal"}
                <UserRoundCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={sendLoginLink}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-5 py-3 font-medium text-foreground transition hover:bg-muted"
              >
                Email me a secure login link
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
