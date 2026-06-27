import { getSupabaseEnv, isSupabaseConfigured } from './supabaseConfig';

export { isSupabaseConfigured } from './supabaseConfig';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/** @type {Promise<import('@supabase/supabase-js').SupabaseClient | null> | null} */
let clientPromise = null;

/** Load the Supabase SDK and create the client. Call before any sync getSupabase(). */
export function ensureSupabaseClient() {
  if (!isSupabaseConfigured()) return Promise.resolve(null);
  if (client) return Promise.resolve(client);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      const { url, anonKey } = getSupabaseEnv();
      client = createClient(url, anonKey);
      return client;
    });
  }
  return clientPromise;
}

/** @returns {import('@supabase/supabase-js').SupabaseClient | null} */
export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!client) throw new Error('Supabase client not initialized — call ensureSupabaseClient() first');
  return client;
}
