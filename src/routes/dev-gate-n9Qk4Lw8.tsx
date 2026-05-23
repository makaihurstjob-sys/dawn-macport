import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { LockKeyhole, ServerCog, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dev-gate-n9Qk4Lw8")({
  component: DevLogin,
});

function withTimeout<T>(promise: Promise<T>, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      globalThis.setTimeout(() => reject(new Error(message)), 8000);
    }),
  ]);
}

function DevLogin() {
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
    <div className="flex min-h-screen items-center justify-center bg-[#151821] p-4 font-mono text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(129,167,198,0.2),transparent_40%)]" />
      <main className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/84 p-7 shadow-[0_36px_110px_-70px_rgba(0,0,0,1)] backdrop-blur-xl">
        <div className="mb-7 flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-sky-200">
              <ServerCog className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-300/70">dev gateway</p>
              <h1 className="text-xl text-slate-100">router login</h1>
            </div>
          </div>
          <Terminal className="h-5 w-5 text-slate-500" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <label className="block text-sm text-slate-300">
            email / username
            <input
              type="text"
              required
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="block text-sm text-slate-300">
            password
            <input
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-200 disabled:opacity-60"
          >
            {loading ? "authenticating..." : "login"}
            <Terminal className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <LockKeyhole className="h-3.5 w-3.5" />
          no signup route exposed
        </p>
      </main>
    </div>
  );
}
