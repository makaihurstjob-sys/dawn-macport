import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  ClipboardList,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  FileText,
  Home,
  Link,
  LogOut,
  Mail,
  MessageSquareText,
  NotebookPen,
  Phone,
  Save,
  Settings,
  Trash2,
  UserPlus,
  UserRoundCheck,
  UsersRound,
  QrCode,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { inviteCustomerToCourse } from "@/lib/customer-admin";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type ContactMessage = Tables<"contact_messages">;
type BookingQualification = Tables<"booking_qualifications">;
type IntakeSubmission = Tables<"intake_submissions">;
type DashboardNote = Tables<"dashboard_notes">;
type SiteSetting = Tables<"site_settings">;
type Course = Tables<"courses">;
type CourseProgress = Tables<"course_progress">;
type CustomerProfile = Tables<"profiles">;
type QrLink = Tables<"qr_links"> & { courses?: { title: string; slug: string } | null };
type CustomerEnrollment = Tables<"customer_enrollments"> & {
  courses?: { title: string; slug: string } | null;
  profiles?: { username: string | null; full_name: string | null } | null;
};
type Role = "admin" | "developer" | "customer";
type View =
  | "overview"
  | "contacts"
  | "bookings"
  | "intake"
  | "customers"
  | "notes"
  | "settings"
  | "developer";

const navItems: Array<{ id: View; label: string; icon: typeof Home; developerOnly?: boolean }> = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "contacts", label: "Contact Messages", icon: Mail },
  { id: "bookings", label: "Booking Quiz", icon: CalendarCheck },
  { id: "intake", label: "Survey Entries", icon: ClipboardList },
  { id: "customers", label: "Customers / Courses", icon: UsersRound },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "developer", label: "Developer", icon: Code2, developerOnly: true },
];

function statusTone(status?: string | null) {
  const value = (status || "New").toLowerCase();
  if (value.includes("follow")) return "bg-[#fff0ce] text-[#815a18]";
  if (value.includes("complete")) return "bg-emerald-50 text-emerald-700";
  if (value.includes("new")) return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function withTimeout<T>(promise: Promise<T>, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      globalThis.setTimeout(() => reject(new Error(message)), 10000);
    }),
  ]);
}

