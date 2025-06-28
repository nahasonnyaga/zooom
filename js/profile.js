// js/profile.js

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('profile-email').textContent = user.email;

  // Fetch user's threads
  let { data: threads, error } = await supabase
    .from('threads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const threadsList = document.getElementById('profile-threads');
  if (error || !threads) {
    threadsList.innerHTML = "<p>Error loading your threads.</p>";
    return;
  }
  if (threads.length === 0) {
    threadsList.innerHTML = "<p>You have not posted any threads.</p>";
    return;
  }
  threadsList.innerHTML = threads.map(thread => `
    <div class="thread-card">
      <a href="thread.html?id=${thread.id}">
        <p>${thread.content}</p>
      </a>
      <small>${new Date(thread.created_at).toLocaleString()}</small>
    </div>
  `).join('');
});

document.getElementById('logout-btn').onclick = async () => {
  await signOut();
  window.location.href = 'login.html';
};
