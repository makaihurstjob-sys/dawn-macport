import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/book")({
  component: BookingPage,
});

type AnswerKey = "seeking" | "life_stage" | "session_interest";

const questions: Array<{
  id: AnswerKey;
  title: string;
  options: string[];
}> = [
  {
    id: "seeking",
    title: "What are you seeking most right now?",
    options: ["Clarity", "Confidence", "Consistency", "Purpose", "Support through transition"],
  },
  {
    id: "life_stage",
    title: "What stage of life are you in?",
    options: ["Student", "Working professional", "Entrepreneur", "In transition", "Other"],
  },
  {
    id: "session_interest",
    title: "What type of session are you interested in?",
    options: [
      "Free discovery call",
      "Purpose clarity session",
      "Identity + alignment session",
      "12-week transformation program",
      "I'm not sure yet",
    ],
  },
];

function BookingPage() {
  const [step, setStep] = useState(0);
  const [clientName, setClientName] = useState("");
  const [bookingUrl, setBookingUrl] = useState(siteConfig.bookingUrl);
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({
    seeking: "",
    life_stage: "",
    session_interest: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const progress = useMemo(
    () => Math.min(((Math.min(step, questions.length) + 1) / (questions.length + 1)) * 100, 100),
    [step],
  );
  const nameStep = step === questions.length;
  const complete = step > questions.length;
  const currentQuestion = questions[Math.min(step, questions.length - 1)];
  const hasLiveBookingUrl = Boolean(bookingUrl);
  const schedulerUrl = useMemo(() => {
    if (!bookingUrl) return "";
    try {
      const url = new URL(bookingUrl);
      url.searchParams.set("embed", "true");
      if (clientName.trim()) url.searchParams.set("name", clientName.trim());
      return url.toString();
    } catch {
      return bookingUrl;
    }
  }, [bookingUrl, clientName]);

  useEffect(() => {
    const loadBookingUrl = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "cal_booking_url")
        .maybeSingle();

      const savedUrl = data?.value?.trim();
      if (savedUrl) setBookingUrl(savedUrl);
    };

    void loadBookingUrl();
  }, []);

  const handleOptionSelect = async (option: string) => {
    const nextAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(nextAnswers);
    setSubmitError(false);

    if (step < questions.length - 1) {
      window.setTimeout(() => setStep((current) => current + 1), 240);
      return;
    }

    window.setTimeout(() => setStep(questions.length), 240);
  };

  const handleNameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = clientName.trim();
    if (!trimmedName) return;

    setIsSubmitting(true);
    const { error } = await Promise.race([
      supabase.from("booking_qualifications").insert([{ ...answers, client_name: trimmedName }]),
      new Promise<{ error: Error }>((resolve) => {
        window.setTimeout(() => resolve({ error: new Error("Booking save timed out") }), 3500);
      }),
    ]);
    setIsSubmitting(false);

    if (error) {
      console.warn("[Booking] Qualification answers were not saved:", error.message);
    }

    setStep(questions.length + 1);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf1] text-foreground">
      <div
        className="fixed inset-0 bg-[linear-gradient(180deg,#241f2f_0%,#513447_30%,#b1765f_58%,#f4bd78_76%,#fffaf1_100%)]"
        aria-hidden="true"
      />
      <div
        className="fixed left-[16%] top-[26vh] h-56 w-56 rounded-full bg-[#ffd57e]/55 blur-sm shadow-[0_0_120px_40px_rgba(255,198,105,0.34)]"
        aria-hidden="true"
      />

      <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6">
        <a
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </a>

        <div className="flex flex-1 items-center justify-center py-8">
          <section className="w-full">
            <div className="mx-auto mb-8 max-w-2xl text-center text-white">
              <h1 className="brand-kicker font-serif text-4xl font-medium leading-[1.08] text-[#fff8ea] sm:text-5xl">
                Begin here
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                Answer a few quick questions, then choose a time for us to talk. I&apos;d love to hear
                where you are and what kind of support would feel most helpful right now.
              </p>
            </div>

            <div className="mx-auto max-w-2xl rounded-2xl border border-white/60 bg-background/94 p-5 shadow-[0_36px_120px_-60px_rgba(45,37,54,0.9)] backdrop-blur-xl sm:p-8">
              {!complete && (
                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>
                      {nameStep ? "Your name" : `Question ${step + 1} of ${questions.length}`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {!complete && !nameStep ? (
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    <h2 className="font-serif text-3xl leading-tight text-foreground">
                      {currentQuestion.title}
                    </h2>
                    <div className="mt-8 space-y-3">
                      {currentQuestion.options.map((option) => {
                        const selected = answers[currentQuestion.id] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleOptionSelect(option)}
                            className="group flex w-full items-center justify-between rounded-xl border border-border bg-white/60 px-5 py-4 text-left font-medium text-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white disabled:cursor-wait disabled:opacity-70"
                          >
                            <span>{option}</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                              {selected || isSubmitting ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {submitError && (
                      <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                        Your answers could not be saved. Please try again.
                      </p>
                    )}
                  </motion.div>
                ) : nameStep ? (
                  <motion.form
                    key="client-name"
                    onSubmit={handleNameSubmit}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    <h2 className="font-serif text-3xl leading-tight text-foreground">
                      What name should we attach to this request?
                    </h2>
                    <p className="mt-3 leading-7 text-muted-foreground">
                      This helps the coach recognize your booking quiz inside the dashboard.
                    </p>
                    <label className="mt-8 block text-sm font-semibold text-foreground">
                      Name
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(event) => setClientName(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                        placeholder="Your name"
                      />
                    </label>
                    {submitError && (
                      <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                        Your answers could not be saved. Please try again.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary disabled:cursor-wait disabled:opacity-70"
                    >
                      {isSubmitting ? "Saving..." : "Continue to scheduler"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="scheduler"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CalendarDays className="h-7 w-7" />
                    </div>
                    <h2 className="font-serif text-3xl text-foreground">
                      Choose your session time
                    </h2>
                    <p className="mt-3 leading-7 text-muted-foreground">
                      Use the scheduler below to choose a time for your A&apos;New Dawn session.
                    </p>

                    {hasLiveBookingUrl ? (
                      <div className="mt-8 overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-white/55">
                        <iframe
                          title="Cal.com booking"
                          src={schedulerUrl}
                          className="h-[430px] w-full bg-white"
                        />
                      </div>
                    ) : (
                      <div className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-white/60 p-8 text-center">
                        <p className="font-serif text-2xl text-foreground">
                          Scheduler connection pending
                        </p>
                        <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
                          Add a valid Cal.com booking URL in the dashboard settings, and the live
                          scheduler will appear here.
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <a
                        href="/"
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-background px-5 py-3 font-medium text-foreground transition hover:bg-muted"
                      >
                        Visit Website
                      </a>
                      {hasLiveBookingUrl ? (
                        <a
                          href={bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary"
                        >
                          Book Session
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background opacity-45"
                        >
                          Book Session
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
