import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createSupabaseServerClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("FATAL: Supabase environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    // Return a dummy client or handle appropriately in your app logic
    // For now, we'll try to create it anyway to avoid breaking types, 
    // but the error above is now a log instead of a crash.
    return createClient(supabaseUrl || "https://missing.supabase.co", supabaseServiceRoleKey || "missing_key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
