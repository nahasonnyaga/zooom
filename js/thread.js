// js/thread.js
// Interconnected, modern Thread page for Zooom

async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

// Utility to escape HTML (for user-generated content)
function escapeHTML(str) {
  return str?.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleString();
}

async function renderThread() {
  const container = document.getElementById("thread-container");
  const params = new URLSearchParams(location.search);
  const threadId = params.get("id");
  if (!threadId) {
    container.innerHTML = `<div class="profile-empty" style="margin:3em auto;text-align:center;">Thread not found.</div>`;
    return;
  }

  // Fetch post
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles:profiles!posts_user_id_fkey(display_name,username,avatar_url,id)")
    .eq("id", threadId)
    .single();

  if (error || !post) {
    container.innerHTML = `<div class="profile-empty" style="margin:3em auto;text-align:center;">Thread not found or removed.</div>`;
    return;
  }

  // Render main thread
  container.innerHTML = `
    <div class="feed-post-card" style="margin-bottom:1.3em;box-shadow:0 1px 12px #2563eb07;">
      <div style="display:flex;align-items:center;gap:0.8em;margin-bottom:0.7em;">
        <a href="profile.html?user=${encodeURIComponent(post.profiles?.username||'')}" style="text-decoration:none;">
          <img src="${post.profiles?.avatar_url || 'assets/avatar.png'}" alt="Avatar" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:1.5px solid #dbeafe;">
        </a>
        <div>
          <div style="font-weight:700;font-size:1.1em;color:#222;">${escapeHTML(post.profiles?.display_name||post.profiles?.username||'Unknown')}</div>
          <div style="color:#2563eb;font-size:0.98em;">@${escapeHTML(post.profiles?.username||'')}</div>
        </div>
      </div>
      <div style="font-size:1.15em;margin-bottom:0.7em;">${escapeHTML(post.body)}</div>
      ${post.media_url ? `<img src="${post.media_url}" style="max-width:92%;border-radius:15px;margin-bottom:0.4em;">` : ""}
      <div style="color:#888;font-size:0.98em;">
        ${post.topic ? `#${escapeHTML(post.topic)}` : ""} 
        <span style="float:right;">${formatDate(post.created_at)}</span>
      </div>
    </div>
    <section id="replies-section">
      <div style="font-weight:700;font-size:1.09em;margin:1.2em 0 0.5em 0;color:#2563eb;">Replies</div>
      <div id="replies-list"></div>
      <div id="reply-form-container"></div>
    </section>
  `;

  // Render replies
  renderReplies(threadId);

  // Render reply form if logged in
  const user = await getSessionUser();
  const formContainer = document.getElementById('reply-form-container');
  if (user) {
    // Fetch own profile
    const { data: profile } = await supabase.from('profiles').select('avatar_url,username,display_name').eq('id', user.id).single();
    formContainer.innerHTML = `
      <form id="reply-form" style="margin:1em 0 2em 0;padding:1em 0;border-top:1px solid #e3eafb;">
        <div style="display:flex;align-items:flex-start;gap:0.7em;">
          <img src="${profile?.avatar_url||'assets/avatar.png'}" alt="Me" style="width:36px;height:36px;border-radius:50%;object-fit:cover;margin-top:2px;">
          <textarea id="reply-content" placeholder="Write a reply..." maxlength="400" required style="flex:1;border-radius:12px;border:1.2px solid #cce;padding:0.95em 1em;font-size:1.08em;background:#f7faff;resize:vertical;"></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.7em;margin-top:0.7em;">
          <button type="submit" class="reply-btn" style="background:linear-gradient(90deg,#2563eb 65%,#60a5fa 100%);color:#fff;font-weight:700;border-radius:13px;border:none;padding:0.55em 1.45em;font-size:1em;box-shadow:0 1px 7px #2563eb12;">Reply</button>
        </div>
        <div id="reply-error" style="color:#e11d48;font-size:0.97em;text-align:right;min-height:1.1em;margin-top:0.4em;"></div>
      </form>
    `;
    document.getElementById('reply-form').onsubmit = async function(e) {
      e.preventDefault();
      const content = document.getElementById('reply-content').value.trim();
      const errorDiv = document.getElementById('reply-error');
      errorDiv.textContent = "";
      if (!content) {
        errorDiv.textContent = "Reply cannot be empty.";
        return;
      }
      const btn = this.querySelector("button[type='submit']");
      btn.disabled = true;
      // Insert reply
      let { error } = await supabase.from('replies').insert({
        post_id: threadId,
        user_id: user.id,
        body: content
      });
      if (error) {
        errorDiv.textContent = "Failed to reply. Try again.";
        btn.disabled = false;
        return;
      }
      document.getElementById('reply-content').value = "";
      btn.disabled = false;
      renderReplies(threadId); // refresh replies
    };
  } else {
    formContainer.innerHTML = `<div style="margin:1.7em 0 2em 0;text-align:center;"><a href="auth.html?tab=login" class="login-btn" style="background:linear-gradient(90deg,#2563eb 65%,#60a5fa 100%);color:#fff;border:none;border-radius:13px;font-weight:700;font-size:1em;padding:0.55em 1.8em;box-shadow:0 1px 8px #2563eb13;text-decoration:none;display:inline-block;">Log in to reply</a></div>`;
  }
}

async function renderReplies(threadId) {
  const repliesList = document.getElementById("replies-list");
  if (!repliesList) return;
  repliesList.innerHTML = `<div style="text-align:center;color:#2563eb;margin:1em 0;">Loading replies...</div>`;
  const { data: replies } = await supabase
    .from("replies")
    .select("*, profiles:profiles!replies_user_id_fkey(display_name,username,avatar_url,id)")
    .eq("post_id", threadId)
    .order("created_at", { ascending: true })
    .limit(50);
  if (!replies || !replies.length) {
    repliesList.innerHTML = `<div style="text-align:center;color:#888;margin:1.2em 0;">No replies yet.</div>`;
    return;
  }
  repliesList.innerHTML = replies
    .map(
      (r) => `
      <div class="reply-card" style="margin-bottom:1.1em;background:#f8fbff;border-radius:14px;padding:0.92em 1em;box-shadow:0 1px 7px #2563eb0a;">
        <div style="display:flex;align-items:center;gap:0.7em;">
          <a href="profile.html?user=${encodeURIComponent(r.profiles?.username||'')}" style="text-decoration:none;">
            <img src="${r.profiles?.avatar_url||'assets/avatar.png'}" alt="Avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid #dbeafe;">
          </a>
          <div>
            <span style="font-weight:600;font-size:1.03em;color:#2563eb;">${escapeHTML(r.profiles?.display_name||r.profiles?.username||'')}</span>
            <span style="color:#888;font-size:0.98em;">@${escapeHTML(r.profiles?.username||'')}</span>
            <span style="color:#aaa;font-size:0.93em;margin-left:0.6em;">${formatDate(r.created_at)}</span>
          </div>
        </div>
        <div style="margin-top:0.5em;font-size:1.09em;">${escapeHTML(r.body)}</div>
      </div>
    `
    )
    .join("");
}

// On page load
document.addEventListener("DOMContentLoaded", renderThread);
