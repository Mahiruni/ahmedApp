import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseConfig } from "./config";

let browserClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const { url, publishableKey } = getSupabaseConfig();
  const client = createBrowserClient<Database>(url, publishableKey) as SupabaseClient<Database>;
  browserClient = client;
  return client;
}
