// js/profile.js
// Loads and renders the user's profile and their posts, using window.supabase and helpers

(async function() {
  const main = document.getElementById('profile-main');
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('user');

  // Helper for HTML escaping
  function esc(s) {
    return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Get profile
  let profile, isCurrentUser = false;
  if (username) {
    // Lookup by username in URL param
    const { data, error } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    profile = data;
  } else {
    // No ?user=, show current user
    profile = await window.getCurrentUserProfile();
    isCurrentUser = true;
  }

  if (!profile) {
    main.innerHTML = `<div style="text-align:center;margin:4em 0;color:#e11d48;">User not found.</div>`;
    return;
  }

  // Show edit button only for current user viewing own profile
  if (!username) isCurrentUser = true;
  else {
    const current = await window.getCurrentUserProfile();
    if (current && current.id === profile.id) isCurrentUser = true;
  }

  // Profile header
  main.innerHTML = `
    <section class="profile-header">
      <img src="${esc(profile.avatar_url) || 'assets/avatar.png'}" class="profile-avatar" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:2.5px solid #2563eb;">
      <div class="profile-info">
        <h1>${esc(profile.display_name) || esc(profile.username)}</h1>
        <div style="color:#888;font-size:1.05em;">@${esc(profile.username)}</div>
        <div style="margin:1em 0 1.2em 0;font-size:1.07em;max-width:440px;">${esc(profile.bio) || ""}</div>
        ${isCurrentUser ? `<a href="edit-profile.html" class="compose-btn" style="font-size:0.99em;">Edit Profile</a>` : ""}
      </div>
    </section>
    <section class="profile-posts">
      <h2 style="font-size:1.23em;margin:2em 0 1em 0;">Posts</h2>
      <div id="profile-post-list">Loading...</div>
    </section>
  `;

  // Load posts by this user
  const { data: posts } = await window.supabase
    .from('posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(30);

  const postList = document.getElementById('profile-post-list');
  postList.innerHTML = posts && posts.length
    ? posts.map(post => `
        <div class="feed-post-card" style="margin-bottom:1.2em;">
          <a href="thread.html?id=${post.id}" style="text-decoration:none;">
            <div style="font-size:1.15em;line-height:1.4;"><b>${esc(post.title) || '(no title)'}</b></div>
          </a>
          <div style="color:#888;margin-top:0.4em;font-size:0.97em;">
            ${new Date(post.created_at).toLocaleString()}
          </div>
          ${post.topic ? `<div style="color:#2563eb;margin-top:0.3em;">#${esc(post.topic)}</div>` : ""}
        </div>
      `).join('')
    : `<div style="color:#888;">No posts yet.</div>`;

})();
