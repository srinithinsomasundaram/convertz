import { createSupabaseServerClient } from "@/lib/supabaseServer";

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export async function addSubscriber(email: string) {
  const supabase = createSupabaseServerClient();
  
  // First check if already subscribed
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { success: true, alreadySubscribed: true };
  }

  const { data, error } = await supabase
    .from("subscribers")
    .insert([{ email }])
    .select()
    .single();

  if (error) {
    console.error("Supabase newsletter error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function getAllSubscribers() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("email");

  if (error) {
    console.error("Failed to fetch subscribers:", error);
    return [];
  }

  return data.map(s => s.email);
}
