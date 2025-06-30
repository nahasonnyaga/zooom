import { supabase, getUser } from './supabase.js';

function getThreadId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchThread(threadId) {
  const { data: thread, error } = await supabase
    .from('threads')
    .select('*, replies(*)')
    .eq('id', threadId)
    .single();
  return { thread, error };
}

async function renderThread() {
  const threadId = getThreadId();
  if (!threadId) {
    document.getElementById('thread-container').innerHTML = "<p>Invalid thread ID.</p>";
    return;
  }
  const { thread, error } = await fetchThread(threadId);
  if (error || !thread) {
    document.getElementById('thread-container').innerHTML = "<p>Error loading thread.</p>";
    return;
  }
  const tpl = await fetch('components/thread-card.html').then(r=>r.text());
  let html = tpl;
  html = html.replaceAll('<!-- content -->', thread.content);
  html = html.replaceAll('<!-- date -->', new Date(thread.created_at).toLocaleString());
  html = html.replaceAll('<!-- thread-id -->', thread.id);
  document.getElementById('thread-container').innerHTML = html;
  // Render replies
  const repliesList = document.getElementById('replies-list');
  const repliesTpl = await fetch('components/reply-card.html').then(r=>r.text());
  if (!thread.replies || thread.replies.length === 0) {
    repliesList.innerHTML = "<p>No replies yet.</p>";
  } else {
    repliesList.innerHTML = thread.replies.map(r => {
      let replyHtml = repliesTpl;
      replyHtml = replyHtml.replaceAll('<!-- content -->', r.content);
      replyHtml = replyHtml.replaceAll('<!-- date -->', new Date(r.created_at).toLocaleString());
      return replyHtml;
    }).join('');
  }
}

async function replyToThread(threadId, content) {
  const user = await getUser();
  if (!user) return { error: { message: "Not logged in" } };
  const { error } = await supabase.from('replies').insert([
    { thread_id: threadId, content, user_id: user.id, created_at: new Date().toISOString() }
  ]);
  return { error };
}

function setupReplyForm() {
  const replyForm = document.getElementById('reply-form');
  if (replyForm) {
    replyForm.onsubmit = async (e) => {
      e.preventDefault();
      const threadId = getThreadId();
      const content = document.getElementById('reply-content').value.trim();
      const errorEl = document.getElementById('reply-error');
      errorEl.textContent = '';
      if (!content) {
        errorEl.textContent = "Reply cannot be empty.";
        return;
      }
      const { error } = await replyToThread(threadId, content);
      if (error) {
        errorEl.textContent = error.message || "Failed to reply.";
        return;
      }
      document.getElementById('reply-content').value = '';
      errorEl.textContent = '';
      renderThread();
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderThread();
  setupReplyForm();
});
