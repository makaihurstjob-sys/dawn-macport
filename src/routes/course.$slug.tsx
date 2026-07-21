import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Folder,
  Heart,
  Leaf,
  LogOut,
  Play,
  Video,
} from "lucide-react";
import navMarkSrc from "@/assets/brand/nav-mark.png";
import { getCustomerAuthState } from "@/lib/customer-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/course/$slug")({
  beforeLoad: async ({ params }) => {
    if (params.slug === "demo") return;

    const { isCustomer } = await getCustomerAuthState();
    if (!isCustomer) {
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

type Lesson = {
  id: string;
  sectionId: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  prompts: string[];
};

type ReadingSection = { heading: string; body: string; prompts?: string[] };

const lessonReadings: Record<string, ReadingSection[]> = {
  welcome: [
    { heading: "Awareness", body: "Awareness is the beginning of clarity. Notice your current mindset, habits, and the areas of life asking for strength or change. This is a space for clarity, not judgment.", prompts: ["Who am I?", "What impact do I want my life to have?", "What areas of my life feel unclear or stagnant?"] },
    { heading: "Life Areas Check-In", body: "Personal growth, mental health, relationships, career or purpose, finances, physical health, spiritual life, and confidence all tell part of the story.", prompts: ["Which areas score the lowest?", "Which area surprised you?", "What patterns do you notice?"] },
    { heading: "Daily Awareness Practice", body: "Write down what you thought about most today, what habits helped or hurt your growth, and what emotions you felt.", prompts: ["What did today’s awareness reveal about the direction of your life?"] },
  ],
  journey: [
    { heading: "Who Is Occupying Your Mind?", body: "Identify the person or situation taking up the most space in your mind. Awareness creates separation, and separation creates power.", prompts: ["How often do they come to mind?", "What triggers these thoughts?", "What feels unresolved here?"] },
    { heading: "Energy Audit", body: "Name what this mental occupation is costing you: time, emotional energy, focus, productivity, or self-worth. Then name what it is adding to your life, if anything.", prompts: ["If nothing changed with this person, would your life still move forward?"] },
    { heading: "Take Your Power Back", body: "Choose release or realignment. You can release an expectation, memory, or version of someone—or choose one clear conversation or boundary.", prompts: ["I release ___ because I deserve ___.", "What will I give my focus to instead?"] },
  ],
  "faith-centered": [
    { heading: "What Alignment Means", body: "Alignment is when what you think matches what you believe, what you believe matches how you feel, and what you feel matches what you do. Alignment creates clarity, peace, confidence, and forward momentum." },
    { heading: "Alignment Check-In", body: "Notice what feels off, where you are forcing something, and what you are tolerating that does not reflect who you want to be.", prompts: ["What is my truth in this situation?", "What would the highest version of me choose?", "What is one action I can take today to realign?"] },
    { heading: "Final Reflection", body: "Alignment is when your life reflects your truth—not your fear, past, or other people’s expectations.", prompts: ["What shifted for you during this exercise?"] },
  ],
  "awareness-release": [
    { heading: "Mindset Renewal", body: "Mindset renewal is the intentional process of resetting how you think, perceive, and respond, so your thoughts start working for you instead of against you." },
    { heading: "Release and Reframe", body: "Release old identities, past failures, and other people’s perceptions. Choose a more powerful truth that feels possible, not fake.", prompts: ["What belief have I outgrown but still carry?", "What is a more empowering truth?", "What do I choose to believe now?"] },
    { heading: "Rebuild and Reinforce", body: "Create intentional beliefs around identity, capability, and future. Reinforce them through affirmation, journaling, visualization, and aligned action.", prompts: ["What action will prove this belief today?", "What did I think differently today?"] },
  ],
  "alignment-receive": [
    { heading: "Goal Execution", body: "Clear goals make execution lighter. Define what you want, why it matters spiritually and practically, and who you become as you achieve it." },
    { heading: "Make It Real", body: "Break a big goal into monthly targets, weekly actions, and daily non-negotiables. Execution is not motivation—it is structure.", prompts: ["What is my 90-day power goal?", "What does success look like?", "What are my daily non-negotiables?"] },
    { heading: "Weekly Reflection", body: "Notice what you executed well, where you hesitated, what you learned, and what you will elevate next week.", prompts: ["What is one bold action I will complete today?"] },
  ],
  "wisdom-respond": [
    { heading: "Integration", body: "Ideas become reality by doing the right things in the right order with intention: aligned decisions, focused execution, and measurable outcomes." },
    { heading: "Strategic Plan", body: "Get clear on your outcome, your current position, and the high-impact actions that move you forward. Structure beats motivation.", prompts: ["What area of my life is asking for structure right now?", "What is my desired outcome?", "What are three high-impact actions?"] },
    { heading: "Commitment", body: "Expect obstacles, prepare for resistance, and adjust rather than quit. Your life changes through what you execute consistently.", prompts: ["What is my weekly commitment?", "On a scale of 1–10, how committed am I?"] },
  ],
};

type CurriculumSection = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type CourseMaterial = {
  title: string;
  description: string;
  size: string;
  source: string;
  url?: string | null;
};

type LessonActivity = {
  videoWatched: boolean;
  downloadedMaterials: string[];
  respondedPrompts: string[];
};

const curriculum: CurriculumSection[] = [
  {
    id: "foundations",
    title: "Welcome & Foundations",
    lessons: [
      {
        id: "welcome",
        sectionId: "foundations",
        title: "Welcome to A New Dawn: Awareness",
        subtitle: "Begin with clarity, not judgment.",
        duration: "08:20",
        description: "Start by noticing your mindset, habits, identity, and the areas of life asking for clarity.",
        prompts: ["What are you hoping this course helps you name more clearly?"],
      },
      {
        id: "journey",
        sectionId: "foundations",
        title: "Your Coaching Journey",
        subtitle: "Prepare your heart",
        duration: "09:40",
        description: "Understand how reflection, practice, and coaching support work together.",
        prompts: ["What support do you want to receive differently in this season?"],
      },
      {
        id: "faith-centered",
        sectionId: "foundations",
        title: "Faith-Centered Coaching",
        subtitle: "Anchor the work",
        duration: "10:15",
        description: "Set a spiritual foundation for honest reflection and aligned action.",
        prompts: ["Where do you want God's truth to become louder than pressure?"],
      },
    ],
  },
  {
    id: "dawn-method",
    title: "The DAWN Method",
    lessons: [
      {
        id: "awareness-release",
        sectionId: "dawn-method",
        title: "Awareness: Release",
        subtitle: "The first light of transformation.",
        duration: "12:45",
        description:
          "Awareness is where the journey begins. In this step, you are invited to pause, reflect, and release what no longer serves you. With God's truth as your anchor, you create space for clarity, healing, and new possibilities to rise.",
        prompts: [
          "What am I being invited to release today?",
          "Where have I seen God’s faithfulness in my journey so far?",
        ],
      },
      {
        id: "alignment-receive",
        sectionId: "dawn-method",
        title: "Alignment: Receive",
        subtitle: "The second light of transformation.",
        duration: "14:10",
        description:
          "Receive the truer story, align your next step with your values, and let clarity become practical.",
        prompts: ["What truth am I ready to receive and practice this week?"],
      },
      {
        id: "wisdom-respond",
        sectionId: "dawn-method",
        title: "Wisdom: Respond",
        subtitle: "Move with discernment.",
        duration: "11:35",
        description: "Turn reflection into a wise response that fits your capacity and calling.",
        prompts: ["What response would honor both truth and my current capacity?"],
      },
      {
        id: "nurture-grow",
        sectionId: "dawn-method",
        title: "Nurture: Grow",
        subtitle: "Practice what is becoming.",
        duration: "13:05",
        description: "Create the rhythm and support that help the new story take root.",
        prompts: ["What rhythm will help me reinforce this growth?"],
      },
    ],
  },
  {
    id: "tools",
    title: "Tools & Practices",
    lessons: [
      {
        id: "daily-reflection",
        sectionId: "tools",
        title: "Daily Reflection",
        subtitle: "Small honest check-ins",
        duration: "07:45",
        description: "Build a gentle daily rhythm for noticing what is shifting.",
        prompts: ["What did I notice today that I would normally rush past?"],
      },
      {
        id: "prayer-surrender",
        sectionId: "tools",
        title: "Prayer & Surrender",
        subtitle: "Let go with intention",
        duration: "08:35",
        description: "Use prayer as a place to release control and listen for direction.",
        prompts: ["What am I still trying to carry alone?"],
      },
      {
        id: "journaling",
        sectionId: "tools",
        title: "Journaling for Clarity",
        subtitle: "Write your way into truth",
        duration: "09:15",
        description: "Use guided journaling to make the invisible visible.",
        prompts: ["What keeps repeating in my writing?"],
      },
    ],
  },
  {
    id: "coaching-action",
    title: "Coaching in Action",
    lessons: [
      {
        id: "workshop-demo",
        sectionId: "coaching-action",
        title: "Client Workshop Demo",
        subtitle: "Bring the work into session",
        duration: "18:00",
        description: "See how the worksheet can become a coaching conversation.",
        prompts: ["What would I want to bring into a live session?"],
      },
      {
        id: "breakthrough",
        sectionId: "coaching-action",
        title: "Breakthrough Conversations",
        subtitle: "Practice honest language",
        duration: "16:20",
        description: "Learn how to name a breakthrough without forcing one.",
        prompts: ["What conversation am I avoiding that could create clarity?"],
      },
      {
        id: "holding-space",
        sectionId: "coaching-action",
        title: "Holding Space with Grace",
        subtitle: "Stay present",
        duration: "12:00",
        description: "Stay gentle and accountable while the new thing is forming.",
        prompts: ["Where do I need more grace and more structure?"],
      },
    ],
  },
  {
    id: "integration-next",
    title: "Integration & Next Steps",
    lessons: [
      {
        id: "staying-anchored",
        sectionId: "integration-next",
        title: "Staying Anchored",
        subtitle: "Keep the work alive",
        duration: "10:30",
        description: "Create a simple plan for returning to your anchor after the course.",
        prompts: ["What anchor can I return to when life gets loud?"],
      },
      {
        id: "next-chapter",
        sectionId: "integration-next",
        title: "Your Next Chapter",
        subtitle: "Name the next step",
        duration: "11:45",
        description: "Translate the course into a next chapter you can actually walk out.",
        prompts: ["What is the next chapter asking of me?"],
      },
      {
        id: "closing-blessing",
        sectionId: "integration-next",
        title: "Closing & Blessing",
        subtitle: "Close with intention",
        duration: "08:00",
        description: "Gather your reflections and close the course with prayerful commitment.",
        prompts: ["What blessing am I carrying forward?"],
      },
    ],
  },
];

const allLessons = curriculum.flatMap((section) => section.lessons);

const documentMaterials: CourseMaterial[] = [
  {
    title: "DAWN Method Worksheet",
    description: "Word Document · 431 KB",
    size: "431 KB",
    source: "DAWN Method (1).docx",
  },
  {
    title: "Client Workshop",
    description: "Word Document · 430 KB",
    size: "430 KB",
    source: "D.A.W.N Client Workshop.docx",
  },
  {
    title: "Closing Remarks",
    description: "Word Document · 467 KB",
    size: "467 KB",
    source: "Closing Remarks.docx",
  },
];

function CoursePage() {
  const { slug } = Route.useParams();
  const isDemo = slug === "demo";
  const [userId, setUserId] = useState("");
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingItemKey, setSavingItemKey] = useState("");
  // Every new course visit starts at the welcome lesson. Learners can still use
  // the course progress menu to return to any lesson they have already opened.
  const [activeLessonId, setActiveLessonId] = useState("welcome");
  const [lessonActivity, setLessonActivity] = useState<Record<string, LessonActivity>>({});
  const [nearLessonEnd, setNearLessonEnd] = useState(false);
  const [completionPhase, setCompletionPhase] = useState<"idle" | "saving" | "ready-next">("idle");
  const [curriculumCollapsed, setCurriculumCollapsed] = useState(false);
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>([
    "foundations",
    "dawn-method",
    "tools",
  ]);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);
  const [zoomMeetingsExpanded, setZoomMeetingsExpanded] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError("");

      if (isDemo) {
        setUserId("");
        setCourse({
          id: "demo",
          title: "The DAWN Method",
          slug: "demo",
          description:
            "A guided customer portal demo for lesson videos, worksheets, reflection prompts, and coaching progress.",
          course_resources: [],
        });
        setProgress([
          { id: "demo-welcome", item_key: "welcome", completed: true },
          { id: "demo-journey", item_key: "journey", completed: true },
        ]);
        setLoading(false);
        return;
      }

      const { isCustomer, userId: customerId } = await getCustomerAuthState();

      if (!isCustomer || !customerId) {
        setError("Sign in again to open this course.");
        setLoading(false);
        return;
      }
      setUserId(customerId);

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
        .eq("customer_id", customerId);

      setProgress((progressData || []) as ProgressItem[]);
      setLoading(false);
    };

    void loadCourse();
  }, [isDemo, slug]);

  const completedKeys = useMemo(
    () => new Set(progress.filter((item) => item.completed).map((item) => item.item_key)),
    [progress],
  );

  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId) || allLessons[0];
  const activeSectionIndex = curriculum.findIndex((section) => section.id === activeLesson.sectionId);
  const activeLessonIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson.id);
  const nextLesson = allLessons[activeLessonIndex + 1];
  const completedCount = allLessons.filter((lesson) => completedKeys.has(lesson.id)).length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);
  const activeActivity = lessonActivity[activeLesson.id] || {
    videoWatched: false,
    downloadedMaterials: [],
    respondedPrompts: [],
  };
  const lessonTaskCount = 1 + activeLesson.prompts.length;
  const completedLessonTaskCount =
    1 +
    activeLesson.prompts.filter((prompt) => activeActivity.respondedPrompts.includes(prompt)).length;
  const lessonProgressPercent = Math.round((completedLessonTaskCount / lessonTaskCount) * 100);
  const lessonReadyToComplete = lessonProgressPercent === 100;
  const showCompletionAction =
    lessonReadyToComplete && nearLessonEnd && !completedKeys.has(activeLesson.id);
  const showNextLessonCard = completionPhase === "ready-next";

  useEffect(() => {
    setCompletionPhase("idle");
    setNearLessonEnd(false);
  }, [activeLesson.id]);

  useEffect(() => {
    const updateNearLessonEnd = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setNearLessonEnd(scrollBottom >= documentHeight - 220);
    };

    updateNearLessonEnd();
    window.addEventListener("scroll", updateNearLessonEnd, { passive: true });
    window.addEventListener("resize", updateNearLessonEnd);

    return () => {
      window.removeEventListener("scroll", updateNearLessonEnd);
      window.removeEventListener("resize", updateNearLessonEnd);
    };
  }, []);

  const materials = useMemo(() => {
    const databaseResources = course?.course_resources || [];
    return documentMaterials.map((material) => {
      const matchingResource = databaseResources.find((resource) =>
        [resource.title, resource.description]
          .join(" ")
          .toLowerCase()
          .includes(material.title.toLowerCase().split(" ")[0]),
      );

      return {
        ...material,
        url: matchingResource?.url || material.url || null,
      };
    });
  }, [course]);

  const courseResources = useMemo<CourseMaterial[]>(() => {
    const databaseResources = course?.course_resources || [];

    if (databaseResources.length > 0) {
      return databaseResources.map((resource) => ({
        title: resource.title,
        description: resource.description || "Course resource",
        size: "",
        source: resource.title,
        url: resource.url,
      }));
    }

    return documentMaterials;
  }, [course]);
  const readingSections = lessonReadings[activeLesson.id] || [];

  const toggleProgress = async (itemKey: string) => {
    if (!course || savingItemKey) return;

    const alreadyComplete = completedKeys.has(itemKey);
    const nextComplete = !alreadyComplete;
    const completedAt = nextComplete ? new Date().toISOString() : null;

    if (isDemo || !userId) {
      setProgress((current) => {
        if (nextComplete) {
          return [
            { id: `demo-${itemKey}`, item_key: itemKey, completed: true },
            ...current.filter((item) => item.item_key !== itemKey),
          ];
        }

        return current.filter((item) => item.item_key !== itemKey);
      });
      return;
    }

    setSavingItemKey(itemKey);
    setError("");

    const { data, error: upsertError } = await supabase
      .from("course_progress")
      .upsert(
        {
          customer_id: userId,
          course_id: course.id,
          item_key: itemKey,
          completed: nextComplete,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "customer_id,course_id,item_key" },
      )
      .select("id,item_key,completed")
      .single();

    setSavingItemKey("");

    if (upsertError || !data) {
      setError(upsertError?.message || "Progress could not be saved.");
      return;
    }

    setProgress((current) => [
      data as ProgressItem,
      ...current.filter((item) => item.item_key !== itemKey),
    ]);
  };

  const updateLessonActivity = (
    lessonId: string,
    updater: (current: LessonActivity) => LessonActivity,
  ) => {
    setLessonActivity((current) => {
      const existing = current[lessonId] || {
        videoWatched: false,
        downloadedMaterials: [],
        respondedPrompts: [],
      };

      return {
        ...current,
        [lessonId]: updater(existing),
      };
    });
  };

  const markVideoWatched = () => {
    updateLessonActivity(activeLesson.id, (current) => ({ ...current, videoWatched: true }));
  };

  const markMaterialDownloaded = (materialTitle: string) => {
    updateLessonActivity(activeLesson.id, (current) => ({
      ...current,
      downloadedMaterials: Array.from(new Set([...current.downloadedMaterials, materialTitle])),
    }));
  };

  const markPromptResponded = (prompt: string) => {
    updateLessonActivity(activeLesson.id, (current) => ({
      ...current,
      respondedPrompts: Array.from(new Set([...current.respondedPrompts, prompt])),
    }));
  };

  const completeLessonAndRecommendNext = async () => {
    if (!lessonReadyToComplete || completionPhase === "saving") return;

    setCompletionPhase("saving");
    await toggleProgress(activeLesson.id);
    window.setTimeout(() => {
      setCompletionPhase("ready-next");
    }, 2400);
  };

  const openNextLesson = () => {
    if (!nextLesson) return;
    setActiveLessonId(nextLesson.id);
    setCompletionPhase("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExit = async () => {
    if (isDemo) {
      window.location.href = "/";
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf4] text-[#4a284f]">
        Loading course...
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf4] px-4 text-center text-[#4a284f]">
        <div className="max-w-md rounded-[1.75rem] border border-[#ead9c7] bg-white p-8 shadow-sm">
          <h1 className="font-serif text-3xl">Access not available</h1>
          <p className="mt-3 leading-7 text-[#746174]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] text-[#321d38]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-[#ead9c7] bg-[#fffaf4]/96 shadow-[18px_0_60px_-48px_rgba(54,30,45,0.7)] backdrop-blur-xl transition-[width] duration-300 ease-out xl:block ${
          curriculumCollapsed ? "w-0" : "w-[300px]"
        }`}
      >
        <div className={`flex h-full w-[300px] flex-col transition-opacity duration-200 ${curriculumCollapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <div className="relative px-7 pb-7 pt-8">
            <button
              type="button"
              aria-label={curriculumCollapsed ? "Expand course progress" : "Collapse course progress"}
              aria-expanded={!curriculumCollapsed}
              onClick={() => setCurriculumCollapsed((current) => !current)}
              className={`pointer-events-auto fixed top-7 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-[#ead9c7] bg-[#fffaf4] text-[#4a284f] shadow-sm transition-[left] duration-300 ease-out hover:bg-[#fff1e3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f08045] ${
                curriculumCollapsed ? "left-4" : "left-[282px]"
              }`}
            >
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${curriculumCollapsed ? "rotate-180" : ""}`} />
            </button>
            <a href="/" className="flex items-center gap-3">
              <img
                src={navMarkSrc}
                alt=""
                className="h-12 w-auto max-w-[58px] shrink-0 object-contain"
                draggable={false}
              />
              <span>
                <span className="brand-script block text-[2rem] leading-none text-[#6a4a68]">
                  A&apos;New Dawn
                </span>
                <span className="ml-10 block text-[0.64rem] font-bold uppercase tracking-[0.42em] text-[#7b6179]">
                  Coaching
                </span>
              </span>
            </a>
          </div>

          <div className="px-6">
            <h2 className="text-sm font-semibold text-[#321d38]">
              Course Progress
            </h2>
            <div className="mt-4 border-b border-[#ead9c7] pb-5">
              <div className="flex items-center justify-between text-xs text-[#6f6470]">
                <span>{completedCount} of {allLessons.length} lessons</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f1e7dc]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#ef824a,#ffd889)] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Course progress">
            {curriculum.map((section, sectionIndex) => {
              const sectionComplete = section.lessons.every((lesson) => completedKeys.has(lesson.id));
              const sectionActive = section.id === activeLesson.sectionId;
              const sectionExpanded = expandedSectionIds.includes(section.id);

              return (
                <div key={section.id} className="mb-5">
                  <button
                    type="button"
                    onClick={() => toggleSectionExpanded(section.id)}
                    aria-expanded={sectionExpanded}
                    className="flex w-full items-center justify-between gap-3 py-1.5 text-left text-sm font-semibold text-[#321d38]"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          sectionActive ? "bg-[#f08045]" : "bg-[#4a2854]"
                        }`}
                      />
                      <span>
                        {sectionIndex + 1}. {section.title}
                      </span>
                    </span>
                    {sectionExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    )}
                  </button>

                  {sectionExpanded && (
                    <div className="mt-2 space-y-1.5">
                      {section.lessons.map((lesson) => {
                        const lessonActive = lesson.id === activeLesson.id;
                        const complete = completedKeys.has(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-xs transition ${
                              lessonActive
                                ? "border-[#f0c9a8] bg-[#fff1e3] text-[#321d38]"
                                : "border-transparent text-[#5e4c60] hover:bg-[#fff5eb]"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[0.35rem] border ${
                                lessonActive
                                  ? "border-[#f08045] text-[#f08045]"
                                  : "border-[#4a2854] text-[#4a2854]"
                              }`}
                            >
                              <Video className="h-2.5 w-2.5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                            <span
                              className={`h-3.5 w-3.5 shrink-0 rounded-full border ${
                                complete
                                  ? "border-[#d88a20] bg-[#d88a20]"
                                  : lessonActive
                                    ? "border-[#f08045] bg-[#f08045]"
                                    : "border-[#c9b9ad]"
                              }`}
                            >
                              {complete && <Check className="h-3 w-3 text-white" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {sectionComplete && <span className="sr-only">{section.title} complete</span>}
                </div>
              );
            })}

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setZoomMeetingsExpanded((current) => !current)}
                aria-expanded={zoomMeetingsExpanded}
                className="flex w-full items-center justify-between gap-3 py-1.5 text-left text-sm font-semibold text-[#321d38]"
              >
                <span className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4a2854]" />
                  <span>6. Zoom Meetings</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${zoomMeetingsExpanded ? "" : "-rotate-90"}`} />
              </button>

              {zoomMeetingsExpanded && (
                <div className="mt-2 rounded-xl border border-[#ead5c2] bg-[#fff8ef] p-3 text-xs leading-5 text-[#6f6470]">
                  <span className="flex items-center gap-2 font-semibold text-[#4a284f]">
                    <Video className="h-4 w-4 text-[#ef824a]" />
                    Live coaching sessions
                  </span>
                  <p className="mt-2">
                    Your coach will add your upcoming Zoom session here. When it is scheduled, you will be able to join from this protected portal.
                  </p>
                </div>
              )}
            </div>
          </nav>

          <div className="p-6">
            <button
              type="button"
              onClick={() => setResourcesExpanded((current) => !current)}
              aria-expanded={resourcesExpanded}
              className="flex w-full items-center justify-between rounded-xl border border-[#ead9c7] bg-[#fff8ef] px-4 py-4 text-sm text-[#4f3d50]"
            >
              <span className="flex items-center gap-3">
                <Folder className="h-5 w-5" />
                Course Resources
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${resourcesExpanded ? "rotate-180" : ""}`} />
            </button>
            {resourcesExpanded && (
              <div className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-xl border border-[#ead9c7] bg-white p-2">
                {courseResources.map((resource) => {
                  const contents = (
                    <>
                      <span className="block truncate text-xs font-semibold text-[#4a284f]">{resource.title}</span>
                      <span className="mt-0.5 block truncate text-[0.69rem] text-[#827482]">
                        {resource.url ? "Open resource" : resource.description}
                      </span>
                    </>
                  );

                  return resource.url ? (
                    <a
                      key={resource.title}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg px-2.5 py-2 transition hover:bg-[#fff1e3]"
                    >
                      {contents}
                    </a>
                  ) : (
                    <div key={resource.title} className="rounded-lg px-2.5 py-2">
                      {contents}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      <header className={`sticky top-0 z-30 border-b border-[#ead9c7] bg-[#fffaf4]/92 backdrop-blur-xl transition-[margin] duration-300 ease-out ${curriculumCollapsed ? "xl:ml-0" : "xl:ml-[300px]"}`}>
        <div className="grid min-h-[68px] grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[#3f2d43]">
            <span>{activeSectionIndex + 1}.</span>
            <span className="truncate">{course?.title || "The DAWN Method"}</span>
            <ChevronRight className="h-4 w-4 text-[#9c8797]" />
            <span className="truncate">{activeLesson.title}</span>
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-5 text-[#321d38]">
              <Bell className="hidden h-5 w-5 sm:block" />
              <button
                type="button"
                onClick={handleExit}
                className="inline-flex items-center gap-2 rounded-full text-sm font-semibold"
              >
                <span className="hidden h-9 w-9 overflow-hidden rounded-full bg-[linear-gradient(145deg,#f6d8c1,#fff5e5)] ring-1 ring-[#ead9c7] sm:inline-block" />
                <span className="sr-only sm:not-sr-only">{isDemo ? "Exit demo" : "Logout"}</span>
                <LogOut className="h-4 w-4 sm:hidden" />
                <ChevronDown className="hidden h-4 w-4 sm:block" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`transition-[margin] duration-300 ease-out ${curriculumCollapsed ? "xl:ml-0" : "xl:ml-[300px]"}`}>
        <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
          <div className="mx-auto max-w-7xl">
            <section className="relative overflow-hidden pb-2">
              <div
                className="pointer-events-none absolute right-0 top-0 hidden h-64 w-96 opacity-70 md:block"
                aria-hidden="true"
              >
                <div className="absolute right-14 top-20 h-24 w-24 rounded-full bg-[#fff9e8] shadow-[0_0_70px_25px_rgba(241,164,83,0.22)]" />
                <div className="absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_70%_55%,rgba(242,155,74,0.18)_0_1px,transparent_2px)] [background-size:22px_22px] opacity-30" />
                <div className="absolute bottom-9 right-10 h-16 w-72 rounded-[50%] bg-[#efc29d]/20 blur-xl" />
              </div>

              <h1 className="relative z-10 font-serif text-5xl font-medium leading-none text-[#4a284f] sm:text-6xl">
                {activeLesson.title}
              </h1>
              <p className="relative z-10 mt-5 font-serif text-2xl text-[#c36d15]">
                {activeLesson.subtitle}
              </p>
              <p className="relative z-10 mt-4 max-w-2xl text-[15px] leading-7 text-[#4f4654]">
                {activeLesson.description}
              </p>
              <div className="relative z-10 mt-7 max-w-2xl rounded-2xl border border-[#ead5c2] bg-[#fff8ef] p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-[#4a284f]">This lesson progress</span>
                  <span className="text-[#766776]">
                    {completedLessonTaskCount} of {lessonTaskCount} steps
                  </span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#f1e7dc]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#ef824a,#ffd889)] transition-all duration-500"
                    style={{ width: `${lessonProgressPercent}%` }}
                  />
                </div>
                <div className="mt-3 grid gap-2 text-xs text-[#746174] sm:grid-cols-3">
                  <span className={activeActivity.videoWatched ? "font-semibold text-[#4f7d5b]" : ""}>
                    ✓ Read lesson
                  </span>
                  <span
                    className={
                      "font-semibold text-[#4f7d5b]"
                    }
                  >
                    ✓ Explore exercises
                  </span>
                  <span
                    className={
                      activeLesson.prompts.every((prompt) =>
                        activeActivity.respondedPrompts.includes(prompt),
                      )
                        ? "font-semibold text-[#4f7d5b]"
                        : ""
                    }
                  >
                    {activeLesson.prompts.every((prompt) =>
                      activeActivity.respondedPrompts.includes(prompt),
                    )
                      ? "✓"
                      : "○"}{" "}
                    Respond to prompts
                  </span>
                </div>
              </div>
            </section>

            {readingSections.length > 0 && (
              <section className="mt-6 space-y-5" aria-label="Lesson reading">
                {readingSections.map((section) => (
                  <article key={section.heading} className="rounded-2xl border border-[#ead5c2] bg-white/70 p-6 shadow-[0_18px_55px_-46px_rgba(67,35,55,0.8)]">
                    <h2 className="font-serif text-2xl text-[#4a284f]">{section.heading}</h2>
                    <p className="mt-3 text-[1rem] leading-8 text-[#4f4654] [word-spacing:0.08em]">
                      {section.body.split(/(\s+)/).map((part, index) =>
                        /^\s+$/.test(part) ? part : <span key={`${part}-${index}`} className="cursor-text rounded-sm transition-colors duration-150 hover:bg-[#ffe4bd] hover:text-[#b85d19]">{part}</span>,
                      )}
                    </p>
                    {section.prompts && (
                      <div className="mt-5 space-y-2 border-t border-[#f0e2d3] pt-4">
                        {section.prompts.map((prompt) => (
                          <button key={prompt} type="button" onClick={() => markPromptResponded(prompt)} className="flex w-full items-center gap-3 rounded-xl bg-[#fff7ed] px-4 py-3 text-left text-sm text-[#4b3a4d] transition hover:bg-[#fff0dc]">
                            <Leaf className="h-4 w-4 shrink-0 text-[#ef824a]" />
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </section>
            )}

            <section className="mt-7">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-5 w-5 text-[#6d3d65]" />
                <div>
                  <h2 className="font-serif text-2xl text-[#4a284f]">Lesson Worksheets</h2>
                  <p className="text-sm text-[#766776]">Download and complete the worksheets for this lesson.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-5 md:grid-cols-3">
                {materials.map((material) => {
                  const downloaded = activeActivity.downloadedMaterials.includes(material.title);

                  return (
                  <article
                    key={material.title}
                    className="grid grid-cols-[86px_minmax(0,1fr)] gap-4 rounded-xl border border-[#ead5c2] bg-[#fffaf4] p-3 shadow-[0_14px_42px_-38px_rgba(67,35,55,0.8)]"
                  >
                    <div className="flex h-[88px] items-center justify-center rounded-lg border border-[#ead5c2] bg-[#fff6ec]">
                      <div className="relative h-14 w-10 rounded-sm bg-white shadow-sm">
                        <span className="absolute right-0 top-0 h-3 w-3 bg-[#f4ddc9] [clip-path:polygon(0_0,100%_100%,100%_0)]" />
                        <span className="absolute left-2 top-6 h-0.5 w-6 bg-[#ef7d73]" />
                        <span className="absolute left-2 top-8 h-0.5 w-5 bg-[#ef7d73]" />
                        <span className="absolute left-2 top-10 h-0.5 w-6 bg-[#ef7d73]" />
                      </div>
                    </div>
                    <div className="min-w-0 py-1">
                      <h3 className="text-sm font-semibold leading-snug text-[#38213e]">
                        {material.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#827482]">{material.description}</p>
                      {material.url ? (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => markMaterialDownloaded(material.title)}
                          className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#efc9ac] bg-[#fff1e3] px-4 py-2 text-xs font-semibold text-[#b55d0e]"
                        >
                          {downloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                          {downloaded ? "Downloaded" : "Download"}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markMaterialDownloaded(material.title)}
                          className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#efc9ac] bg-[#fff1e3] px-4 py-2 text-xs font-semibold text-[#b55d0e]"
                        >
                          {downloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                          {downloaded ? "Downloaded" : "Download"}
                        </button>
                      )}
                    </div>
                  </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-7 pb-12">
              <div className="flex items-start gap-3">
                <Heart className="mt-1 h-5 w-5 fill-[#ff7f7c] text-[#ff7f7c]" />
                <div>
                  <h2 className="font-serif text-2xl text-[#4a284f]">Reflection Prompts</h2>
                  <p className="text-sm text-[#766776]">Take a few moments to reflect and journal.</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {activeLesson.prompts.map((prompt) => {
                  const responded = activeActivity.respondedPrompts.includes(prompt);

                  return (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => markPromptResponded(prompt)}
                    className="flex w-full items-center gap-5 rounded-xl border border-[#ead5c2] bg-[#fffaf4] px-4 py-3 text-left shadow-[0_14px_42px_-40px_rgba(67,35,55,0.8)]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#fff1e3] text-[#ee7c55]">
                      {responded ? <Check className="h-5 w-5" /> : <Leaf className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-[#4b3a4d]">{prompt}</span>
                    <span className="hidden text-sm text-[#9c8d98] sm:block">
                      {responded ? "Reflection saved" : "Write your thoughts..."}
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#5b4d58]" />
                  </button>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>

      <div
        className={`fixed left-1/2 top-20 z-50 w-[min(92vw,26rem)] -translate-x-1/2 transition-all duration-500 ${
          showCompletionAction || completionPhase === "saving"
            ? "translate-y-0 opacity-100"
            : "-translate-y-8 pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={completeLessonAndRecommendNext}
          disabled={completionPhase === "saving"}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#ead0ba] bg-[#fffaf4] px-5 py-4 text-lg font-semibold text-[#5b465c] shadow-[0_18px_55px_-34px_rgba(67,35,55,0.9)] transition hover:bg-[#fff1e3] disabled:cursor-wait disabled:opacity-75"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e38239] text-[#e38239]">
            {completionPhase === "saving" ? null : <Check className="h-3.5 w-3.5" />}
          </span>
          {completionPhase === "saving" ? "Saving lesson..." : "Mark as Complete"}
        </button>
      </div>

      {showNextLessonCard && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#321d38]/18 px-4 pb-8 backdrop-blur-sm sm:items-center sm:pb-0">
          <section className="w-full max-w-md translate-y-0 rounded-3xl border border-[#ead0ba] bg-[#fffaf4] p-6 shadow-[0_28px_90px_-42px_rgba(54,30,45,0.9)] animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#f28c55,#f0b38b)] text-white">
                <Play className="ml-1 h-8 w-8 fill-current" />
              </div>
              <div>
                <p className="text-sm text-[#6f6470]">Next lesson recommended</p>
                <h3 className="mt-1 font-serif text-3xl leading-tight text-[#4a284f]">
                  {nextLesson?.title || "Course Complete"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6f6470]">
                  {nextLesson?.subtitle || "You have reached the end of this demo path."}
                </p>
              </div>
            </div>
            {nextLesson && (
              <button
                type="button"
                onClick={openNextLesson}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef824a] px-4 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#e3753c]"
              >
                Continue to Next Lesson
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
