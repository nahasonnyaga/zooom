// js/feed.js
// Fetch and render threads/posts
document.addEventListener('DOMContentLoaded', async () => {
  const feed = document.getElementById('feed');
  const { data: threads, error } = await supabase.from('threads').select('*').order('created_at', { ascending: false });
  if (error) {
    feed.innerHTML = '<p>Error loading threads.</p>';
    return;
  }
  if (!threads.length) {
    feed.innerHTML = '<p>No threads yet.</p>';
    return;
  }
  for (const thread of threads) {
    const threadCard = await fetch('components/thread-card.html').then(r => r.text());
    feed.innerHTML += threadCard.replace('{{title}}', thread.title).replace('{{content}}', thread.content).replace('{{author}}', thread.author);
  }
});
