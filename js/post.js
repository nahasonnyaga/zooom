document.getElementById('post-form').onsubmit = async (e) => {
  e.preventDefault();
  const textarea = document.getElementById('post-content');
  const content = textarea.value.trim();
  if (!content) return;
  const { error } = await supabase.from('posts').insert([{ content }]);
  if (!error) window.location.href = 'index.html';
  else document.getElementById('post-error').textContent = error.message;
};
