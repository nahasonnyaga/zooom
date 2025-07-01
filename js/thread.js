// js/thread.js
// Thread and reply logic for Zooom Forum

document.addEventListener('DOMContentLoaded', async () => {
  // Get thread id from query parameter
  const params = new URLSearchParams(window.location.search);
  const threadId = params.get('id');
  const container = document.getElementById('thread-container');

  if (!threadId) {
    container.innerHTML = '<p class="error">Thread not found.</p>';
    return;
  }

  // Fetch thread
  const { data: thread, error } = await supabase
    .from('threads')
    .select('*')
    .eq('id', threadId)
    .single();

  if (error || !thread) {
    container.innerHTML = '<p class="error">Thread does not exist.</p>';
    return;
  }

  // Render thread
  let threadHtml = `<div class="thread-card">
    <h3>${thread.title}</h3>
    <p>${thread.content}</p>
    <div class="author">Posted by: ${thread.author}</div>
  </div>
  <section id="replies"><h4>Replies</h4></section>
  <form id="reply-form" class="reply-form" autocomplete="off">
    <textarea id="reply-content" required placeholder="Write a reply..." aria-label="Reply"></textarea>
    <button type="submit">Reply</button>
  </form>
  <div id="reply-error" class="form-error"></div>
  `;
  container.innerHTML = threadHtml;

  // Fetch and render replies
  const repliesSection = document.getElementById('replies');
  const { data: replies, error: replyError } = await supabase
    .from('replies')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (replyError) {
    repliesSection.innerHTML += '<p class="error">Failed to load replies.</p>';
  } else if (replies && replies.length) {
    for (const reply of replies) {
      let replyCard = await fetch('components/reply-card.html').then(r => r.text());
      replyCard = replyCard.replace('{{author}}', reply.author)
                           .replace('{{content}}', reply.content);
      repliesSection.innerHTML += replyCard;
    }
  } else {
    repliesSection.innerHTML += '<p>No replies yet.</p>';
  }

  // Handle reply form
  const replyForm = document.getElementById('reply-form');
  replyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('reply-content').value.trim();
    const { data: { user } } = await supabase.auth.getUser();
    const replyErrorDiv = document.getElementById('reply-error');
    replyErrorDiv.innerText = '';

    if (!user) {
      replyErrorDiv.innerText = 'You must be logged in to reply.';
      return;
    }
    if (!content) {
      replyErrorDiv.innerText = 'Reply cannot be empty.';
      return;
    }

    const { error: insertError } = await supabase.from('replies').insert([{
      thread_id: threadId,
      content,
      author: user.user_metadata?.username || user.email
    }]);

    if (insertError) {
      replyErrorDiv.innerText = insertError.message;
    } else {
      // Reload replies section
      window.location.reload();
    }
  });
});
