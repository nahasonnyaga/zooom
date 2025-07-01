document.addEventListener('DOMContentLoaded', async () => {
  const feed = document.getElementById('feed');
  feed.innerHTML = '<div class="loading">Loading threads...</div>';
  const { data: threads, error } = await supabase
    .from('threads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    feed.innerHTML = '<p class="error">Error loading threads.</p>';
    return;
  }
  if (!threads.length) {
    feed.innerHTML = '<p>No threads yet. Be the first to post!</p>';
    return;
  }
  for (const thread of threads) {
    let card = await fetch('components/thread-card.html').then(r => r.text());
    card = card.replace('{{title}}', thread.title)
      .replace('{{content}}', thread.content)
      .replace('{{author}}', thread.author)
      .replace('{{id}}', thread.id);
    feed.innerHTML += card;
  }
});
