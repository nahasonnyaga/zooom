// js/utils.js
// Shared utilities for Zooom app

// Example: Listen for auth events and propagate them
window.supabase?.auth.onAuthStateChange((event, session) => {
  const evt = new CustomEvent('zooomAuth', { detail: { event, session } });
  window.dispatchEvent(evt);
});

// Example: Helper to require login and redirect
window.requireLogin = async function(redirect = "login.html") {
  const { data } = await window.supabase.auth.getSession();
  if (!data?.session?.user) {
    window.location.href = redirect;
    return false;
  }
  return true;
};

// Example: Get current user profile (returns null if not available)
window.getCurrentUserProfile = async function() {
  const { data } = await window.supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return null;
  const { data: profile } = await window.supabase
    .from('profiles')
    .select('id, username, avatar_url, bio')
    .eq('id', user.id)
    .maybeSingle();
  return profile;
};

// Example: Refresh navbar profile/avatar (optional, to be used in navbar.html if needed)
window.refreshNavbarProfile = async function() {
  // Implement as needed in your navbar.html to update avatar, username, etc.
};
