// js/thread.js
// This script loads a thread (post and its replies) and displays them in thread.html

(async function() {
  const container = document.getElementById('thread-container');
  const urlParams = new URLSearchParams(window.location.search);
  const threadId = urlParams.get('id');
  if (!threadId) {
    container.innerHTML = `<div class="thread-loader" style="color:#e11d48;">Thread not found.</div>`;
    return;
  }

  // Fetch thread (post)
  const { data: post, error: postError } = await window.supabase
    .from('posts')
    .select('*, profiles:profiles!posts_user_id_fkey(username, display_name, avatar_url)')
    .eq('id', threadId)
    .single();

  if (!post || postError) {
    container.innerHTML = `<div class="thread-loader" style="color:#e11d48;">Thread not found.</div>`;
    return;
  }

  // Fetch replies
  const { data: replies } = await window.supabase
    .from('replies')
    .select('*, profiles:profiles!replies_user_id_fkey(username, display_name, avatar_url)')
    .eq('post_id', threadId)
    .order('created_at', { ascending: true });

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }

  // Render thread post
  let threadHtml = `
    <section class="feed-post-card" style="margin-bottom:1.8em;">
      <div style="display:flex;align-items:center;gap:0.9em;">
        <img src="${post.profiles?.avatar_url || 'assets/avatar.png'}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">
        <div>
          <b>${escapeHTML(post.profiles?.display_name || post.profiles?.username || "User")}</b>
          <span style="color:#888;font-size:0.96em;">@${escapeHTML(post.profiles?.username || "user")}</span>
        </div>
      </div>
      <div style="margin-top:1em;padding-left:0.1em;">
        <div style="font-size:1.14em;line-height:1.5;margin-bottom:0.6em;">
          ${escapeHTML(post.body)}
        </div>
        ${post.media_url ? `<img src="${post.media_url}" style="max-width:98%;border-radius:16px;margin-top:0.8em;">` : ""}
        <div style="color:#667;font-size:0.95em;margin-top:0.9em;">${new Date(post.created_at).toLocaleString()}</div>
        ${post.topic ? `<div style="margin-top:0.4em;color:#2563eb;font-weight:600;">#${escapeHTML(post.topic)}</div>` : ""}
      </div>
    </section>
  `;

  // Render replies
  threadHtml += `<section><h3 style="margin:1.2em 0 1.1em 0;font-size:1.14em;">Replies</h3>`;
  if (!replies || replies.length === 0) {
    threadHtml += `<div style="color:#888;margin:2em 0;">No replies yet.</div>`;
  } else {
    threadHtml += replies.map(reply => `
      <div class="reply-card" style="margin-bottom:1.4em;">
        <div style="display:flex;align-items:center;gap:0.7em;">
          <img src="${reply.profiles?.avatar_url || 'assets/avatar.png'}" style="width:38px;height:38px;border-radius:50%;">
          <div>
            <b>${escapeHTML(reply.profiles?.display_name || reply.profiles?.username || "User")}</b>
            <span style="color:#888;font-size:0.94em;">@${escapeHTML(reply.profiles?.username || "user")}</span>
          </div>
        </div>
        <div style="margin:0.5em 0 0.3em 2.2em;line-height:1.6;font-size:1.07em;">
          ${escapeHTML(reply.body)}
        </div>
        <div style="color:#889;font-size:0.92em;margin-left:2.2em;">${new Date(reply.created_at).toLocaleString()}</div>
      </div>
    `).join('');
  }
  threadHtml += `</section>`;

  // Add reply form if signed in
  const user = await window.getCurrentUser();
  if (user) {
    threadHtml += `
      <section style="margin-top:2.4em;">
        <form id="reply-form" autocomplete="off" style="display:flex;flex-direction:column;gap:1em;">
          <textarea id="reply-body" required placeholder="Write a reply..." maxlength="400" style="min-height:60px;border-radius:12px;border:1.2px solid #cdd6e1;font-size:1.09em;padding:0.7em;"></textarea>
          <button type="submit" style="align-self:flex-end;padding:0.6em 2em;border-radius:12px;background:linear-gradient(90deg,#2563eb 70%,#60a5fa 100%);color:#fff;font-weight:700;font-size:1em;">Reply</button>
          <div id="reply-error" style="color:#e11d48;text-align:right;"></div>
        </form>
      </section>
    `;
  } else {
    threadHtml += `
      <section style="margin-top:2.4em;">
        <div style="text-align:center;background:#f5faff;border-radius:12px;padding:1.3em 1em;">
          <b>Sign in to reply</b><br>
          <a href="login.html" style="color:#2563eb;font-weight:600;text-decoration:underline;">Sign In</a>
        </div>
      </section>
    `;
  }

  container.innerHTML = threadHtml;
  if (window.lucide) lucide.createIcons();

  // Add reply handler if signed in
  if (user) {
    document.getElementById('reply-form').onsubmit = async function(e) {
      e.preventDefault();
      const body = document.getElementById('reply-body').value.trim();
      if (!body) return;
      document.getElementById('reply-error').textContent = "";
      const { error } = await window.supabase.from('replies').insert([{
        post_id: threadId,
        user_id: user.id,
        body
      }]);
      if (error) {
        document.getElementById('reply-error').textContent = error.message;
      } else {
        window.location.reload();
      }
    };
  }
})();
