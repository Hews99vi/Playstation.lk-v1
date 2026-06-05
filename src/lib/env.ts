export type AppEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
  missing: string[];
};

export const getEnv = (): AppEnv => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

  const missing: string[] = [];

  if (!supabaseUrl) {
    missing.push("VITE_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    missing.push("VITE_SUPABASE_ANON_KEY");
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured: missing.length === 0,
    missing,
  };
};
