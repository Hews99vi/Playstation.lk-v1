import { createClient } from "@supabase/supabase-js";
import { getEnv } from "./env";

const env = getEnv();

export const supabase = env.isConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;

export const supabaseAvailability = {
  enabled: env.isConfigured,
  missingKeys: env.missing,
};