function DashboardPage() {
  const [role, setRole] = useState<Role>("admin");
  const [activeView, setActiveView] = useState<View>("overview");
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [bookings, setBookings] = useState<BookingQualification[]>([]);
  const [intakes, setIntakes] = useState<IntakeSubmission[]>([]);
  const [notes, setNotes] = useState<DashboardNote[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [enrollments, setEnrollments] = useState<CustomerEnrollment[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [qrLinks, setQrLinks] = useState<QrLink[]>([]);
  const [noteText, setNoteText] = useState("");
  const [calBookingUrl, setCalBookingUrl] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [qrSlug, setQrSlug] = useState("dawn-method");
  const [qrStatus, setQrStatus] = useState("");
  const [customerStatus, setCustomerStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const refreshCustomerCourseData = async () => {
    const [courseResult, customerResult, enrollmentResult, progressResult, qrResult] =
      await withTimeout(
        Promise.all([
          supabase.from("courses").select("*").order("created_at", { ascending: true }),
          supabase.from("profiles").select("*").eq("role", "customer").order("created_at", {
            ascending: false,
          }),
          supabase
            .from("customer_enrollments")
            .select("*,courses(title,slug),profiles(username,full_name)")
            .order("created_at", { ascending: false }),
          supabase.from("course_progress").select("*"),
          supabase
            .from("qr_links")
            .select("*,courses(title,slug)")
            .order("created_at", { ascending: false }),
        ]),
        "Customer/course data did not load. Confirm the customer course migration has been run.",
      );

    setCourses(courseResult.data || []);
    setCustomers(customerResult.data || []);
    setEnrollments((enrollmentResult.data || []) as CustomerEnrollment[]);
    setCourseProgress(progressResult.data || []);
    setQrLinks((qrResult.data || []) as QrLink[]);

    const firstCourseId = courseResult.data?.[0]?.id;
    if (firstCourseId) {
      setSelectedCourseId((current) => current || firstCourseId);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setDashboardError("");

      try {
        const {
          data: { user },
        } = await withTimeout(
          supabase.auth.getUser(),
          "Supabase did not respond. Connect the new project before using the dashboard.",
        );

        if (user) {
          const { data: profile } = await withTimeout(
            supabase.from("profiles").select("role").eq("id", user.id).single(),
            "Could not load the dashboard profile role.",
          );

          if (profile?.role) setRole(profile.role);
        }

        const [contactResult, bookingResult, intakeResult, noteResult] = await withTimeout(
          Promise.all([
            supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
            supabase
              .from("booking_qualifications")
              .select("*")
              .order("created_at", { ascending: false }),
            supabase.from("intake_submissions").select("*").order("created_at", {
              ascending: false,
            }),
            supabase.from("dashboard_notes").select("*").order("created_at", { ascending: false }),
          ]),
          "Dashboard data did not load. Confirm Supabase URL, anon key, migrations, and user role.",
        );

        setContacts(contactResult.data || []);
        setBookings(bookingResult.data || []);
        setIntakes(intakeResult.data || []);
        setNotes(noteResult.data || []);

        await refreshCustomerCourseData();

        const { data: settingsData, error: settingsError } = await supabase
          .from("site_settings")
          .select("*");

        if (!settingsError) {
          setSettings(settingsData || []);
          setCalBookingUrl(
            settingsData?.find((setting) => setting.key === "cal_booking_url")?.value || "",
          );
        }
      } catch (error) {
        setDashboardError(error instanceof Error ? error.message : "Dashboard data unavailable.");
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const allLeadStatuses = [
      ...contacts.map((item) => item.status),
      ...bookings.map((item) => item.status),
      ...intakes.map((item) => item.status),
    ];
    return {
      newLeads: allLeadStatuses.filter((status) => (status || "New") === "New").length,
      contactMessages: contacts.length,
      bookingQuizzes: bookings.length,
      surveyEntries: intakes.length,
    };
  }, [bookings, contacts, intakes]);

  const rawData = useMemo(
    () => ({
      contacts,
      bookingQuizSubmissions: bookings,
      surveyEntries: intakes,
      notes,
      settings,
      courses,
      customers,
      enrollments,
      courseProgress,
      qrLinks,
    }),
    [bookings, contacts, courseProgress, courses, customers, enrollments, intakes, notes, qrLinks, settings],
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const addNote = async () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;

    const { data } = await supabase
      .from("dashboard_notes")
      .insert([{ note: trimmed, related_type: "general" }])
      .select("*")
      .single();

    if (data) {
      setNotes((current) => [data, ...current]);
      setNoteText("");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Delete this booking quiz entry?")) return;

    setDashboardError("");

    const { data: deleted, error } = await supabase.rpc("delete_booking_qualification", {
      _id: id,
    });
    if (error) {
      setDashboardError(error.message);
      return;
    }

    if (!deleted) {
      setDashboardError(
        "Supabase did not delete this booking entry. Run the latest dashboard delete migration, then try again.",
      );
      return;
    }

    setBookings((current) => current.filter((booking) => booking.id !== id));
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm("Delete this dashboard note?")) return;

    setDashboardError("");

    const { data: deleted, error } = await supabase.rpc("delete_dashboard_note", {
      _id: id,
    });
    if (error) {
      setDashboardError(error.message);
      return;
    }

    if (!deleted) {
      setDashboardError(
        "Supabase did not delete this note. Run the latest dashboard delete migration, then try again.",
      );
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== id));
  };

  const saveCalBookingUrl = async () => {
    setSettingsStatus("");

    const value = calBookingUrl.trim();
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({ key: "cal_booking_url", value, updated_at: new Date().toISOString() })
      .select("*")
      .single();

    if (error) {
      setSettingsStatus(error.message);
      return;
    }

    if (data) {
      setSettings((current) => [
        data,
        ...current.filter((setting) => setting.key !== "cal_booking_url"),
      ]);
    }
    setSettingsStatus("Cal.com link saved.");
  };

  const inviteCustomer = async () => {
    setCustomerStatus("");
    setDashboardError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setCustomerStatus("Log in again before inviting a customer.");
      return;
    }

    try {
      await inviteCustomerToCourse({
        data: {
          accessToken: session.access_token,
          email: customerEmail,
          fullName: customerName,
          courseId: selectedCourseId,
        },
      });
      setCustomerStatus("Customer invite sent and course enrollment created.");
      setCustomerName("");
      setCustomerEmail("");
      await refreshCustomerCourseData();
    } catch (error) {
      setCustomerStatus(error instanceof Error ? error.message : "Customer invite failed.");
    }
  };

  const createQrLink = async () => {
    setQrStatus("");
    const slug = qrSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    if (!slug || !selectedCourseId) return;

    const course = courses.find((item) => item.id === selectedCourseId);
    const { error } = await supabase.from("qr_links").upsert({
      slug,
      course_id: selectedCourseId,
      label: `${course?.title || "Course"} QR`,
      active: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setQrStatus(error.message);
      return;
    }

    setQrStatus("QR route saved.");
    await refreshCustomerCourseData();
  };

  const toggleQrLink = async (qrLink: QrLink) => {
    const { error } = await supabase
      .from("qr_links")
      .update({ active: !qrLink.active, updated_at: new Date().toISOString() })
      .eq("id", qrLink.id);

    if (error) {
      setQrStatus(error.message);
      return;
    }

    await refreshCustomerCourseData();
  };

  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setQrStatus("Copied.");
  };

  return (
    <div className="min-h-screen bg-[#f7f0e7] text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-border bg-background/90 p-4 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
          <div className="mb-6 flex items-center justify-between lg:block">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                A'New Dawn
              </p>
              <h1 className="mt-1 font-serif text-2xl text-foreground">Dashboard</h1>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
              {role}
            </span>
          </div>

          <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
            {navItems
              .filter((item) => !item.developerOnly || role === "developer")
              .map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`flex min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition lg:w-full ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive lg:w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Private client lead workspace
              </p>
              <h2 className="font-serif text-4xl text-foreground">
                {activeView === "overview"
                  ? "Welcome back"
                  : navItems.find((item) => item.id === activeView)?.label}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading dashboard..." : "Latest data from Supabase"}
            </p>
          </header>

          {dashboardError && (
            <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm leading-6 text-destructive">
              {dashboardError}
            </div>
          )}

          {activeView === "overview" && (
            <Overview stats={stats} contacts={contacts} bookings={bookings} intakes={intakes} />
          )}
          {activeView === "contacts" && <ContactsView contacts={contacts} />}
          {activeView === "bookings" && (
            <BookingsView bookings={bookings} deleteBooking={deleteBooking} />
          )}
          {activeView === "intake" && <IntakeView intakes={intakes} />}
          {activeView === "customers" && (
            <CustomersCoursesView
              courses={courses}
              customers={customers}
              enrollments={enrollments}
              progress={courseProgress}
              qrLinks={qrLinks}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              selectedCourseId={selectedCourseId}
              setSelectedCourseId={setSelectedCourseId}
              customerStatus={customerStatus}
              inviteCustomer={inviteCustomer}
              qrSlug={qrSlug}
              setQrSlug={setQrSlug}
              qrStatus={qrStatus}
              createQrLink={createQrLink}
              toggleQrLink={toggleQrLink}
              copyText={copyText}
            />
          )}
          {activeView === "notes" && (
            <NotesView
              notes={notes}
              noteText={noteText}
              setNoteText={setNoteText}
              addNote={addNote}
              deleteNote={deleteNote}
            />
          )}
          {activeView === "settings" && (
            <SettingsView
              calBookingUrl={calBookingUrl}
              setCalBookingUrl={setCalBookingUrl}
              saveCalBookingUrl={saveCalBookingUrl}
              settingsStatus={settingsStatus}
            />
          )}
          {activeView === "developer" && role === "developer" && (
            <DeveloperView rawData={rawData} />
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Home;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-[0_22px_70px_-55px_rgba(75,50,35,0.75)]">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-4xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Overview({
  stats,
  contacts,
  bookings,
  intakes,
}: {
  stats: {
    newLeads: number;
    contactMessages: number;
    bookingQuizzes: number;
    surveyEntries: number;
  };
  contacts: ContactMessage[];
  bookings: BookingQualification[];
  intakes: IntakeSubmission[];
}) {
  const recent = [
    ...contacts.map((item) => ({
      id: item.id,
      type: "Contact message",
      title: item.name,
      detail: item.email,
      status: item.status,
      created_at: item.created_at,
    })),
    ...bookings.map((item) => ({
      id: item.id,
      type: "Booking quiz",
      title: item.client_name || item.session_interest,
      detail: `${item.seeking} - ${item.life_stage}`,
      status: item.status,
      created_at: item.created_at,
    })),
    ...intakes.map((item) => ({
      id: item.id,
      type: "Survey entry",
      title: item.email,
      detail: item.result_type || item.struggle_area,
      status: item.status,
      created_at: item.created_at,
    })),
  ]
    .sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value={stats.newLeads} icon={UserRoundCheck} />
        <StatCard label="Contact messages" value={stats.contactMessages} icon={Mail} />
        <StatCard
          label="Booking quiz submissions"
          value={stats.bookingQuizzes}
          icon={CalendarCheck}
        />
        <StatCard label="Survey entries" value={stats.surveyEntries} icon={ClipboardList} />
      </div>

      <section className="rounded-2xl border border-border/70 bg-background shadow-sm">
        <div className="border-b border-border/70 px-6 py-4">
          <h3 className="font-serif text-2xl text-foreground">Recent activity</h3>
        </div>
        <div className="divide-y divide-border/70">
          {recent.length === 0 ? (
            <EmptyState label="No submissions yet." />
          ) : (
            recent.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    {item.type}
                  </p>
                  <p className="mt-1 font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(item.status)}`}
                  >
                    {item.status || "New"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ContactsView({ contacts }: { contacts: ContactMessage[] }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-background shadow-sm">
      {contacts.length === 0 ? (
        <EmptyState label="No contact messages yet." />
      ) : (
        <div className="divide-y divide-border/70">
          {contacts.map((message) => (
            <article key={message.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-foreground">{message.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {message.email}
                    </span>
                    {message.phone && (
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {message.phone}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(message.status)}`}
                >
                  {message.status || "New"}
                </span>
              </div>
              <p className="mt-5 leading-7 text-foreground/80">{message.message}</p>
              {message.notes && (
                <p className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                  Notes: {message.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function BookingsView({
  bookings,
  deleteBooking,
}: {
  bookings: BookingQualification[];
  deleteBooking: (id: string) => void;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {bookings.length === 0 ? (
        <EmptyState label="No booking quiz submissions yet." />
      ) : (
        bookings.map((booking) => (
          <article
            key={booking.id}
            className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl leading-tight text-foreground">
                  {booking.client_name || "Unnamed lead"}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(booking.status)}`}
                  >
                    {booking.status || "New"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(booking.created_at)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteBooking(booking.id)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                aria-label={`Delete booking entry for ${booking.client_name || "unnamed lead"}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <dl className="space-y-4">
              {booking.client_name && <DashboardField label="Name" value={booking.client_name} />}
              <DashboardField label="Seeking" value={booking.seeking} />
              <DashboardField label="Life stage" value={booking.life_stage} />
              <DashboardField label="Session interest" value={booking.session_interest} />
              {booking.email && <DashboardField label="Email" value={booking.email} />}
              {booking.phone && <DashboardField label="Phone" value={booking.phone} />}
              {booking.notes && <DashboardField label="Notes" value={booking.notes} />}
            </dl>
          </article>
        ))
      )}
    </section>
  );
}

function IntakeView({ intakes }: { intakes: IntakeSubmission[] }) {
  return (
    <section className="space-y-4">
      {intakes.length === 0 ? (
        <EmptyState label="No survey entries yet." />
      ) : (
        intakes.map((intake) => (
          <details
            key={intake.id}
            className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm"
          >
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-foreground">{intake.email}</h3>
                  <p className="text-sm text-muted-foreground">
                    {intake.result_type || intake.struggle_area} - {formatDate(intake.created_at)}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusTone(intake.status)}`}
                >
                  {intake.status || "New"}
                </span>
              </div>
            </summary>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DashboardField label="Phone" value={intake.phone} />
              <DashboardField label="Age" value={intake.age} />
              <DashboardField label="Life stage" value={intake.life_stage} />
              <DashboardField label="Lifestyle sentence" value={intake.lifestyle_sentence} />
              <DashboardField label="Top challenges" value={intake.top_challenges} />
              <DashboardField label="Negative thoughts" value={intake.negative_thoughts} />
              <DashboardField label="Purpose clarity" value={intake.purpose_clarity} />
              <DashboardField
                label="If unclear, why"
                value={intake.purpose_unclear_reason || "N/A"}
              />
              <DashboardField label="Stuck areas" value={intake.stuck_areas} />
              <DashboardField label="Habits holding back" value={intake.holding_back_habits} />
              <DashboardField label="Struggle area" value={intake.struggle_area} />
              <DashboardField label="5-year vision" value={intake.five_year_vision} />
              <DashboardField label="Who they believe they are" value={intake.believe_you_are} />
              <DashboardField label="Who they are becoming" value={intake.becoming} />
              <DashboardField label="Limiting beliefs" value={intake.limiting_beliefs} />
              <DashboardField label="Most confident area" value={intake.most_confident_area} />
              <DashboardField label="Setback response" value={intake.setback_response} />
              <DashboardField label="Thriving environments" value={intake.thriving_environments} />
              <DashboardField label="Willing to release" value={intake.willing_to_release} />
              <DashboardField label="A'New Dawn vision" value={intake.anew_dawn_vision} />
              {intake.notes && <DashboardField label="Notes" value={intake.notes} />}
            </div>
          </details>
        ))
      )}
    </section>
  );
}

function getCustomerAppBaseUrl() {
  if (typeof window === "undefined") return "https://app.anewdawncoaching.org";
  if (window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1")) {
    return window.location.origin;
  }
  return "https://app.anewdawncoaching.org";
}

function getQrUrl(slug: string) {
  return `${getCustomerAppBaseUrl()}/go/${slug}`;
}

function getQrImageUrl(slug: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    getQrUrl(slug),
  )}`;
}

function CustomersCoursesView({
  courses,
  customers,
  enrollments,
  progress,
  qrLinks,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  selectedCourseId,
  setSelectedCourseId,
  customerStatus,
  inviteCustomer,
  qrSlug,
  setQrSlug,
  qrStatus,
  createQrLink,
  toggleQrLink,
  copyText,
}: {
  courses: Course[];
  customers: CustomerProfile[];
  enrollments: CustomerEnrollment[];
  progress: CourseProgress[];
  qrLinks: QrLink[];
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (value: string) => void;
  customerStatus: string;
  inviteCustomer: () => void;
  qrSlug: string;
  setQrSlug: (value: string) => void;
  qrStatus: string;
  createQrLink: () => void;
  toggleQrLink: (qrLink: QrLink) => void;
  copyText: (value: string) => void;
}) {
  const completedByCustomer = useMemo(() => {
    return progress.reduce<Record<string, number>>((acc, item) => {
      if (item.completed) acc[item.customer_id] = (acc[item.customer_id] || 0) + 1;
      return acc;
    }, {});
  }, [progress]);

  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Invite-only setup
              </p>
              <h3 className="font-serif text-2xl text-foreground">Add customer</h3>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block text-sm font-semibold text-foreground">
              Customer name
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Novel Allen"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Customer email
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="customer@example.com"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Assign course
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {customerStatus && (
            <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              {customerStatus}
            </p>
          )}

          <button
            type="button"
            onClick={inviteCustomer}
            disabled={!customerName.trim() || !customerEmail.trim() || !selectedCourseId}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send Invite
            <UserPlus className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                QR routes
              </p>
              <h3 className="font-serif text-2xl text-foreground">Generate short link</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
            <label className="block text-sm font-semibold text-foreground">
              QR slug
              <input
                type="text"
                value={qrSlug}
                onChange={(event) => setQrSlug(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="dawn-method"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Course
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {qrStatus && (
            <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              {qrStatus}
            </p>
          )}

          <button
            type="button"
            onClick={createQrLink}
            disabled={!qrSlug.trim() || !selectedCourseId}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save QR Route
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-border/70 bg-background shadow-sm">
          <div className="border-b border-border/70 px-6 py-4">
            <h3 className="font-serif text-2xl text-foreground">Customer access</h3>
          </div>
          {customers.length === 0 ? (
            <EmptyState label="No customer profiles yet." />
          ) : (
            <div className="divide-y divide-border/70">
              {customers.map((customer) => {
                const customerEnrollments = enrollments.filter(
                  (enrollment) => enrollment.customer_id === customer.id,
                );
                return (
                  <article key={customer.id} className="p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-serif text-2xl text-foreground">
                          {customer.full_name || "Unnamed customer"}
                        </h4>
                        <p className="text-sm text-muted-foreground">{customer.username}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
                        {completedByCustomer[customer.id] || 0} complete
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {customerEnrollments.map((enrollment) => (
                        <span
                          key={enrollment.id}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {enrollment.courses?.title || "Course"} - {enrollment.status}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border/70 bg-background shadow-sm">
          <div className="border-b border-border/70 px-6 py-4">
            <h3 className="font-serif text-2xl text-foreground">QR links</h3>
          </div>
          {qrLinks.length === 0 ? (
            <EmptyState label="No QR links yet." />
          ) : (
            <div className="divide-y divide-border/70">
              {qrLinks.map((qrLink) => {
                const qrUrl = getQrUrl(qrLink.slug);
                return (
                  <article key={qrLink.id} className="grid gap-5 p-5 sm:grid-cols-[140px_1fr]">
                    <img
                      src={getQrImageUrl(qrLink.slug)}
                      alt={`QR code for ${qrLink.label}`}
                      className="h-[140px] w-[140px] rounded-xl border border-border bg-white p-2"
                    />
                    <div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="font-serif text-2xl text-foreground">{qrLink.label}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {qrLink.courses?.title || "Course"} - {qrLink.scan_count} scans
                          </p>
                        </div>
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            qrLink.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {qrLink.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-4 break-all rounded-xl bg-muted/55 p-3 font-mono text-xs text-muted-foreground">
                        {qrUrl}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => copyText(qrUrl)}
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                          <Copy className="h-4 w-4" />
                          Copy link
                        </button>
                        <a
                          href={getQrImageUrl(qrLink.slug)}
                          download={`${qrLink.slug}-qr.png`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                          <Download className="h-4 w-4" />
                          QR image
                        </a>
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Test route
                        </a>
                        <button
                          type="button"
                          onClick={() => toggleQrLink(qrLink)}
                          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-primary"
                        >
                          {qrLink.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function NotesView({
  notes,
  noteText,
  setNoteText,
  addNote,
  deleteNote,
}: {
  notes: DashboardNote[];
  noteText: string;
  setNoteText: (value: string) => void;
  addNote: () => void;
  deleteNote: (id: string) => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
        <h3 className="font-serif text-2xl text-foreground">Add note</h3>
        <textarea
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          rows={7}
          className="mt-5 w-full resize-none rounded-xl border border-border bg-white/70 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          placeholder="Write a private dashboard note..."
        />
        <button
          type="button"
          onClick={addNote}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary"
        >
          Save Note
          <MessageSquareText className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-2xl border border-border/70 bg-background shadow-sm">
        {notes.length === 0 ? (
          <EmptyState label="No dashboard notes yet." />
        ) : (
          <div className="divide-y divide-border/70">
            {notes.map((note) => (
              <article key={note.id} className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="leading-7 text-foreground/80">{note.note}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {note.related_type} - {formatDate(note.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Delete dashboard note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsView({
  calBookingUrl,
  setCalBookingUrl,
  saveCalBookingUrl,
  settingsStatus,
}: {
  calBookingUrl: string;
  setCalBookingUrl: (value: string) => void;
  saveCalBookingUrl: () => void;
  settingsStatus: string;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Link className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Booking integration
            </p>
            <h3 className="font-serif text-2xl text-foreground">Cal.com link</h3>
          </div>
        </div>

        <label className="block text-sm font-semibold text-foreground">
          Public booking URL
          <input
            type="url"
            value={calBookingUrl}
            onChange={(event) => setCalBookingUrl(event.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="https://cal.com/..."
          />
        </label>

        {settingsStatus && (
          <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            {settingsStatus}
          </p>
        )}

        <button
          type="button"
          onClick={saveCalBookingUrl}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition hover:bg-primary"
        >
          Save Cal.com Link
          <Save className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
        <Settings className="mb-4 h-6 w-6 text-primary" />
        <h3 className="font-serif text-2xl text-foreground">Calendar connection</h3>
        <div className="mt-3 space-y-4 leading-7 text-muted-foreground">
          <p>
            Google Calendar should be connected inside the Cal.com account. Once Cal.com is
            connected to Google Calendar, this website only needs the public Cal.com booking URL.
          </p>
          <p>
            After saving the URL here, the booking page will show the live scheduler after the three
            quiz questions and name step.
          </p>
        </div>
      </div>
    </section>
  );
}

function DeveloperView({ rawData }: { rawData: unknown }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-border/70 bg-[#161821] p-6 text-slate-100 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <FileJson className="h-5 w-5 text-sky-300" />
          <h3 className="font-mono text-lg">Raw JSON View</h3>
        </div>
        <pre className="max-h-[620px] overflow-auto rounded-xl bg-black/35 p-4 text-xs leading-6 text-slate-300">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </div>
      <div className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
          <Download className="mb-4 h-6 w-6 text-primary" />
          <h3 className="font-serif text-2xl text-foreground">CSV Export</h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            Placeholder for future export tooling. No CSV file is generated yet.
          </p>
          <button
            type="button"
            disabled
            className="mt-5 rounded-xl bg-muted px-5 py-3 text-sm font-medium text-muted-foreground"
          >
            Export Placeholder
          </button>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
          <Settings className="mb-4 h-6 w-6 text-primary" />
          <h3 className="font-serif text-2xl text-foreground">System Settings</h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            Placeholder for environment checks, integrations, and deployment notes.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
          <FileText className="mb-4 h-6 w-6 text-primary" />
          <h3 className="font-serif text-2xl text-foreground">Developer Notes</h3>
          <p className="mt-3 leading-7 text-muted-foreground">
            Developer-only area for implementation notes and operational context.
          </p>
        </div>
      </div>
    </section>
  );
}

function DashboardField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/55 p-4">
      <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">{value}</dd>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
      {label}
    </div>
  );
}
