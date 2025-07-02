// js/feed.js - Feed logic for Zooom, loads main feed from Supabase

document.addEventListener("DOMContentLoaded", async () => {
  const feedList = document.getElementById('feed-list');
  if (!feedList) return;
  feedList.innerHTML = "Loading...";

  // Get posts with author info
  let { data: posts, error } = await window.supabase
    .from('posts')
    .select('id, title, created_at, user_id')
    .order('created_at', { ascending: false });

  if (error) {
    feedList.innerHTML = `<div style="color:#e11d48;">Failed to load posts: ${error.message}</div>`;
    return;
  }

  // Optionally fetch user profiles for each user_id (if you wish to show avatars/usernames in feed)
  let userMap = {};
  if (posts && posts.length) {
    const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];
    if (userIds.length) {
      const { data: profiles } = await window.supabase
        .from('profiles')
        .select('id,username,avatar_url')
        .in('id', userIds);
      if (profiles) profiles.forEach(u => userMap[u.id] = u);
    }
    feedList.innerHTML = posts.map(p => `
      <div class='feed-post-card' style="margin-bottom:1em;">
        <a href="thread.html?id=${encodeURIComponent(p.id)}"><b>${p.title || '(no title)'}</b></a><br>
        <span style="color:#888;">
          ${userMap[p.user_id]?.avatar_url ? `<img src="${userMap[p.user_id].avatar_url}" alt="avatar" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:0.4em;">` : ''}
          ${userMap[p.user_id]?.username || "Anonymous"}
          &middot; ${new Date(p.created_at).toLocaleString()}
        </span>
      </div>
    `).join('');
  } else {
    feedList.innerHTML = '<div style="color:#888;">No posts found.</div>';
  }
});

// Listen for auth state changes for UI refresh (if needed)
window.addEventListener('zooomAuth', e => {
  if(window.refreshNavbarProfile) window.refreshNavbarProfile();
  // Optionally reload feed if sign in/out affects post visibility
  // location.reload();
});
