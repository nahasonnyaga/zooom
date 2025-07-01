async function loadFeed() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(username,avatar_url)')
    .order('created_at', { ascending: false })
    .limit(50);

  const container = document.getElementById('feed-container');
  if (error) {
    container.innerHTML = `<p class="error">Failed to load feed.</p>`;
    return;
  }
  container.innerHTML = '';
  for (const post of data) {
    const card = await fetch('components/thread-card.html').then(r=>r.text());
    container.innerHTML += card
      .replace('{{username}}', post.author?.username ?? 'unknown')
      .replace('{{avatar_url}}', post.author?.avatar_url ?? '/assets/default-avatar.png')
      .replace('{{content}}', post.content)
      .replace('{{created_at}}', new Date(post.created_at).toLocaleString())
      .replace(/{{post_id}}/g, post.id);
  }
}

document.addEventListener('DOMContentLoaded', loadFeed);
