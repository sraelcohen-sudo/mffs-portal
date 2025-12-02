import { createClient } from "@supabase/supabase-js";

let client = null;

export function createSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return null;
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
    },
  });

  return client;
}
