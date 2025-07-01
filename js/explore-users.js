// explore-users.js - Interconnected with Supabase auth, profiles, and follow system

// Helper: get logged in user id
async function getSessionUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
}

function renderUsers(users, loggedInUserId, followingIds = []) {
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.forEach(user => {
    // Use profiles structure for Zooom
    const avatar = user.avatar_url || 'assets/avatar.png';
    const name = user.display_name || user.username || '';
    const username = user.username || '';
    const bio = user.bio || '';
    const location = user.location || '';
    const website = user.website;
    const twitter = user.twitter;
    const followers = user.followers_count || 0;
    const following = user.following_count || 0;
    const threads = user.threads_count || 0;
    const userId = user.id;

    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <img src="${avatar}" class="user-avatar" loading="lazy" alt="${name}" onerror="this.src='assets/avatar.png'">
      <div class="user-username">${name}</div>
      <div class="user-handle">@${username}</div>
      <div class="user-bio">${bio}</div>
      <div class="user-meta">${location ? `📍 ${location}` : ''}</div>
      <div class="user-meta">
        <span title="Followers">👥 <b>${followers}</b></span>
        &nbsp; | &nbsp;
        <span title="Following">🔗 <b>${following}</b></span>
        &nbsp; | &nbsp;
        <span title="Threads">🧵 <b>${threads}</b></span>
      </div>
      <div class="user-links" style="margin-bottom:0.5em;">
        ${website ? `<a href="${website}" target="_blank" rel="noopener noreferrer" title="Website"><i class="fa-solid fa-link"></i></a>` : ''}
        ${twitter ? `<a href="https://twitter.com/${twitter}" target="_blank" rel="noopener noreferrer" title="Twitter"><i class="fa-brands fa-x-twitter"></i></a>` : ''}
        <a href="profile.html?user=${encodeURIComponent(username)}" title="View Profile"><i class="fa-solid fa-user"></i></a>
        <a href="messages.html?user=${encodeURIComponent(userId)}" title="Send Message"><i class="fa-regular fa-envelope"></i></a>
      </div>
      ${userId !== loggedInUserId ? `
      <button class="user-follow-btn" data-userid="${userId}">
        ${followingIds.includes(userId) ? "Unfollow" : "Follow"}
      </button>
      ` : `<span style="color:#888;font-size:0.95em;margin-top:0.6em;">This is you</span>`}
    `;
    list.appendChild(card);
  });

  // Attach follow/unfollow event handlers
  document.querySelectorAll('.user-follow-btn').forEach(btn => {
    btn.onclick = async function() {
      const targetId = btn.getAttribute('data-userid');
      if(!loggedInUserId) {
        window.location.href = "auth.html?tab=login";
        return;
      }
      if(btn.textContent.trim() === "Follow") {
        const { error } = await supabase.from('follows').insert({ follower_id: loggedInUserId, following_id: targetId });
        if(!error) {
          btn.textContent = "Unfollow";
          btn.style.background = "linear-gradient(90deg,#2563eb 60%,#60a5fa 100%)";
        }
      } else {
        const { error } = await supabase.from('follows')
          .delete()
          .eq('follower_id', loggedInUserId)
          .eq('following_id', targetId);
        if(!error) {
          btn.textContent = "Follow";
          btn.style.background = "";
        }
      }
    }
  });
}

// FontAwesome (for icons)
(function loadFontAwesome() {
  if (!window.FontAwesomeLoaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    document.head.appendChild(link);
    window.FontAwesomeLoaded = true;
  }
})();

// Main loader
async function fetchAndRenderSupabaseUsers() {
  if (typeof supabase === "undefined") {
    setTimeout(fetchAndRenderSupabaseUsers, 100);
    return;
  }
  const loggedInUserId = await getSessionUserId();
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id,display_name,username,avatar_url,bio,location,website,twitter,followers_count,following_count,threads_count')
    .order('created_at', { ascending: false });

  let followingIds = [];
  if(loggedInUserId) {
    const { data: followingRows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', loggedInUserId);
    followingIds = (followingRows || []).map(f => f.following_id);
  }

  if (error) {
    document.getElementById('user-list').innerHTML = `<div style="color:red;">Error loading users: ${error.message}</div>`;
    return;
  }
  renderUsers(users || [], loggedInUserId, followingIds);
}

document.addEventListener('DOMContentLoaded', fetchAndRenderSupabaseUsers);
