async function loadThread() {
  const params = new URLSearchParams(window.location.search);
  const threadId = params.get('id');
  if (!threadId) return;
  // Fetch thread post
  const { data: post } = await supabase.from('posts').select('*, author:profiles(username,avatar_url)').eq('id', threadId).single();
  // Fetch replies
  const { data: replies } = await supabase.from('posts').select('*, author:profiles(username,avatar_url)').eq('parent_id', threadId).order('created_at', { ascending: true });

  let html = '';
  if (post) {
    // Main post
    const card = await fetch('components/thread-card.html').then(r=>r.text());
    html += card
      .replace('{{username}}', post.author?.username ?? 'unknown')
      .replace('{{avatar_url}}', post.author?.avatar_url ?? '/assets/default-avatar.png')
      .replace('{{content}}', post.content)
      .replace('{{created_at}}', new Date(post.created_at).toLocaleString())
      .replace(/{{post_id}}/g, post.id);
  }
  // Replies
  for (const reply of replies) {
    const replyCard = await fetch('components/reply-card.html').then(r=>r.text());
    html += replyCard
      .replace('{{username}}', reply.author?.username ?? 'unknown')
      .replace('{{avatar_url}}', reply.author?.avatar_url ?? '/assets/default-avatar.png')
      .replace('{{content}}', reply.content)
      .replace('{{created_at}}', new Date(reply.created_at).toLocaleString());
  }
  document.getElementById('thread-container').innerHTML = html;
}
document.addEventListener('DOMContentLoaded', loadThread);
