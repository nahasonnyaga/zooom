// js/thread.js: Interconnected with Supabase, auth, and consistent UI

// Parse thread id from URL (?id=...)
function getThreadId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

async function loadThread() {
  const threadId = getThreadId();
  const container = document.getElementById('thread-container');
  if (!threadId) {
    container.innerHTML = `<div class="reply-card" style="text-align:center;">Invalid thread.</div>`;
    return;
  }

  // Fetch thread (post)
  let { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles:profiles!posts_user_id_fkey(display_name,username,avatar_url)')
    .eq('id', threadId)
    .single();

  if (error || !post) {
    container.innerHTML = `<div class="reply-card" style="text-align:center;">Thread not found.</div>`;
    return;
  }

  // Fetch replies
  let { data: replies } = await supabase
    .from('replies')
    .select('*, profiles:profiles!replies_user_id_fkey(display_name,username,avatar_url)')
    .eq('post_id', threadId)
    .order('created_at', { ascending: true });

  // Build main thread card
  const threadHtml = `
    <div class="reply-card thread-main">
      <div class="reply-avatar">
        <img src="${post.profiles?.avatar_url || 'assets/default-avatar.png'}" alt="Avatar"/>
      </div>
      <div class="reply-body">
        <div class="reply-header">
          <span class="reply-author">${post.profiles?.display_name || "User"}</span>
          <span class="reply-username">@${post.profiles?.username || "unknown"}</span>
          <span class="reply-time">${new Date(post.created_at).toLocaleString()}</span>
        </div>
        <div class="reply-content">${post.body || ""}</div>
        <div class="reply-footer">
          <span class="reply-topic">${post.topic ? `#${post.topic}` : ""}</span>
        </div>
      </div>
    </div>
    <div class="replies-list">
      <h3 class="mt-4 mb-1 text-lg font-bold">Replies</h3>
      ${replies && replies.length ? replies.map(reply => `
        <div class="reply-card">
          <div class="reply-avatar">
            <img src="${reply.profiles?.avatar_url || 'assets/default-avatar.png'}" alt="Avatar"/>
          </div>
          <div class="reply-body">
            <div class="reply-header">
              <span class="reply-author">${reply.profiles?.display_name || "User"}</span>
              <span class="reply-username">@${reply.profiles?.username || "unknown"}</span>
              <span class="reply-time">${new Date(reply.created_at).toLocaleString()}</span>
            </div>
            <div class="reply-content">${reply.body || ""}</div>
          </div>
        </div>
      `).join('') : `<div class="reply-card" style="text-align:center;">No replies yet.</div>`}
    </div>
    ${await replyFormHtml(threadId)}
  `;

  container.innerHTML = threadHtml;

  // Add event for reply form if logged in
  addReplyFormHandler(threadId);
}

async function replyFormHtml(threadId) {
  const user = await getSessionUser();
  if (!user) {
    return `<div class="reply-card" style="text-align:center;">
      <a href="auth.html?tab=login">Log in</a> to reply.
    </div>`;
  }
  return `
    <form id="reply-form" class="reply-card mt-2">
      <textarea id="reply-body" class="w-full rounded p-2" rows="3" maxlength="800" required placeholder="Write a reply..."></textarea>
      <button type="submit" class="mt-2 btn btn-primary">Reply</button>
      <div id="reply-error" class="text-red-500 mt-1"></div>
    </form>
  `;
}

function addReplyFormHandler(threadId) {
  const form = document.getElementById('reply-form');
  if (!form) return;
  form.onsubmit = async e => {
    e.preventDefault();
    const textarea = document.getElementById('reply-body');
    const errorDiv = document.getElementById('reply-error');
    errorDiv.textContent = "";
    const body = textarea.value.trim();
    if (!body) {
      errorDiv.textContent = "Reply cannot be empty.";
      return;
    }
    const user = await getSessionUser();
    if (!user) {
      window.location.href = "auth.html?tab=login";
      return;
    }
    // Insert reply
    const { error } = await supabase.from('replies').insert([
      {
        body,
        user_id: user.id,
        post_id: threadId,
      }
    ]);
    if (error) {
      errorDiv.textContent = "Failed to send reply.";
    } else {
      textarea.value = "";
      // Reload thread and replies
      loadThread();
    }
  };
}

// On page load
document.addEventListener('DOMContentLoaded', loadThread);
