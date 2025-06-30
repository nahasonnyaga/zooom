import { supabase } from './supabase.js';

// Utility: Render a card
function renderCard(title, content) {
  return `<div class="feed-card"><h3>${title}</h3><div>${content}</div></div>`;
}

// 1. New Users
async function loadNewUsers() {
  const el = document.getElementById('new-users');
  el.innerHTML = "<h2>🆕 New Users</h2>";
  // TODO: Replace with your Supabase query for new users
  let { data, error } = await supabase
    .from('profiles')
    .select('username,avatar_url,created_at')
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) { el.innerHTML += "Error loading users."; return; }
  el.innerHTML += (data.length === 0) ? `<p>No new users yet.</p>`
    : `<div class="feed-row">` +
      data.map(u => `<div class="mini-user">
        <img src="${u.avatar_url||'assets/avatar.png'}" alt="${u.username}" />
        <span>@${u.username}</span>
      </div>`).join('') + `</div>`;
}

// 2. Trending Keywords
async function loadTrendingKeywords() {
  const el = document.getElementById('trending-keywords');
  el.innerHTML = "<h2>🔥 Trending Keywords</h2>";
  // TODO: Replace with your Supabase query for trending keywords/terms
  // Example placeholder:
  el.innerHTML += `<ul class="trend-list"><li>supabase</li><li>webdev</li><li>forum</li></ul>`;
}

// 3. Trending Hashtags
async function loadTrendingHashtags() {
  const el = document.getElementById('trending-hashtags');
  el.innerHTML = "<h2># Trending Hashtags</h2>";
  // TODO: Replace with your Supabase query for trending hashtags
  el.innerHTML += `<ul class="trend-list"><li>#supabase</li><li>#ai</li><li>#opensource</li></ul>`;
}

// 4. Mentions
async function loadMentions() {
  const el = document.getElementById('mentions');
  el.innerHTML = "<h2>@ Mentions</h2>";
  // TODO: Replace with your Supabase logic for user's mentions
  el.innerHTML += `<p>No recent mentions.</p>`;
}

// 5. Reposts
async function loadReposts() {
  const el = document.getElementById('reposts');
  el.innerHTML = "<h2>🔁 Reposts</h2>";
  // TODO: Replace with your Supabase logic for reposted threads
  el.innerHTML += `<p>No reposts yet.</p>`;
}

// 6. Latest Content
async function loadLatestContent() {
  const el = document.getElementById('latest-content');
  el.innerHTML = "<h2>🕒 Latest Content</h2>";
  // TODO: Replace with your Supabase query for latest threads/posts
  el.innerHTML += `<p>No content yet.</p>`;
}

// 7. Following
async function loadFollowing() {
  const el = document.getElementById('following');
  el.innerHTML = "<h2>👥 Users You Follow</h2>";
  // TODO: Replace with your Supabase logic for followed users' content
  el.innerHTML += `<p>You aren't following anyone yet.</p>`;
}

// 8. Tagged You
async function loadTagged() {
  const el = document.getElementById('tagged');
  el.innerHTML = "<h2>🏷️ Tagged You</h2>";
  // TODO: Replace with your Supabase logic for posts where you're tagged
  el.innerHTML += `<p>No tags yet.</p>`;
}

// On load, populate all sections
document.addEventListener("DOMContentLoaded", () => {
  loadNewUsers();
  loadTrendingKeywords();
  loadTrendingHashtags();
  loadMentions();
  loadReposts();
  loadLatestContent();
  loadFollowing();
  loadTagged();
});
