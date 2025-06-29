// Enhanced X-style profile population and tabs (edit, images, links, stats, X-like tabs)

document.addEventListener('DOMContentLoaded', async () => {
  // ========== USER FETCH ==========
  const user = await getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // --- Defaults ---
  const defaultAvatar = 'img/default-avatar.png';

  // ========== POPULATE BASIC PROFILE ==========
  document.getElementById('profile-email').textContent = user.email || '';
  document.getElementById('profile-displayname').textContent = user.displayname || (user.full_name || 'Your Name');
  document.getElementById('profile-username').textContent = user.username
    ? `@${user.username}` : `@user${user.id?.slice(-4) || ''}`;
  document.getElementById('profile-bio').textContent = user.bio || 'No bio yet.';
  document.getElementById('profile-joined').textContent = user.created_at
    ? new Date(user.created_at).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Unknown';
  // Avatar
  document.getElementById('profile-avatar').src = user.avatar_url || defaultAvatar;

  // ========== BANNER ==========
  if (user.banner_url) {
    const banner = document.getElementById('profile-banner');
    banner.style.backgroundImage = `url(${user.banner_url})`;
    banner.style.backgroundSize = 'cover';
    banner.style.backgroundPosition = 'center';
  }

  // ========== LOCATION ==========
  if (user.location) {
    document.getElementById('profile-location-row').style.display = 'inline-block';
    document.getElementById('profile-location').textContent = user.location;
  }

  // ========== LINKS (Up to 2) ==========
  // Assume: user.link1, user.link2 fields
  const linksRow = document.getElementById('profile-links-row');
  linksRow.innerHTML = '';
  let linksAdded = 0;
  [user.link1, user.link2].forEach(lk => {
    if (lk && /^https?:\/\/[\w\-\.]+/i.test(lk.trim())) {
      const block = document.createElement('span');
      block.className = 'profile-link-block';
      block.innerHTML = `<i class="fa fa-link"></i> <a href="${lk}" target="_blank" rel="noopener">${lk.replace(/^https?:\/\//, '')}</a>`;
      linksRow.appendChild(block);
      linksAdded++;
    }
  });
  linksRow.style.display = linksAdded ? 'flex' : 'none';

  // ========== PROFILE IMAGES ==========
  // Assume user.images is an array of image urls
  const imagesRow = document.getElementById('profile-images-row');
  imagesRow.innerHTML = '';
  (user.images || []).forEach(url => {
    if (url) {
      const img = document.createElement('img');
      img.className = 'profile-img-thumb';
      img.src = url;
      img.onclick = () => window.open(url, '_blank');
      imagesRow.appendChild(img);
    }
  });

  // ========== FOLLOWERS / FOLLOWING ==========
  let followers = 0, following = 0;
  try {
    let [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)
    ]);
    followers = followersCount ?? 0;
    following = followingCount ?? 0;
  } catch (e) { /* ignore */ }
  document.getElementById('profile-followers').textContent = followers;
  document.getElementById('profile-following').textContent = following;

  // ========== ADVANCED COUNTS ==========
  // THREADS
  let threads = [];
  let threadsCount = 0;
  try {
    const { data: threadsData, error, count: threadsCountRaw } = await supabase
      .from('threads')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    threads = threadsData || [];
    threadsCount = threadsCountRaw ?? (threads.length || 0);
  } catch (e) { /* ignore */ }

  // LIKES (received on user's threads)
  let likesCount = 0;
  try {
    if (threads && threads.length) {
      const threadIds = threads.map(t => t.id);
      if (threadIds.length > 0) {
        const { count: likesReceivedCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('thread_id', threadIds);
        likesCount = likesReceivedCount ?? 0;
      }
    }
  } catch (e) { /* ignore */ }

  // REPOSTS (user did)
  let repostsCount = 0;
  try {
    const { count: repostsRaw } = await supabase
      .from('reposts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    repostsCount = repostsRaw ?? 0;
  } catch (e) { /* ignore */ }

  // BOOKMARKS (user's bookmarks)
  let bookmarksCount = 0;
  try {
    const { count: bookmarksRaw } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    bookmarksCount = bookmarksRaw ?? 0;
  } catch (e) { /* ignore */ }

  // Set stats in DOM
  document.getElementById('profile-likes').textContent = likesCount;
  document.getElementById('profile-threads-count').textContent = threadsCount;
  document.getElementById('profile-reposts').textContent = repostsCount;
  document.getElementById('profile-bookmarks').textContent = bookmarksCount;

  // ========== PROFILE TABS LOGIC ==========
  // Data holders for tabs
  let tabsData = {
    threads: threads,
    likes: [],
    reposts: [],
    bookmarks: []
  };

  // Fetch likes (threads the user liked)
  try {
    let { data } = await supabase
      .from('threads')
      .select('*, likes!inner(*)')
      .eq('likes.user_id', user.id)
      .order('created_at', { ascending: false });
    tabsData.likes = data || [];
  } catch (e) {}

  // Fetch reposts (threads the user reposted)
  try {
    let { data } = await supabase
      .from('threads')
      .select('*, reposts!inner(*)')
      .eq('reposts.user_id', user.id)
      .order('created_at', { ascending: false });
    tabsData.reposts = data || [];
  } catch (e) {}

  // Fetch bookmarks (threads the user bookmarked)
  try {
    let { data } = await supabase
      .from('threads')
      .select('*, bookmarks!inner(*)')
      .eq('bookmarks.user_id', user.id)
      .order('created_at', { ascending: false });
    tabsData.bookmarks = data || [];
  } catch (e) {}

  // ========== RENDER TABS ==========
  function threadHtml(thread) {
    return `
      <div class="thread-card" style="border-bottom:1.2px solid #eee;padding:13px 0;">
        <div style="display:flex;align-items:flex-start;gap:9px;">
          <img src="${thread.author_avatar || defaultAvatar}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;">
          <div>
            <div style="font-weight:bold;font-size:1.05em;">
              ${thread.author_displayname || 'User'} <span style="color:#aaa;font-size:.93em;">@${thread.author_username || ''}</span>
            </div>
            <div style="font-size:1em;padding-top:2px;">${thread.content || ''}</div>
            ${thread.image_url ? `<img src="${thread.image_url}" style="margin-top:5px;max-width:200px;border-radius:6px;">` : ''}
            <div style="color:#888;font-size:.92em;margin-top:4px;">
              ${new Date(thread.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTab(tab) {
    const section = document.getElementById('profile-threads');
    const rows = tabsData[tab];
    if (!rows || !rows.length) {
      section.innerHTML = `<div style="padding:14px; color:#888;">No ${tab} yet.</div>`;
      return;
    }
    section.innerHTML = rows.map(threadHtml).join('');
  }

  // Tab click logic
  document.getElementById('profile-tabs').onclick = e => {
    if (e.target.classList.contains('profile-tab')) {
      Array.from(document.getElementById('profile-tabs').children).forEach(btn =>
        btn.classList.toggle('active', btn === e.target)
      );
      renderTab(e.target.dataset.tab);
    }
  };

  // Initial render
  renderTab('threads');

  // ========== EDIT PROFILE ==========
  document.getElementById('edit-profile-btn').onclick = () => {
    document.getElementById('edit-profile-modal-bg').style.display = 'flex';
  };
  document.getElementById('close-edit-profile-modal').onclick = () => {
    document.getElementById('edit-profile-modal-bg').style.display = 'none';
  };
  document.getElementById('edit-profile-modal-bg').onclick = e => {
    if (e.target.id === 'edit-profile-modal-bg') {
      document.getElementById('edit-profile-modal-bg').style.display = 'none';
    }
  };

  // Modal form handlers (see main completion for details...)

  // ========== LOG OUT ==========
  document.getElementById('logout-btn').onclick = async () => {
    await signOut();
    window.location.href = 'login.html';
  };
});
