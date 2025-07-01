// Supabase client for Zooom Forum (Production)
// Project URL & anon key are set below. DO NOT expose service_role keys!
const SUPABASE_URL = 'https://kocbcrctlneqqxhxowbk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvY2JjcmN0bG5lcXF4aHhvd2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzc5MjksImV4cCI6MjA2NTk1MzkyOX0.pOL7LyfvmDAQ3IP7qzdpwyHzKaXGCJIN_t3jkx2ZoBI';

// Ensure Supabase client is loaded only once and is globally available
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
  window.supabase.auth.onAuthStateChange((event, session) => {
    // Broadcast a custom event so all pages/components can react.
    const authEvent = new CustomEvent('zooomAuth', { detail: { event, session } });
    window.dispatchEvent(authEvent);
    // Optionally, update UI globally on sign-in/out (e.g., refresh navbar, redirect, etc.)
    // Example: if (event === 'SIGNED_OUT') window.location.href = 'auth.html?tab=login';
  });
  window._zooomAuthListenerAttached = true;
}

/**
 * Helper: Redirect to login page if not authenticated.
 * Call this at the top of protected pages (e.g., post, profile edit).
 */
window.requireLogin = async function(redirectTo = 'auth.html?tab=login') {
  const { data } = await window.supabase.auth.getSession();
  if (!data?.session?.user) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
};

/**
 * Helper: Update the navbar/profile menu on auth state change.
 * Call from your main JS after navbar loads, or listen to 'zooomAuth'.
 */
window.refreshNavbarProfile = async function() {
  const profileBtn = document.getElementById('profile-btn');
  const loginBtn = document.getElementById('login-btn');
  const avatarImg = document.getElementById('profile-avatar');
  const { data } = await window.supabase.auth.getSession();
  const user = data?.session?.user;
  if (user && profileBtn && loginBtn && avatarImg) {
    profileBtn.style.display = '';
    loginBtn.style.display = 'none';
    // Optionally fetch avatar
    const { data: profile } = await window.supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    avatarImg.src = profile?.avatar_url || 'assets/default-avatar.png';
  } else if (profileBtn && loginBtn) {
    profileBtn.style.display = 'none';
    loginBtn.style.display = '';
    if (avatarImg) avatarImg.src = 'assets/default-avatar.png';
  }
};

/**
 * Helper: Get user by username (for profile pages).
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
window.getProfileByUsername = async function(username) {
  const { data, error } = await window.supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  return data || null;
};
