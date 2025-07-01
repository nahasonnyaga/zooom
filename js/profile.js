document.addEventListener('DOMContentLoaded', async () => {
  const user = await window.protectPage();
  const container = document.getElementById('profile-container');
  if (!user) return;
  container.innerHTML = `
    <div class="profile-card">
      <img src="${user.user_metadata?.avatar_url || 'assets/avatar.png'}" class="profile-avatar" alt="Avatar">
      <h2>${user.user_metadata?.username || user.email}</h2>
      <p>Email: ${user.email}</p>
    </div>
  `;
});
