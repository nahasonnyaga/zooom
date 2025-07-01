const searchInput = document.getElementById('search-input');
const results = document.getElementById('search-results');
searchInput.addEventListener('input', async e => {
  const q = e.target.value.trim();
  if (!q) return results.innerHTML = '';
  results.innerHTML = await fetch('components/loader.html').then(r=>r.text());
  // Search users
  const { data: users } = await supabase.from('profiles').select('username,avatar_url,id').ilike('username', `%${q}%`).limit(5);
  // Search posts
  const { data: posts } = await supabase.from('posts').select('id,content,user_id').ilike('content', `%${q}%`).limit(10);
  let html = '';
  for (const user of users ?? []) {
    let card = await fetch('components/search-result.html').then(r=>r.text());
    html += card.replace('{{type}}', 'User')
      .replace('{{primary}}', `@${user.username}`)
      .replace('{{secondary}}', '')
      .replace('{{avatar_url}}', user.avatar_url || '/assets/default-avatar.png')
      .replace('{{href}}', `profile.html?id=${user.id}`);
  }
  for (const post of posts ?? []) {
    let card = await fetch('components/search-result.html').then(r=>r.text());
    html += card.replace('{{type}}', 'Post')
      .replace('{{primary}}', post.content.slice(0, 64))
      .replace('{{secondary}}', '')
      .replace('{{avatar_url}}', '/assets/post.png')
      .replace('{{href}}', `thread.html?id=${post.id}`);
  }
  results.innerHTML = html || '<p>No results.</p>';
});
