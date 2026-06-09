import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { LockKeyhole, Router, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dawn-gate-9vK2mQ7p")({
  component: AdminLogin,
});

function withTimeout<T>(promise: Promise<T>, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      globalThis.setTimeout(() => reject(new Error(message)), 8000);
    }),
  ]);
}

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    let signInError: Error | null = null;

    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: username,
          password,
        }),
        "Login timed out. Connect the new Supabase project, then try again.",
      );
      signInError = error;
    } catch (loginError) {
      signInError = loginError instanceof Error ? loginError : new Error("Unable to log in.");
    }

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff7e9] p-4 text-foreground dark:bg-[#17131f]">
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#fffaf1_0%,#f5daa6_42%,#eba86f_76%,#fff1dc_100%)] dark:bg-[linear-gradient(180deg,#17131f_0%,#262131_40%,#5a3d49_72%,#17131f_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[42vh] bg-[linear-gradient(180deg,transparent_0%,rgba(255,247,233,0.78)_74%,#fff7e9_100%)] dark:bg-[linear-gradient(180deg,transparent_0%,rgba(23,19,31,0.72)_58%,#17131f_100%)]"
        aria-hidden="true"
      />
      <main className="relative w-full max-w-md rounded-2xl border border-white/70 bg-[#fffaf1]/94 p-7 shadow-[0_36px_110px_-70px_rgba(95,59,36,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-[#221d2b]/92 dark:shadow-[0_36px_110px_-70px_rgba(0,0,0,1)]">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f332b] text-white dark:bg-[#f4bd78] dark:text-[#241f2f]">
            <Router className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Private gateway
            </p>
            <h1 className="font-serif text-2xl text-foreground">Admin Login</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <label className="block text-sm font-semibold text-foreground">
            Email / username
            <input
              type="text"
              required
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-foreground">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f332b] px-5 py-3 font-medium text-white transition hover:bg-primary disabled:opacity-60 dark:bg-[#f4bd78] dark:text-[#241f2f] dark:hover:bg-[#ffd28c]"
          >
            {loading ? "Authenticating..." : "Login"}
            <ShieldCheck className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5" />
          No public signup. Authorized users only.
        </p>
      </main>
    </div>
  );
}
