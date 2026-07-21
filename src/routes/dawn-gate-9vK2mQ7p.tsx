import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import navMarkSrc from "@/assets/brand/nav-mark.png";
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#fae4b7_40%,#f1ad78_72%,#fff0dc_100%)] text-foreground">
      <div
        className="absolute inset-x-0 bottom-0 h-[42vh] bg-[linear-gradient(180deg,transparent_0%,rgba(255,247,233,0.78)_74%,#fff7e9_100%)]"
        aria-hidden="true"
      />
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-7 sm:px-6">
        <a href="/" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/75 bg-white/45 px-4 py-2 text-sm font-medium text-[#51372f] shadow-sm backdrop-blur transition hover:bg-white/70">
          <ArrowLeft className="h-4 w-4" />
          Home
        </a>
        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="relative w-full max-w-[560px] before:absolute before:inset-x-4 before:top-4 before:-bottom-4 before:bg-[#e89e5e]/20 before:content-[''] sm:before:inset-x-5 sm:before:top-5 sm:before:-bottom-5">
            <form onSubmit={handleLogin} className="relative rounded-[1.65rem] border border-white/75 bg-[#fffaf1]/92 px-6 py-8 shadow-[0_34px_100px_-65px_rgba(94,55,33,0.9)] backdrop-blur-xl sm:px-8 sm:py-10">
              <div className="mx-auto mb-2 flex w-fit items-center gap-3 bg-[#fff7e7]/80 px-4 py-3">
                <img src={navMarkSrc} alt="" className="h-10 w-auto max-w-[96px] object-contain" draggable={false} />
                <span className="brand-script text-[1.45rem] leading-none text-[#4f332b]">A&apos;New Dawn</span>
              </div>
              <h1 className="mb-6 text-center font-serif text-4xl leading-tight text-[#4f332b]">Admin Login</h1>
              {error && <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <label className="block text-sm font-semibold text-foreground">
                Email
                <input type="email" required autoComplete="username" className="mt-2 w-full rounded-xl border border-[#e7d9c5] bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" value={username} onChange={(event) => setUsername(event.target.value)} />
              </label>
              <label className="mt-4 block text-sm font-semibold text-foreground">
                Password
                <input type="password" required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-[#e7d9c5] bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary disabled:opacity-60">
                {loading ? "Authenticating..." : "Login"}
                <ShieldCheck className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
