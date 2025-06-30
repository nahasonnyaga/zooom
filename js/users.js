import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, displayname, username, avatar_url, bio')
    .order('displayname', { ascending: true })
    .limit(100);
  const usersList = document.getElementById('users-list');
  const usersEmpty = document.getElementById('users-empty');
  if (error || !users) {
    usersList.innerHTML = '<div class="feed-empty">Error loading users.</div>';
    usersEmpty.style.display = "none";
    return;
  }
  if (users.length === 0) {
    usersList.innerHTML = '';
    usersEmpty.style.display = "";
    return;
  }
  usersEmpty.style.display = "none";
  usersList.innerHTML = '';
  users.forEach(user => {
    const userBlock = document.createElement('div');
    userBlock.className = 'user-list-item';
    userBlock.innerHTML = `
      <a href="profile.html?uid=${encodeURIComponent(user.id)}" class="user-link">
        <img src="${user.avatar_url || 'assets/avatar.png'}" alt="Avatar" class="user-avatar">
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
