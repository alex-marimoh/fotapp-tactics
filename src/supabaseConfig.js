const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** @returns {boolean} */
export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/** @returns {{ url: string, anonKey: string }} */
export function getSupabaseEnv() {
  return { url, anonKey };
}
