// js/post.js
document.getElementById('post-form').onsubmit = async (e) => {
  e.preventDefault();
  const content = document.getElementById('content').value;

  const { data, error } = await createThread(content);
  if (error) {
    document.getElementById('post-error').textContent = error.message;
    return;
  }
  window.location.href = 'index.html';
};
