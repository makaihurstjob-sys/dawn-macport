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
    <div className="flex min-h-screen items-center justify-center bg-[#f9f1e7] p-4">
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,#2d2536_0%,#8b5f68_60%,transparent_100%)]" />
      <main className="relative w-full max-w-md rounded-2xl border border-white/60 bg-background/92 p-7 shadow-[0_36px_110px_-70px_rgba(45,37,54,0.95)] backdrop-blur-xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
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
              className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
              className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary disabled:opacity-60"
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
