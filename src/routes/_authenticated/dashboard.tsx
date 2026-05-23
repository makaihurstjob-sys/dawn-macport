import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  ClipboardList,
  Code2,
  Download,
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
  UserRoundCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type ContactMessage = Tables<"contact_messages">;
type BookingQualification = Tables<"booking_qualifications">;
type IntakeSubmission = Tables<"intake_submissions">;
type DashboardNote = Tables<"dashboard_notes">;
type SiteSetting = Tables<"site_settings">;
type Role = "admin" | "developer";
type View = "overview" | "contacts" | "bookings" | "intake" | "notes" | "settings" | "developer";

const navItems: Array<{ id: View; label: string; icon: typeof Home; developerOnly?: boolean }> = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "contacts", label: "Contact Messages", icon: Mail },
  { id: "bookings", label: "Booking Quiz", icon: CalendarCheck },
  { id: "intake", label: "Survey Entries", icon: ClipboardList },
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
  const [noteText, setNoteText] = useState("");
  const [calBookingUrl, setCalBookingUrl] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

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
    }),
    [bookings, contacts, intakes, notes, settings],
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

    const { error } = await supabase.from("booking_qualifications").delete().eq("id", id);
    if (error) {
      setDashboardError(error.message);
      return;
    }

    setBookings((current) => current.filter((booking) => booking.id !== id));
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm("Delete this dashboard note?")) return;

    const { error } = await supabase.from("dashboard_notes").delete().eq("id", id);
    if (error) {
      setDashboardError(error.message);
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
