// js/profile.js - Loads user profile and posts for Zooom

document.addEventListener("DOMContentLoaded", async () => {
  const main = document.getElementById('profile-main');
  main.innerHTML = '<div style="text-align:center;margin:3em 0;">Loading profile...</div>';

  // Get current session/user
  const { data } = await window.supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) {
    main.innerHTML = `<div style="text-align:center;margin:3em 0;color:#e11d48;">You must be logged in to view your profile.<br><a href="login.html" style="color:#2563eb;">Sign in</a></div>`;
    return;
  }

  // Fetch profile data from 'profiles' table
  let { data: profile, error } = await window.supabase
    .from('profiles')
    .select('id, username, avatar_url, bio')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !profile) {
    main.innerHTML = `<div style="text-align:center;margin:3em 0;color:#e11d48;">Could not load profile.</div>`;
    return;
  }

  // Fetch user's posts
  let { data: posts, error: postError } = await window.supabase
    .from('posts')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Render profile info
  main.innerHTML = `
    <section class="profile-card">
      <div class="profile-avatar-wrap">
        <img src="${profile.avatar_url ? profile.avatar_url : 'assets/default-avatar.png'}" alt="avatar" class="profile-avatar">
      </div>
      <div class="profile-info">
        <h2>@${profile.username || '(no username)'}</h2>
        <p class="profile-bio">${profile.bio ? escapeHTML(profile.bio) : ''}</p>
        <div style="margin-top:1.2em;">
          <a href="settings.html" class="btn-profile">Edit Profile</a>
          <a href="password-update.html" class="btn-profile">Change Password</a>
        </div>
      </div>
    </section>
    <section class="profile-posts">
      <h3 style="margin-top:2em;">Your Posts</h3>
      ${posts && posts.length ? posts.map(p => `
        <div class="profile-post-card">
          <a href="thread.html?id=${encodeURIComponent(p.id)}"><b>${p.title || '(no title)'}</b></a>
          <div style="color:#888;font-size:0.95em;">${new Date(p.created_at).toLocaleString()}</div>
        </div>
      `).join('') : `<div style="color:#888;margin-top:1em;">No posts found.</div>`}
    </section>
  `;
});

// Basic HTML escape helper
function escapeHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
