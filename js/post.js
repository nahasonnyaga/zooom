import { supabase, getUser } from './supabase.js';

document.getElementById('post-form').onsubmit = async (e) => {
  e.preventDefault();
  const content = document.getElementById('post-content').value.trim();
  const errorEl = document.getElementById('post-error');
  errorEl.textContent = '';
  if (!content) {
    errorEl.textContent = "Post content can't be empty.";
    return;
  }
  const user = await getUser();
  if (!user) {
    errorEl.textContent = "You must be logged in to post.";
    return;
  }
  const { error } = await supabase.from('threads').insert([
    { content, user_id: user.id, created_at: new Date().toISOString() }
  ]);
  if (error) {
    errorEl.textContent = error.message || "Couldn't post thread.";
    return;
  }
  window.location.href = "index.html";
};
