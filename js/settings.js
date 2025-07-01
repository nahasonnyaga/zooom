// js/settings.js
// Ensure the settings page is functional and interconnected with supabase.js and profile

document.addEventListener('DOMContentLoaded', async () => {
  // Protect the page: require login
  if (!(await window.requireLogin('login.html'))) return;

  const form = document.getElementById('settings-form');
  const usernameInput = document.getElementById('settings-username');
  const bioInput = document.getElementById('settings-bio');
  const avatarInput = document.getElementById('settings-avatar');
  const successDiv = document.getElementById('settings-success');
  const errorDiv = document.getElementById('settings-error');

  // Load current user profile
  const profile = await window.getCurrentUserProfile();
  if (profile) {
    usernameInput.value = profile.username || '';
    bioInput.value = profile.bio || '';
    avatarInput.value = profile.avatar_url || '';
  }

  // Save settings
  form.onsubmit = async function(e) {
    e.preventDefault();
    successDiv.textContent = "";
    errorDiv.textContent = "";

    const { data } = await window.supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) {
      errorDiv.textContent = "Not authenticated. Please log in again.";
      setTimeout(() => window.location.href = "login.html", 1200);
      return;
    }

    const updates = {
      id: user.id,
      username: usernameInput.value.trim(),
      bio: bioInput.value.trim(),
      avatar_url: avatarInput.value.trim(),
      updated_at: new Date().toISOString()
    };

    // Validate username (add project-specific rules if needed)
    if (!updates.username || updates.username.length < 3) {
      errorDiv.textContent = "Username must be at least 3 characters.";
      return;
    }

    let { error } = await window.supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) {
      errorDiv.textContent = error.message;
    } else {
      successDiv.textContent = "Profile updated!";
      // Optionally refresh navbar profile/avatar
      if (window.refreshNavbarProfile) window.refreshNavbarProfile();
      setTimeout(() => successDiv.textContent = "", 2000);
    }
  };

  // If user switches account or logs out in another tab, redirect
  window.addEventListener('zooomAuth', async (e) => {
    const session = e.detail.session;
    if (!session || !session.user) window.location.href = "login.html";
  });
});
