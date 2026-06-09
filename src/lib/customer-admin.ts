import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type InviteCustomerInput = {
  accessToken: string;
  email: string;
  fullName: string;
  courseId: string;
};

type DeleteDashboardNoteInput = {
  accessToken: string;
  noteId: string;
};

type DeleteBookingQualificationInput = {
  accessToken: string;
  bookingId: string;
};

function getPublicSiteUrl() {
  const configuredUrl = process.env.VITE_PUBLIC_SITE_URL?.trim();
  return configuredUrl || "https://anewdawncoaching.org";
}

function getSupabaseAuthClient(accessToken: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Missing Supabase URL or publishable key on the server.");
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function assertAdminOrDeveloper(accessToken: string) {
  const authClient = getSupabaseAuthClient(accessToken);
  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);

  if (userError || !userData.user) {
    throw new Error("You must be logged in before inviting customers.");
  }

  const { data: profile, error: profileError } = await authClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile || !["admin", "developer"].includes(profile.role)) {
    throw new Error("Only admin or developer accounts can invite customers.");
  }
}

export const inviteCustomerToCourse = createServerFn({ method: "POST" })
  .inputValidator((input: InviteCustomerInput) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const fullName = data.fullName.trim();

    if (!email || !fullName || !data.courseId) {
      throw new Error("Customer name, email, and course are required.");
    }

    await assertAdminOrDeveloper(data.accessToken);

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${getPublicSiteUrl().replace(/\/$/, "")}/customer-login`,
        data: {
          full_name: fullName,
          role: "customer",
        },
      },
    );

    if (inviteError) {
      throw new Error(inviteError.message);
    }

    const userId = inviteData.user?.id;
    if (!userId) {
      throw new Error("Supabase did not return a customer user id.");
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      username: email,
      full_name: fullName,
      role: "customer",
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: enrollmentError } = await supabaseAdmin.from("customer_enrollments").upsert({
      customer_id: userId,
      course_id: data.courseId,
      status: "active",
      updated_at: new Date().toISOString(),
    });

    if (enrollmentError) {
      throw new Error(enrollmentError.message);
    }

    return { userId, email, fullName };
  });

export const deleteDashboardNote = createServerFn({ method: "POST" })
  .inputValidator((input: DeleteDashboardNoteInput) => input)
  .handler(async ({ data }) => {
    if (!data.noteId) {
      throw new Error("A dashboard note id is required.");
    }

    await assertAdminOrDeveloper(data.accessToken);

    const { error } = await supabaseAdmin.from("dashboard_notes").delete().eq("id", data.noteId);
    if (error) {
      throw new Error(error.message);
    }

    return { deleted: true };
  });

export const deleteBookingQualification = createServerFn({ method: "POST" })
  .inputValidator((input: DeleteBookingQualificationInput) => input)
  .handler(async ({ data }) => {
    if (!data.bookingId) {
      throw new Error("A booking quiz entry id is required.");
    }

    await assertAdminOrDeveloper(data.accessToken);

    const { error } = await supabaseAdmin
      .from("booking_qualifications")
      .delete()
      .eq("id", data.bookingId);
    if (error) {
      throw new Error(error.message);
    }

    return { deleted: true };
  });
