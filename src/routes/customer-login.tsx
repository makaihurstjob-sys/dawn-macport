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
  if (typeof window === "undefined") return { isSetup: false, errorMessage: "", successMessage: "" };

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
      successMessage: "",
    };
  }

  if (errorDescription) {
    return { isSetup: false, errorMessage: errorDescription, successMessage: "" };
  }

  const isSetup = type === "invite" || type === "recovery";

  return {
    isSetup,
    errorMessage: "",
    successMessage: isSetup
      ? "Verification successful. Your invitation was accepted. Create a password to finish setting up your client portal."
      : "",
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
    if (inviteCallback.successMessage) {
      setLinkStatus(inviteCallback.successMessage);
    }
  }, [inviteCallback.errorMessage, inviteCallback.successMessage]);

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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#fae4b7_40%,#f1ad78_72%,#fff0dc_100%)] text-foreground">
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-7 sm:px-6">
        <a
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/75 bg-white/45 px-4 py-2 text-sm font-medium text-[#51372f] shadow-sm backdrop-blur transition hover:bg-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </a>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="relative w-full max-w-[560px] before:absolute before:inset-x-4 before:top-4 before:-bottom-4 before:bg-[#e89e5e]/20 before:content-[''] sm:before:inset-x-5 sm:before:top-5 sm:before:-bottom-5">
            <form
              onSubmit={isSettingPassword ? handlePasswordSetup : handleLogin}
              className="relative rounded-[1.65rem] border border-white/75 bg-[#fffaf1]/92 px-6 py-8 shadow-[0_34px_100px_-65px_rgba(94,55,33,0.9)] backdrop-blur-xl sm:px-8 sm:py-10"
            >
              <div className="mx-auto mb-2 flex w-fit items-center gap-3 bg-[#fff7e7]/80 px-4 py-3">
                <img
                  src={navMarkSrc}
                  alt=""
                  className="h-10 w-auto max-w-[96px] object-contain"
                  draggable={false}
                />
                <span className="brand-script text-[1.45rem] leading-none text-[#4f332b]">
                  A&apos;New Dawn
                </span>
              </div>
              <h1 className="mb-6 text-center font-serif text-4xl leading-tight text-[#4f332b]">
                {isSettingPassword ? "Create Password" : "Login"}
              </h1>

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
                      className="mt-2 w-full rounded-xl border border-[#e7d9c5] bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
                      className="mt-2 w-full rounded-xl border border-[#e7d9c5] bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
                      className="mt-2 w-full rounded-xl border border-[#e7d9c5] bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
                      className="mt-2 w-full rounded-xl border border-[#e7d9c5] bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
                    : "Login"}
                <UserRoundCheck className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
