import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, UserRoundCheck } from "lucide-react";
import navMarkSrc from "@/assets/brand/nav-mark.png";
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

function getInviteCallbackState() {
  if (typeof window === "undefined") return { isSetup: false, errorMessage: "" };

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const type = hashParams.get("type");
  const errorCode = hashParams.get("error_code");
  const rawDescription = hashParams.get("error_description");
  const errorDescription = rawDescription?.replace(/\+/g, " ") || "";

  if (errorCode === "otp_expired") {
    return {
      isSetup: false,
      errorMessage:
        "This invite link is invalid or has expired. Ask the coach to send a fresh invite.",
    };
  }

  if (errorDescription) {
    return { isSetup: false, errorMessage: errorDescription };
  }

  return {
    isSetup: type === "invite" || type === "recovery",
    errorMessage: "",
  };
}

function CustomerLogin() {
  const navigate = useNavigate();
  const redirectPath = useMemo(getRedirectPath, []);
  const inviteCallback = useMemo(getInviteCallbackState, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(inviteCallback.isSetup);
  const [error, setError] = useState("");
  const [linkStatus, setLinkStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inviteCallback.errorMessage) {
      setError(inviteCallback.errorMessage);
    }
  }, [inviteCallback.errorMessage]);

  useEffect(() => {
    if (isSettingPassword) return;

    const continueActiveSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("role").single();
      if (profile?.role === "customer") {
        await navigate({ to: redirectPath });
      }
    };

    void continueActiveSession();
  }, [isSettingPassword, navigate, redirectPath]);

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

    await navigate({ to: redirectPath });
  };

  const handlePasswordSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLinkStatus("");

    if (newPassword.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setLinkStatus("Password saved. Opening your course portal...");
    setIsSettingPassword(false);
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8ea_0%,#f7d6a3_38%,#f1a56e_64%,#fff8ea_100%)] text-foreground">
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-7 sm:px-6">
        <a
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/55 bg-white/35 px-4 py-2 text-sm font-medium text-[#51372f] shadow-sm backdrop-blur transition hover:bg-white/55"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </a>

        <section className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/70 bg-[#fffaf1]/90 shadow-[0_36px_120px_-65px_rgba(94,55,33,0.86)] backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-[#e7cda9]/70 bg-[linear-gradient(155deg,rgba(255,250,241,0.98)_0%,rgba(255,236,197,0.92)_55%,rgba(242,155,44,0.24)_100%)] p-8 text-[#4f332b] md:border-b-0 md:border-r sm:p-10">
              <div className="mb-12 flex items-center gap-3">
                <img
                  src={navMarkSrc}
                  alt=""
                  className="h-12 w-auto max-w-[116px] object-contain"
                  draggable={false}
                />
                <span className="brand-script text-[1.7rem] leading-none text-[#4f332b]">
                  A&apos;New Dawn
                </span>
              </div>
              <h1 className="font-serif text-4xl leading-[1.06] text-[#4f332b]">
                Continue your course path.
              </h1>
            </div>

            <form
              onSubmit={isSettingPassword ? handlePasswordSetup : handleLogin}
              className="p-6 sm:p-10"
            >
              <div className="mb-7 flex items-center gap-3">
                <div>
                  <h2 className="font-serif text-3xl text-foreground">
                    {isSettingPassword ? "Create Password" : "Login"}
                  </h2>
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

              {isSettingPassword ? (
                <>
                  <label className="block text-sm font-semibold text-foreground">
                    New password
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>

                  <label className="mt-4 block text-sm font-semibold text-foreground">
                    Confirm password
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>
                </>
              ) : (
                <>
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
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary disabled:opacity-60"
              >
                {loading
                  ? isSettingPassword
                    ? "Saving password..."
                    : "Opening portal..."
                  : isSettingPassword
                    ? "Create Password"
                    : "Open Portal"}
                <UserRoundCheck className="h-4 w-4" />
              </button>
              {!isSettingPassword && (
                <button
                  type="button"
                  onClick={sendLoginLink}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-5 py-3 font-medium text-foreground transition hover:bg-muted"
                >
                  Email me a secure login link
                </button>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
