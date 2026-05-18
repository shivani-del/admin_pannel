import { supabase } from "@/integrations/supabase/client";
import type { CreateUserInput, UpdateUserInput } from "./schema";

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  projects: string[];
  budgets: string[];
  created_at: string;
}

export async function listUsers(params: { search?: string; page: number; pageSize: number }) {
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let q = supabase
    .from("profiles")
    .select("id, full_name, email, mobile, projects, budgets, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const search = params.search?.trim();
  if (search) {
    q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,mobile.ilike.%${search}%`);
  }

  const { data, error, count } = await q;
  if (error) throw error;
  return { rows: (data ?? []) as UserRow[], total: count ?? 0 };
}

// NOTE: Creating an auth user from the browser uses signUp, which signs the
// new user in. To avoid clobbering the admin's session, we sign the admin
// back in via the existing session token after creation. For production, move
// this to a server function using the service-role key.
export async function createUser(input: CreateUserInput) {
  const { data: sessionData } = await supabase.auth.getSession();
  const adminSession = sessionData.session;

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: { full_name: input.full_name, mobile: input.mobile },
    },
  });
  if (error) throw error;
  const newId = data.user?.id;
  if (!newId) throw new Error("User creation failed");

  // Restore admin session
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  // Update profile with the rest of the fields (trigger created the row)
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      mobile: input.mobile,
      projects: input.projects,
      budgets: input.budgets,
      secure_pin_hash: input.secure_pin, // NOTE: hash server-side in production
    })
    .eq("id", newId);
  if (profileErr) throw profileErr;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const patch = {
    full_name: input.full_name,
    email: input.email,
    mobile: input.mobile,
    projects: input.projects,
    budgets: input.budgets,
    ...(input.secure_pin ? { secure_pin_hash: input.secure_pin } : {}),
  };

  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteUser(id: string) {
  // Removes the profile row only. Auth user removal requires service-role
  // and should be done via a server function in production.
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
}
