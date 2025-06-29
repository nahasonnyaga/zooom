// js/thread.js

// --- Utility to get thread ID from URL ---
function getThreadId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// --- Render the thread and its replies ---
async function renderThread() {
  const threadId = getThreadId();
  if (!threadId) {
    document.getElementById('thread-container').innerHTML = "<p>Invalid thread ID.</p>";
    return;
  }

  // Fetch thread and replies from backend (Supabase)
  const { data, error } = await fetchThreadWithReplies(threadId);

  if (error || !data) {
    document.getElementById('thread-container').innerHTML = "<p>Error loading thread.</p>";
    document.getElementById('replies-list').innerHTML = "";
    return;
  }

  // Render main thread using thread-card component style
  document.getElementById('thread-container').innerHTML = `
    <div class="thread-card">
      <a href="#">
        <p>${escapeHTML(data.content)}</p>
      </a>
      <small>${formatTimestamp(data.created_at)}</small>
    </div>
    ${renderActions(data)}
  `;

  // Render replies using reply-card component
  const repliesList = document.getElementById('replies-list');
  if (!data.replies || data.replies.length === 0) {
    repliesList.innerHTML = "<p>No replies yet.</p>";
  } else {
    repliesList.innerHTML = data.replies.map(r =>
      `<div class="reply-card">
        <p>${escapeHTML(r.content)}</p>
        <small>${formatTimestamp(r.created_at)}</small>
      </div>`
    ).join('');
  }
}

// --- Helper to safely escape HTML ---
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Helper to format timestamp ---
function formatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString();
}

// --- Render thread actions using thread-actions component ---
function renderActions(thread) {
  // You can expand this to show like/retweet/bookmark counts from your backend
  return `
    <div class="thread-actions">
      <button class="action-btn like-btn" title="Like">&#10084;</button>
      <span class="like-count">${thread.like_count || ''}</span>
      <button class="action-btn retweet-btn" title="Retweet">&#128257;</button>
      <span class="retweet-count">${thread.retweet_count || ''}</span>
      <button class="action-btn bookmark-btn" title="Bookmark">&#128278;</button>
    </div>
  `;
}

// --- On DOM ready, render the thread ---
document.addEventListener('DOMContentLoaded', renderThread);

// --- Reply form handling ---
const replyForm = document.getElementById('reply-form');
if (replyForm) {
  replyForm.onsubmit = async (e) => {
    e.preventDefault();
    const threadId = getThreadId();
    const content = document.getElementById('reply-content').value.trim();
    if (!content) {
      document.getElementById('reply-error').textContent = "Reply cannot be empty.";
      return;
    }
    const { error } = await replyToThread(threadId, content);
    if (error) {
      document.getElementById('reply-error').textContent = error.message || "Failed to reply.";
      return;
    }
    document.getElementById('reply-content').value = '';
    document.getElementById('reply-error').textContent = '';
    renderThread();
  };
}

// --- Example Supabase fetch functions (customize or import as needed) ---
// Fetch a thread and its replies
async function fetchThreadWithReplies(threadId) {
  // This function should be implemented in js/supabase.js and imported here.
  // Here is a default fallback for development/demo:
  if (typeof window.supabase !== "undefined") {
    // Example using Supabase client (assumes threads and replies tables)
    const { data: thread, error: threadError } = await window.supabase
      .from('threads')
      .select('*, replies(*)')
      .eq('id', threadId)
      .single();

    if (threadError) return { data: null, error: threadError };

    // Optionally: fetch like/retweet/bookmark counts here and append to thread

    thread.replies = thread.replies || [];
    return { data: thread, error: null };
  }
  // Fallback: return demo data
  return {
    data: {
      content: "Demo thread content",
      created_at: new Date().toISOString(),
      replies: [],
    },
    error: null
  };
}

// Post a reply to a thread
async function replyToThread(threadId, content) {
  if (typeof window.supabase !== "undefined") {
    const user = window.supabase.auth.user();
    if (!user) return { error: { message: "Not logged in" } };
    const { error } = await window.supabase.from('replies').insert([
      {
        thread_id: threadId,
        content,
        user_id: user.id,
        created_at: new Date().toISOString(),
      }
    ]);
    return { error };
  }
  // Fallback: no-op
  return { error: null };
}
