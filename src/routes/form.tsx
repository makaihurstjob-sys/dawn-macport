import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Sparkles,
} from "lucide-react";
import navMarkSrc from "@/assets/brand/nav-mark.png";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/form")({
  component: IntakeFormPage,
});

type FieldKind = "input" | "email" | "phone" | "number" | "textarea" | "choice" | "multiChoice";

type Field = {
  id: string;
  label: string;
  placeholder?: string;
  kind: FieldKind;
  options?: string[];
  suggestions?: string[];
  optional?: boolean;
  rows?: number;
};

const formSteps: Array<{
  id: string;
  eyebrow: string;
  title: string;
  fields: Field[];
}> = [
  {
    id: "contact",
    eyebrow: "Step 1",
    title: "First, tell me how to reach you.",
    fields: [
      { id: "email", label: "Email", kind: "email", placeholder: "you@example.com" },
      { id: "phone", label: "Telephone number", kind: "phone", placeholder: "(555) 123-4567" },
      { id: "age", label: "Age", kind: "number", placeholder: "Your age" },
    ],
  },
  {
    id: "current-season",
    eyebrow: "Step 2",
    title: "Name the season you are in right now.",
    fields: [
      {
        id: "life_stage",
        label: "Stage of life",
        kind: "choice",
        options: [
          "High school student",
          "College student",
          "Working professional",
          "Entrepreneur",
          "In transition",
          "Other",
        ],
      },
      {
        id: "lifestyle_sentence",
        label: "How would you describe your current lifestyle in one sentence?",
        kind: "textarea",
        rows: 2,
        placeholder: "Right now, my life feels...",
      },
      {
        id: "stuck_areas",
        label: "Suggested areas that feel stuck",
        kind: "multiChoice",
        options: [
          "School",
          "Career",
          "Purpose",
          "Confidence",
          "Consistency",
          "Faith",
          "Relationships",
          "Emotions",
          "Time management",
          "Decision-making",
        ],
      },
    ],
  },
  {
    id: "friction",
    eyebrow: "Step 3",
    title: "Share what has been getting in the way.",
    fields: [
      {
        id: "top_challenges",
        label: "What are the top three challenges you are currently facing, and why?",
        kind: "textarea",
        placeholder: "List your top three challenges and what you believe is underneath them.",
        suggestions: [
          "I feel unclear about my next step.",
          "I start strong but struggle to stay consistent.",
          "I compare myself to people who seem further ahead.",
          "I feel pressure from family, school, work, or expectations.",
        ],
      },
      {
        id: "negative_thoughts",
        label: "Daily negative thoughts and why",
        kind: "textarea",
        placeholder: "What thoughts repeat most often, and why do you think they show up?",
        suggestions: [
          "I am behind.",
          "I am not disciplined enough.",
          "I do not know where to start.",
          "Other people are more confident than me.",
        ],
      },
      {
        id: "holding_back_habits",
        label: "Habits holding you back",
        kind: "textarea",
        placeholder: "What habits, patterns, or rhythms are you ready to confront?",
        suggestions: [
          "Procrastination",
          "Overthinking",
          "Avoiding hard conversations",
          "Starting things without finishing them",
        ],
      },
      {
        id: "struggle_area",
        label: "Struggle area",
        kind: "choice",
        options: ["Consistency", "Clarity", "Confidence", "Purpose", "All of the above"],
      },
    ],
  },
  {
    id: "purpose",
    eyebrow: "Step 4",
    title: "Reflect on purpose and belief.",
    fields: [
      {
        id: "purpose_clarity",
        label: "Purpose clarity",
        kind: "choice",
        options: ["Clear", "Somewhat clear", "Unclear", "I am still discovering it"],
      },
      {
        id: "purpose_unclear_reason",
        label: "If unclear, describe why",
        kind: "textarea",
        optional: true,
        placeholder: "What feels uncertain, noisy, or hard to name?",
      },
      {
        id: "limiting_beliefs",
        label: "Limiting beliefs",
        kind: "textarea",
        placeholder: "What beliefs about yourself, God, or your future feel limiting?",
      },
    ],
  },
  {
    id: "identity",
    eyebrow: "Step 5",
    title: "Tell me who you are becoming.",
    fields: [
      {
        id: "believe_you_are",
        label: "Who you believe you are",
        kind: "textarea",
        placeholder: "When you are honest and grounded, who do you believe you are?",
      },
      {
        id: "becoming",
        label: "Who you feel you are becoming",
        kind: "textarea",
        placeholder: "Describe the woman or person you sense God is growing you into.",
      },
      {
        id: "most_confident_area",
        label: "Where you feel most confident and why",
        kind: "textarea",
        placeholder: "What part of life reminds you that strength already exists in you?",
      },
    ],
  },
  {
    id: "resilience",
    eyebrow: "Step 6",
    title: "Look at your patterns and environments.",
    fields: [
      {
        id: "setback_response",
        label: "Response to challenges or setbacks",
        kind: "textarea",
        placeholder: "How do you usually respond when something does not go as planned?",
      },
      {
        id: "thriving_environments",
        label: "Environments you thrive in",
        kind: "textarea",
        placeholder: "What spaces, people, or routines help you feel clear and alive?",
      },
      {
        id: "willing_to_release",
        label: "What you are willing to release",
        kind: "textarea",
        placeholder: "What are you ready to lay down so you can move forward?",
      },
    ],
  },
  {
    id: "vision",
    eyebrow: "Step 7",
    title: "Imagine your A'New Dawn.",
    fields: [
      {
        id: "five_year_vision",
        label: "5-year vision",
        kind: "textarea",
        placeholder: "If courage and faith led the way, what would life look like in five years?",
      },
      {
        id: "anew_dawn_vision",
        label: "What your A'New Dawn looks like",
        kind: "textarea",
        placeholder: "Describe the new beginning you are praying and working toward.",
      },
    ],
  },
];

