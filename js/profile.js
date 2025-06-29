document.addEventListener('DOMContentLoaded', async () => {
  const user = await getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // --- Advanced Profile Population ---
  // Dummy fallback avatar/banner
  const defaultAvatar = 'img/default-avatar.png';
  const defaultBanner = '';

  // Fill advanced profile fields (customize as needed)
  document.getElementById('profile-email').textContent = user.email || '';
  document.getElementById('profile-displayname').textContent = user.displayname || (user.full_name || 'Your Name');
  document.getElementById('profile-username').textContent = user.username ? `@${user.username}` : `@user${user.id?.slice(-4) || ''}`;
  document.getElementById('profile-bio').textContent = user.bio || 'No bio yet.';
  document.getElementById('profile-joined').textContent = user.created_at ?
    new Date(user.created_at).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Unknown';

  // Avatar
  document.getElementById('profile-avatar').src = user.avatar_url || defaultAvatar;

  // Banner (if you have a banner field)
  if (user.banner_url) {
    document.getElementById('profile-banner').style.backgroundImage = `url(${user.banner_url})`;
    document.getElementById('profile-banner').style.backgroundSize = 'cover';
    document.getElementById('profile-banner').style.backgroundPosition = 'center';
  }

  // Location
  if (user.location) {
    document.getElementById('profile-location-row').style.display = 'inline-block';
    document.getElementById('profile-location').textContent = user.location;
  }

  // Website/link
  if (user.link) {
    document.getElementById('profile-link-row').style.display = 'inline-block';
    document.getElementById('profile-link').textContent = user.link;
    document.getElementById('profile-link').href = user.link;
  }

  // Followers/Following (fetch from DB if you have tables for this)
  // For now, use dummy values or add your real fetch here
  let followers = 0, following = 0;
  try {
    // Example: Assuming you have a 'follows' table with 'follower_id' and 'following_id'
    let [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)
    ]);
    followers = followersCount ?? 0;
    following = followingCount ?? 0;
  } catch (e) { /* ignore */ }
  document.getElementById('profile-followers').textContent = followers;
  document.getElementById('profile-following').textContent = following;

  // Edit profile button action (optional: show modal, etc.)
  document.getElementById('edit-profile-btn').onclick = () => {
    alert('Edit profile functionality coming soon!');
    // Could open a modal to edit display name, bio, avatar, etc.
  };

  // Fetch user's threads
  let { data: threads, error } = await supabase
    .from('threads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const threadsList = document.getElementById('profile-threads');
  if (error || !threads) {
    threadsList.innerHTML = "<p>Error loading your threads.</p>";
    return;
  }
  if (threads.length === 0) {
    threadsList.innerHTML = "<p>You have not posted any threads.</p>";
    return;
  }
  threadsList.innerHTML = threads.map(thread => `
    <div class="thread-card">
      <a href="thread.html?id=${thread.id}">
        <p>${thread.content}</p>
      </a>
      <small>${new Date(thread.created_at).toLocaleString()}</small>
    </div>
  `).join('');
});

// Log out button
document.getElementById('logout-btn').onclick = async () => {
  await signOut();
  window.location.href = 'login.html';
};
