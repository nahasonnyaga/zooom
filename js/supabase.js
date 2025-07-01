// Supabase client for Zooom Forum (Production)
// Project URL & anon key are set below. DO NOT expose service_role keys!
const SUPABASE_URL = 'https://kocbcrctlneqqxhxowbk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvY2JjcmN0bG5lcXF4aHhvd2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzc5MjksImV4cCI6MjA2NTk1MzkyOX0.pOL7LyfvmDAQ3IP7qzdpwyHzKaXGCJIN_t3jkx2ZoBI';

// Ensure Supabase client is loaded only once
if (!window.supabase) {
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

/**
 * Returns the current user's profile (from 'profiles' table) or null if not logged in.
 * @returns {Promise<Object|null>}
 */
window.getCurrentUserProfile = async function() {
  const { data } = await window.supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return null;
  const { data: profile } = await window.supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return profile || null;
};

/**
 * Returns current session user (auth) or null.
 * @returns {Promise<Object|null>}
 */
window.getCurrentUser = async function() {
  const { data } = await window.supabase.auth.getSession();
  return data?.session?.user || null;
};

/**
 * Listen for auth state changes and broadcast to all pages/components
 * Usage: addEventListener('zooomAuth', (e) => { ... });
 */
if (!window._zooomAuthListenerAttached) {
  supabase.auth.onAuthStateChange((event, session) => {
    const authEvent = new CustomEvent('zooomAuth', { detail: { event, session } });
    window.dispatchEvent(authEvent);
  });
  window._zooomAuthListenerAttached = true;
}
