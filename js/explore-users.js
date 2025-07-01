document.addEventListener('DOMContentLoaded', async () => {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '<div class="loading">Loading users...</div>';
  const { data: users, error } = await supabase
    .from('profiles')
    .select('username, avatar_url, email')
    .order('username', {ascending: true})
    .limit(50);
  if (error) {
    userList.innerHTML = '<p class="error">Error loading users.</p>';
    return;
  }
  if (!users.length) {
    userList.innerHTML = '<p>No users found.</p>';
    return;
  }
  userList.innerHTML = users.map(user => `
    <div class="profile-card">
      <img src="${user.avatar_url || 'assets/avatar.png'}" class="profile-avatar" alt="${user.username || user.email}">
      <h3>${user.username || user.email}</h3>
      <p>${user.email}</p>
    </div>
  `).join('');
});
