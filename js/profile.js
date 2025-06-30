// js/profile.js
// Profile view logic
document.addEventListener('DOMContentLoaded', async () => {
  const user = window.currentUser;
  if (!user) {
    document.getElementById('profile-container').innerHTML = '<p>You must be logged in.</p>';
    return;
  }
  // Fetch user data
  document.getElementById('profile-container').innerHTML = `<h2>${user.user_metadata.username || user.email}</h2>
    <p>Email: ${user.email}</p>`;
});
