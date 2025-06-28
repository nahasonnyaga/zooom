// js/thread.js

function getThreadId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function renderThread() {
  const threadId = getThreadId();
  const { data, error } = await fetchThreadWithReplies(threadId);

  if (error || !data) {
    document.getElementById('thread-container').innerHTML = "<p>Error loading thread.</p>";
    return;
  }

  document.getElementById('thread-container').innerHTML = `
    <div class="thread-card">
      <p>${data.content}</p>
      <small>${new Date(data.created_at).toLocaleString()}</small>
    </div>
  `;

  const repliesList = document.getElementById('replies-list');
  if (!data.replies || data.replies.length === 0) {
    repliesList.innerHTML = "<p>No replies yet.</p>";
  } else {
    repliesList.innerHTML = data.replies.map(r =>
      `<div class="reply-card">
        <p>${r.content}</p>
        <small>${new Date(r.created_at).toLocaleString()}</small>
      </div>`
    ).join('');
  }
}

document.addEventListener('DOMContentLoaded', renderThread);

document.getElementById('reply-form').onsubmit = async (e) => {
  e.preventDefault();
  const threadId = getThreadId();
  const content = document.getElementById('reply-content').value;
  const { error } = await replyToThread(threadId, content);
  if (error) {
    document.getElementById('reply-error').textContent = error.message;
    return;
  }
  document.getElementById('reply-content').value = '';
  renderThread();
};
