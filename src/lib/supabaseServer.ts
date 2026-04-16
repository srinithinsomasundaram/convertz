import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createSupabaseServerClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const isProd = process.env.NODE_ENV === "production";
    console.error(`[Supabase] ${isProd ? "FATAL" : "WARNING"}: Environment variables are missing. ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL is missing. " : ""}${!supabaseServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY is missing." : ""}`);
    
    // Return a dummy client or handle appropriately in your app logic
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
