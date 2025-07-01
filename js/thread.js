// js/thread.js
// Connected to supabase.js and consistent with project conventions

// Helper: parse query params
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// Helper: escape HTML (for safe rendering)
function escapeHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Main rendering logic
document.addEventListener("DOMContentLoaded", async () => {
  const threadId = getQueryParam('id');
  const container = document.getElementById('thread-container');
  if (!threadId) {
    container.innerHTML = `<div class="thread-loader" style="color:#e11d48;">No thread ID provided.</div>`;
    return;
  }

  // Fetch thread/post
  const { data: post, error: postError } = await window.supabase
    .from('posts')
    .select('id, title, content, created_at, user_id')
    .eq('id', threadId)
    .single();

  if (postError || !post) {
    container.innerHTML = `<div class="thread-loader" style="color:#e11d48;">Thread not found.</div>`;
    return;
  }

  // Optionally fetch author profile
  let author = null;
  if (post.user_id) {
    const { data: authorProfile } = await window.supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', post.user_id)
      .maybeSingle();
    author = authorProfile;
  }

  // Fetch replies/comments
  const { data: replies, error: repliesError } = await window.supabase
    .from('comments')
    .select('id, content, created_at, user_id')
    .eq('post_id', threadId)
    .order('created_at', { ascending: true });

  // Optionally map user_id → username/avatar for replies
  let userMap = {};
  if (replies && replies.length) {
    const userIds = [...new Set(replies.map(r => r.user_id).filter(Boolean))];
    if (userIds.length) {
      const { data: replyAuthors } = await window.supabase
        .from('profiles')
        .select('id,username,avatar_url')
        .in('id', userIds);
      if (replyAuthors) {
        replyAuthors.forEach(u => userMap[u.id] = u);
      }
    }
  }

  // Render thread
  let html = `
    <div class="thread-post-card" style="margin-bottom:2em;">
      <h2>${escapeHTML(post.title || '(no title)')}</h2>
      <div style="color:#888;font-size:0.98em;">
        ${author && author.username ? `<img src="${escapeHTML(author.avatar_url || '')}" alt="avatar" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:0.5em;">` : ""}
        ${author && author.username ? escapeHTML(author.username) : "Anonymous"}
        &middot; ${new Date(post.created_at).toLocaleString()}
      </div>
      <div style="margin-top:1em;white-space:pre-line;">${escapeHTML(post.content || '')}</div>
    </div>
    <div class="thread-replies">
      <h3 style="margin-top:2em;">Replies</h3>
      ${replies && replies.length ? replies.map(r => `
        <div class="reply-card">
          <div style="color:#888;font-size:0.92em;">
            ${userMap[r.user_id]?.avatar_url ? `<img src="${escapeHTML(userMap[r.user_id].avatar_url)}" alt="avatar" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:0.4em;">` : ""}
            ${userMap[r.user_id]?.username ? escapeHTML(userMap[r.user_id].username) : "Anonymous"}
            &middot; ${new Date(r.created_at).toLocaleString()}
          </div>
          <div style="margin-top:0.6em;white-space:pre-line;">${escapeHTML(r.content)}</div>
        </div>
      `).join('') : `<div style="color:#888;margin-top:1em;">No replies yet.</div>`}
    </div>
    <div style="margin-top:2.5em;">
      <form id="reply-form" autocomplete="off">
        <textarea id="reply-content" placeholder="Add your reply..." style="width:100%;min-height:60px;" required></textarea>
        <button type="submit" style="margin-top:0.7em;">Post Reply</button>
        <div id="reply-error" style="color:#e11d48;margin-top:0.7em;"></div>
      </form>
    </div>
  `;
  container.innerHTML = html;

  // Reply posting logic (must be signed in)
  document.getElementById('reply-form').onsubmit = async function(e) {
    e.preventDefault();
    const content = document.getElementById('reply-content').value.trim();
    const errorDiv = document.getElementById('reply-error');
    errorDiv.textContent = "";
    if (!content) {
      errorDiv.textContent = "Reply cannot be empty.";
      return;
    }
    // Get current user
    const { data } = await window.supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) {
      errorDiv.textContent = "You must be logged in to reply.";
      return;
    }
    // Insert reply
    const { error } = await window.supabase.from('comments').insert({
      post_id: threadId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString()
    });
    if (error) {
      errorDiv.textContent = error.message || "Could not post reply.";
      return;
    }
    // Reload page to show new reply
    window.location.reload();
  };

  // Listen to auth changes (for UI or future enhancements)
  window.addEventListener('zooomAuth', e => {
    // Could reload or update UI based on sign-in/out
    // location.reload();
  });
});