function calculateResult(data: Record<string, string>) {
  const struggle = data.struggle_area || "";
  if (struggle.includes("Clarity")) return "Clarity Season";
  if (struggle.includes("Confidence")) return "Confidence-Building Season";
  if (struggle.includes("Consistency")) return "Consistency Reset Season";
  return "Purpose Discovery Season";
}

function formatPhoneInput(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length < 3) return `(${digits}`;
  if (digits.length === 3) return `(${digits}) `;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function appendSuggestion(current: string, suggestion: string) {
  if (!current.trim()) return suggestion;
  if (current.includes(suggestion)) return current;
  return `${current.trim()}\n${suggestion}`;
}

function IntakeFormPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [resultType, setResultType] = useState("");
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [dictationDraft, setDictationDraft] = useState("");
  const [showMicHint, setShowMicHint] = useState(false);
  const [micHintSeen, setMicHintSeen] = useState(false);
  const recognitionRef = useRef<any>(null);

  const complete = currentStep >= formSteps.length;
  const activeStep = formSteps[Math.min(currentStep, formSteps.length - 1)];
  const progress = useMemo(
    () => Math.min(((currentStep + 1) / formSteps.length) * 100, 100),
    [currentStep],
  );

  useEffect(() => {
    if (currentStep !== 1 || micHintSeen) return;

    setShowMicHint(true);
    const timeout = window.setTimeout(() => {
      setShowMicHint(false);
      setMicHintSeen(true);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [currentStep, micHintSeen]);

  const updateField = (field: string, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setSubmitError("");
  };

  const toggleChoice = (field: Field, option: string) => {
    if (field.kind !== "multiChoice") {
      updateField(field.id, option);
      return;
    }

    const current = (formData[field.id] || "")
      .split(", ")
      .map((item) => item.trim())
      .filter(Boolean);
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    updateField(field.id, next.join(", "));
  };

  const stopDictation = () => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListeningField(null);
    setDictationDraft("");
  };

  const startDictation = (field: Field) => {
    setShowMicHint(false);
    setMicHintSeen(true);

    if (listeningField === field.id && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current?.stop?.();

    const SpeechRecognition =
      (window as typeof window & {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      }).SpeechRecognition ||
      (window as typeof window & {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSubmitError("Voice dictation is not supported in this browser yet.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    setListeningField(field.id);
    setDictationDraft("");
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || "";
        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript.trim()) {
        setDictationDraft(interimTranscript.trim());
      }

      if (finalTranscript.trim()) {
        setFormData((previous) => ({
          ...previous,
          [field.id]: appendSuggestion(previous[field.id] || "", finalTranscript.trim()),
        }));
        setSubmitError("");
        setDictationDraft("");
      }
    };
    recognition.onerror = () => {
      setListeningField(null);
      setDictationDraft("");
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListeningField(null);
      setDictationDraft("");
      recognitionRef.current = null;
    };
    recognition.start();
  };

  const fieldIsMissing = (field: Field) => {
    if (field.optional) return false;
    return !String(formData[field.id] || "").trim();
  };

  const stepIsValid = () => !activeStep.fields.some(fieldIsMissing);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    const result = calculateResult(formData);

    const submission = {
      email: formData.email || "",
      phone: formData.phone || "",
      age: formData.age || "",
      life_stage: formData.life_stage || "",
      lifestyle_sentence: formData.lifestyle_sentence || "",
      top_challenges: formData.top_challenges || "",
      negative_thoughts: formData.negative_thoughts || "",
      purpose_clarity: formData.purpose_clarity || "",
      purpose_unclear_reason: formData.purpose_unclear_reason || "",
      stuck_areas: formData.stuck_areas || "",
      holding_back_habits: formData.holding_back_habits || "",
      struggle_area: formData.struggle_area || "",
      five_year_vision: formData.five_year_vision || "",
      believe_you_are: formData.believe_you_are || "",
      becoming: formData.becoming || "",
      limiting_beliefs: formData.limiting_beliefs || "",
      most_confident_area: formData.most_confident_area || "",
      setback_response: formData.setback_response || "",
      thriving_environments: formData.thriving_environments || "",
      willing_to_release: formData.willing_to_release || "",
      anew_dawn_vision: formData.anew_dawn_vision || "",
      result_type: result,
    };

    const { error } = await supabase.from("intake_submissions").insert([submission]);
    setIsSubmitting(false);

    if (error) {
      setSubmitError("Your responses could not be submitted. Please try again.");
      return;
    }

    setResultType(result);
    setCurrentStep(formSteps.length);
  };

  const nextStep = () => {
    if (!stepIsValid()) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    stopDictation();

    if (currentStep < formSteps.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    void handleSubmit();
  };

  const previousStep = () => {
    setShowValidation(false);
    stopDictation();
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const renderField = (field: Field) => {
    const value = formData[field.id] || "";
    const invalid = showValidation && fieldIsMissing(field);
    const sharedClass = `mt-2 w-full rounded-xl border bg-white/76 px-4 py-2.5 text-foreground outline-none transition placeholder:text-muted-foreground/72 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
      invalid ? "border-destructive" : "border-border"
    }`;

    if (field.kind === "textarea") {
      const showHintForField = showMicHint && field.id === "lifestyle_sentence";
      return (
        <div className={`mt-2 grid gap-3 ${field.suggestions ? "md:grid-cols-[1fr_0.9fr] md:items-start" : ""}`}>
          {showHintForField && <div className="fixed inset-0 z-40 bg-[#17131f]/42 backdrop-blur-sm" />}
          <div className={`relative ${showHintForField ? "z-50" : ""}`}>
            <textarea
              rows={field.rows || 3}
              value={value}
              onChange={(event) => updateField(field.id, event.target.value)}
              placeholder={field.placeholder}
              className={`${sharedClass} mt-0 resize-none pb-14 pr-4`}
            />
            {showHintForField && (
              <div className="pointer-events-none absolute bottom-16 right-0 max-w-[16rem] rounded-2xl bg-[#fff8ea] p-4 text-sm font-semibold leading-5 text-[#3b2a1c] shadow-[0_26px_90px_-42px_rgba(0,0,0,0.8)]">
                <span className="absolute -bottom-2 right-7 h-4 w-4 rotate-45 bg-[#fff8ea]" />
                If it's easier, talk on the screen.
              </div>
            )}
            <button
              type="button"
              onClick={() => startDictation(field)}
              className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border transition ${
                listeningField === field.id
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_6px_rgba(217,139,67,0.14)]"
                  : "border-border bg-white/80 text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Dictate ${field.label}`}
            >
              {listeningField === field.id ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            {listeningField === field.id && (
              <div className="absolute bottom-5 right-14 flex items-end gap-0.5 text-primary" aria-hidden="true">
                <span className="h-2 w-1 rounded-full bg-current animate-pulse" />
                <span className="h-5 w-1 rounded-full bg-current animate-pulse [animation-delay:90ms]" />
                <span className="h-3 w-1 rounded-full bg-current animate-pulse [animation-delay:180ms]" />
                <span className="h-4 w-1 rounded-full bg-current animate-pulse [animation-delay:270ms]" />
              </div>
            )}
            {listeningField === field.id && (
              <div className="absolute bottom-3 left-3 right-24 flex min-h-9 items-center gap-3 rounded-full border border-primary/20 bg-[#fff8ea]/92 px-3 py-1.5 text-xs text-[#3b2a1c] shadow-sm">
                <div className="flex shrink-0 items-center gap-1.5 font-bold uppercase tracking-[0.14em] text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Listening
                </div>
                <p className="min-w-0 truncate font-medium text-foreground/72">
                  {dictationDraft || "Start speaking..."}
                </p>
              </div>
            )}
          </div>
          {field.suggestions && (
            <div className="flex flex-wrap gap-2 md:flex-col">
              {field.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => updateField(field.id, appendSuggestion(value, suggestion))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-left text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground md:rounded-xl md:py-2"
                >
                  <Sparkles className="h-3 w-3" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (field.kind === "choice" || field.kind === "multiChoice") {
      const selected = value
        .split(", ")
        .map((item) => item.trim())
        .filter(Boolean);
      return (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {field.options?.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleChoice(field, option)}
              className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition ${
                selected.includes(option)
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_18px_44px_-34px_rgba(217,139,67,0.9)]"
                  : invalid
                    ? "border-destructive bg-white/65 text-foreground"
                    : "border-border bg-white/64 text-foreground hover:border-primary/35 hover:bg-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    const inputType =
      field.kind === "email"
        ? "email"
        : field.kind === "phone"
          ? "tel"
          : field.kind === "number"
            ? "number"
            : "text";

    return (
      <input
        type={inputType}
        value={value}
        onChange={(event) =>
          updateField(field.id, field.kind === "phone" ? formatPhoneInput(event.target.value) : event.target.value)
        }
        placeholder={field.placeholder}
        inputMode={field.kind === "phone" ? "tel" : field.kind === "number" ? "numeric" : undefined}
        className={sharedClass}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] px-4 py-5 text-foreground sm:px-6">
      <div className="fixed inset-0 bg-[linear-gradient(180deg,#fffaf2_0%,#fae4b7_40%,#f1ad78_72%,#fff0dc_100%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.7),transparent_38%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-3xl flex-col justify-start py-2 lg:justify-center">
        {!complete && (
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2 text-[#4f332b]">
                <img src={navMarkSrc} alt="" className="h-7 w-auto max-w-[48px] object-contain" draggable={false} />
                <span className="brand-script text-[1.45rem] leading-none">A&apos;New Dawn</span>
                <span className="font-sans text-sm font-semibold">Form</span>
              </span>
              <span className="text-[#765e56]">
                Step {currentStep + 1} of {formSteps.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e7d9c5]">
              <motion.div
                className="h-full rounded-full bg-[#e89e5e]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/75 bg-[#fffaf1]/92 p-4 shadow-[0_40px_120px_-70px_rgba(94,55,33,0.55)] backdrop-blur-xl sm:p-6 md:p-7">
          {!complete ? (
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-primary">
                  {activeStep.eyebrow}
                </p>
                <h1 className="font-serif text-3xl font-medium leading-tight text-foreground">
                  {activeStep.title}
                </h1>

                <div className="mt-6 space-y-4">
                  {activeStep.fields.map((field) => (
                    <div key={field.id} className="block text-sm font-semibold text-foreground">
                      <p>
                        {field.label}
                        {field.optional && (
                          <span className="ml-2 font-normal text-muted-foreground">Optional</span>
                        )}
                      </p>
                      {renderField(field)}
                      {showValidation && fieldIsMissing(field) && (
                        <span className="mt-1 block text-xs text-destructive">
                          This question is required.
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {submitError && (
                  <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    {submitError}
                  </p>
                )}

                <div className="mt-7 flex items-center justify-between border-t border-border/60 pt-5">
                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={currentStep === 0 || isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="inline-flex min-w-[12rem] items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-primary disabled:opacity-60"
                  >
                    {currentStep === formSteps.length - 1
                      ? isSubmitting
                        ? "Submitting..."
                        : "Submit Reflection"
                      : "Continue"}
                    {currentStep === formSteps.length - 1 ? (
                      <ArrowRight className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </section>
            ) : (
              <section className="flex min-h-[480px] flex-col items-center justify-center text-center">
                <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h1 className="font-serif text-4xl font-medium text-foreground">
                  Thank you for sharing your story.
                </h1>
                <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
                  Your responses have been received. Based on your reflection, this looks like a{" "}
                  {resultType}.
                </p>
                <a
                  href="/"
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 font-medium text-background transition hover:bg-primary"
                >
                  Visit Website
                  <ArrowRight className="h-5 w-5" />
                </a>
              </section>
            )}
        </div>
      </main>
    </div>
  );
}
