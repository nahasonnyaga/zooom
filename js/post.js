document.addEventListener('DOMContentLoaded', async () => {
  window.protectPage();
});
document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const user = await window.getCurrentUser();
  if (!user) {
    document.getElementById('post-error').innerText = 'You must be logged in.';
    return;
  }
  const { error } = await supabase.from('threads').insert([{
    title,
    content,
    author: user.user_metadata.username || user.email
  }]);
  if (error) document.getElementById('post-error').innerText = error.message;
  else window.location.href = 'index.html';
});
