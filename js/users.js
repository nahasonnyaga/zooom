// js/users.js
// Fetch and display all users

document.addEventListener('DOMContentLoaded', async () => {
  // Load navbar if you use a shared navbar component
  if (document.getElementById('navbar')) {
    fetch('components/navbar.html').then(r => r.text()).then(html => {
      document.getElementById('navbar').innerHTML = html;
    }).catch(() => {
      document.getElementById('navbar').innerHTML = '<nav><a href="index.html">Feed</a> <a href="users.html">Users</a> <a href="profile.html">Profile</a></nav>';
    });
  }

  // Fetch users from Supabase
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, displayname, username, avatar_url, bio')
    .order('displayname', { ascending: true })
    .limit(100);

  const usersList = document.getElementById('users-list');
  usersList.innerHTML = '';

  if (error) {
    usersList.innerHTML = '<p style="color:#c33;">Could not load users. Please try again later.</p>';
    return;
  }

  if (!users || users.length === 0) {
    usersList.innerHTML = '<p>No users found.</p>';
    return;
  }

  // Render users
  users.forEach(user => {
    const userBlock = document.createElement('div');
    userBlock.className = 'user-list-item';
    userBlock.innerHTML = `
      <a href="profile.html?uid=${encodeURIComponent(user.id)}" class="user-link">
        <img src="${user.avatar_url || 'img/default-avatar.png'}" alt="Avatar" class="user-avatar">
        <div class="user-info">
          <div class="user-displayname">${user.displayname || 'No Name'}</div>
          <div class="user-username">@${user.username || ('user' + (user.id || '').slice(-4))}</div>
          <div class="user-bio">${user.bio ? user.bio.slice(0,60) : ''}</div>
        </div>
      </a>
    `;
    usersList.appendChild(userBlock);
  });
});
