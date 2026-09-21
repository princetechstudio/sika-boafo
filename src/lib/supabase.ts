import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigError = supabaseConfigured
  ? null
  : "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the app.";

if (!supabaseConfigured) {
  console.warn(supabaseConfigError);
}

export const supabase = createClient(
  supabaseUrl ?? "https://missing-config.supabase.co",
  supabaseAnonKey ?? "missing-config",
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  },
);

export function requireSupabaseConfigured(): void {
  if (supabaseConfigError) throw new Error(supabaseConfigError);
}
