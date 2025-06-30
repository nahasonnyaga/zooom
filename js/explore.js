// js/explore.js
document.addEventListener('DOMContentLoaded', async () => {
  const feed = document.getElementById('explore-feed');
  feed.innerHTML = '<div class="loading">Loading trending threads...</div>';
  const { data: threads, error } = await supabase
    .from('threads')
    .select('*')
    .order('popularity', {ascending: false})
    .limit(20);
  if (error) {
    feed.innerHTML = '<p class="error">Error loading explore threads.</p>';
    return;
  }
  if (!threads.length) {
    feed.innerHTML = '<p>No trending threads yet.</p>';
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
