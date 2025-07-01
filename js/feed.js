// js/feed.js - Section loader and UX for main feeds, interconnected with Supabase

window.renderXSection = async function(section, feed) {
  // Helper: get session user
  async function getSessionUser() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user || null;
  }

  // Clear and show loader
  feed.innerHTML = '<div class="loader"></div>';
  let sessionUser = await getSessionUser();

  // Section handlers
  if (section === 'for-you') {
    // Personalized feed (latest and recommended)
    const { data: posts, error } = await supabase.from('posts')
      .select('id,title,body,created_at,topic,media_url,user_id')
      .order('created_at', { ascending: false }).limit(15);
    if (error || !posts?.length) {
      feed.innerHTML = `<div class="profile-empty" style="margin:2em 0;text-align:center;">No posts found.</div>`;
      return;
    }
    feed.innerHTML = posts.map(p => renderFeedCard(p)).join('');
  }
  else if (section === 'following') {
    if (!sessionUser) {
      feed.innerHTML = `<div class="profile-empty" style="text-align:center;margin:2em 0;">Log in to see posts from users you follow.</div>`;
      return;
    }
    // Get following IDs
    const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', sessionUser.id);
    const followingIds = (following||[]).map(f=>f.following_id);
    if (!followingIds.length) {
      feed.innerHTML = `<div class="profile-empty" style="text-align:center;margin:2em 0;">You're not following anyone yet.</div>`;
      return;
    }
    // Posts from followed users
    const { data: posts } = await supabase.from('posts')
      .select('id,title,body,created_at,topic,media_url,user_id')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false }).limit(15);
    feed.innerHTML = posts?.length ? posts.map(p => renderFeedCard(p)).join('') : `<div class="profile-empty" style="text-align:center;margin:2em 0;">No posts found from users you follow.</div>`;
  }
  else if (section === 'mentions') {
    if (!sessionUser) {
      feed.innerHTML = `<div class="profile-empty" style="text-align:center;margin:2em 0;">Log in to see mentions.</div>`;
      return;
    }
    // Find posts where @username mentioned
    const username = sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0];
    const { data: posts } = await supabase.from('posts')
      .select('id,title,body,created_at,media_url,topic,user_id')
      .ilike('body', `%@${username}%`).order('created_at', { ascending: false }).limit(15);
    feed.innerHTML = posts?.length ? posts.map(p => renderFeedCard(p)).join('') : `<div class="profile-empty" style="text-align:center;margin:2em 0;">No mentions found.</div>`;
  }
  else if (section === 'hashtags') {
    // Hashtag search UI
    feed.innerHTML = `
      <form id="hashtag-search-form" style="margin:2em 0 1.2em 0;text-align:center;">
        <input type="text" id="hashtag-input" placeholder="Search hashtag..." style="padding:0.6em 1em;border-radius:16px;border:1px solid #cdd6e1;font-size:1.1em;width:60%;max-width:320px;">
        <button class="x-tab" type="submit" style="margin-left:0.5em;padding:0.58em 1.3em;font-size:0.99em;">Search</button>
      </form>
      <div id="hashtags-feed"></div>
    `;
    document.getElementById('hashtag-search-form').onsubmit = async function(e) {
      e.preventDefault();
      const tag = document.getElementById('hashtag-input').value.trim().replace(/^#/, '');
      if (!tag) return;
      const { data: posts } = await supabase.from('posts')
        .select('id,title,body,created_at,topic,media_url,user_id')
        .eq('topic', tag)
        .order('created_at',{ascending:false}).limit(15);
      document.getElementById('hashtags-feed').innerHTML =
        posts?.length ? posts.map(p => renderFeedCard(p)).join('') : `<div class="profile-empty" style="margin:2em 0;">No posts found with #${tag}.</div>`;
    };
  }
  else if (section === 'trending') {
    // Trending topics
    const { data: trends } = await supabase.from('trends').select('*').order('rank');
    feed.innerHTML = `<div style="margin:2em auto;max-width:400px;">${
      trends && trends.length
      ? trends.map(trend =>
          `<div style="margin-bottom:1.1em;"><b>#${trend.topic}</b> <span style="color:#888;">${trend.post_count} posts</span></div>`
        ).join('')
      : `<div class="profile-empty" style="text-align:center;">No trending topics.</div>`
    }</div>`;
  }
  else if (section === 'new-users') {
    // New users
    const { data: users } = await supabase.from('profiles')
      .select('id,display_name,username,avatar_url')
      .order('created_at', { ascending: false })
      .limit(12);
    feed.innerHTML =
      users?.length
        ? users.map(u=>`
        <div style="display:flex;align-items:center;gap:0.9em;margin-bottom:1em;">
          <img src="${u.avatar_url||'assets/avatar.png'}" style="width:40px;height:40px;border-radius:50%;border:1.5px solid #cce;object-fit:cover;">
          <a href="profile.html?user=${encodeURIComponent(u.username)}"><b>${u.display_name||u.username}</b></a>
          <span style="color:#888;font-size:0.97em;">@${u.username}</span>
        </div>
        `).join('')
        : `<div class="profile-empty" style="margin:2em 0;">No new users found.</div>`;
  }
  else if (section === 'notifications') {
    // Notifications (stub)
    feed.innerHTML = sessionUser
      ? `<div class="profile-empty" style="text-align:center;margin:2em 0;">No notifications yet. (Integration needed)</div>`
      : `<div class="profile-empty" style="text-align:center;margin:2em 0;">Log in to see notifications.</div>`;
  }
  else if (section === 'media') {
    // Media posts
    const { data: posts } = await supabase.from('posts')
      .select('id,title,body,created_at,media_url,user_id,topic')
      .not('media_url','is',null)
      .order('created_at',{ascending:false})
      .limit(15);
    feed.innerHTML =
      posts?.length
        ? posts.map(p => renderFeedCard(p)).join('')
        : `<div class="profile-empty" style="margin:2em 0;">No media posts found.</div>`;
  }
  else {
    // Unknown section
    feed.innerHTML = `<div class="profile-empty" style="margin:2em 0;text-align:center;">Section not found.</div>`;
  }
};

// Feed card renderer
function renderFeedCard(post) {
  return `
    <div class="feed-post-card" style="margin-bottom:1.05em;">
      <a href="thread.html?id=${post.id}"><b>${post.title || '(no title)'}</b></a>
      <div>${(post.body || '').substring(0, 120)}</div>
      ${post.media_url ? `<img src="${post.media_url}" style="max-width:96%;margin-top:0.6em;border-radius:13px;">` : ''}
      <div style="color:#666;font-size:0.95em;">
        ${post.topic ? '#' + post.topic : ''}
        <span style="float:right;">${new Date(post.created_at).toLocaleString()}</span>
      </div>
    </div>
  `;
}
