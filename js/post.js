// js/post.js
// Posting logic for Zooom Forum

document.addEventListener('DOMContentLoaded', async () => {
  // Optionally, protect the page so only logged-in users can access it
  if (typeof window.protectPage === "function") {
    await window.protectPage();
  }
});

document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('post-title').value.trim();
  const content = document.getElementById('post-content').value.trim();
  const postError = document.getElementById('post-error');

  // Always get the freshest user info from Supabase
  let user = window.currentUser;
  if (!user && typeof supabase !== "undefined" && supabase.auth) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (!user) {
    postError.innerText = 'You must be logged in.';
    return;
  }
  if (!title || !content) {
    postError.innerText = 'Title and content are required.';
    return;
  }

  // Use username if available, otherwise fallback to email
  const author =
    (user.user_metadata && user.user_metadata.username)
      ? user.user_metadata.username
      : user.email;

  const { error } = await supabase
    .from('threads')
    .insert([{ title, content, author }]);

  if (error) {
    postError.innerText = error.message;
  } else {
    window.location.href = 'index.html';
  }
});
