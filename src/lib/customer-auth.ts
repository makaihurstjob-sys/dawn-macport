import { supabase } from "@/integrations/supabase/client";

type CustomerAuthState = {
  isCustomer: boolean;
  userId: string;
};

async function getCustomerProfileRole() {
  const { data, error } = await supabase.from("profiles").select("role").single();
  return { role: data?.role || "", error };
}

export async function getCustomerAuthState(): Promise<CustomerAuthState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const { role, error } = await getCustomerProfileRole();
    if (role) {
      return { isCustomer: role === "customer", userId: session.user.id };
    }
    if (!error) {
      return { isCustomer: false, userId: session.user.id };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isCustomer: false, userId: "" };
  }

  const { role } = await getCustomerProfileRole();
  return { isCustomer: role === "customer", userId: user.id };
}
