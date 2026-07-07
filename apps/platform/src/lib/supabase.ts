import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_LOOME_SUPABASE_URL as
  | string
  | undefined;
const supabaseAnonKey = import.meta.env.VITE_LOOME_SUPABASE_ANON_KEY as
  | string
  | undefined;

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  browserClient ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: typeof window !== "undefined",
      persistSession: typeof window !== "undefined",
    },
  });

  return browserClient;
}

export function hasSupabaseBrowserConfig(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
