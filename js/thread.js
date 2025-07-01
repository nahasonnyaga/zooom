document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const threadId = params.get('id');
  const container = document.getElementById('thread-container');
  if (!threadId) {
    container.innerHTML = '<p class="error">Thread not found.</p>';
    return;
  }
  // Load thread
  const { data: thread, error } = await supabase.from('threads').select('*').eq('id', threadId).single();
  if (error || !thread) {
    container.innerHTML = '<p class="error">Thread does not exist.</p>';
    return;
  }
  let threadHtml = `<div class="thread-card">
    <h3>${thread.title}</h3>
    <p>${thread.content}</p>
    <div class="author">Posted by: ${thread.author}</div>
  </div>
  <section id="replies"><h4>Replies</h4></section>
  <form id="reply-form"><textarea id="reply-content" required placeholder="Write a reply..." aria-label="Reply"></textarea><button type="submit">Reply</button></form>
  <div id="reply-error" class="form-error"></div>
  `;
  container.innerHTML = threadHtml;
  // Fetch and render replies
  const { data: replies } = await supabase.from('replies').select('*').eq('thread_id', threadId).order('created_at', { ascending: true });
  const repliesSection = document.getElementById('replies');
  if (replies && replies.length) {
    for (const reply of replies) {
      let replyCard = await fetch('components/reply-card.html').then(r => r.text());
      replyCard = replyCard.replace('{{author}}', reply.author).replace('{{content}}', reply.content);
      repliesSection.innerHTML += replyCard;
    }
  } else {
    repliesSection.innerHTML += '<p>No replies yet.</p>';
  }
  // Reply form
  document.getElementById('reply-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('reply-content').value;
    const user = await window.getCurrentUser();
    if (!content) return;
    const { error } = await supabase.from('replies').insert([{
      thread_id: threadId,
      content,
      author: user.user_metadata.username || user.email
    }]);
    if (error) document.getElementById('reply-error').innerText = error.message;
    else window.location.reload();
  });
});
