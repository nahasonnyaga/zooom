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
    // Value add: Add thread actions (like, repost, bookmark) and reply count if available
    const likeCount = thread.likes_count || thread.likes?.length || 0;
    const repostCount = thread.reposts_count || thread.reposts?.length || 0;
    const bookmarkCount = thread.bookmarks_count || thread.bookmarks?.length || 0;

    // Import thread-actions.html for thread actions if available
    // Use minimal actions if not using the component system
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
            <div style="margin-top:7px;">
              <button class="action-btn like-btn" title="Like">&#10084;</button>
              <span class="like-count">${likeCount}</span>
              <button class="action-btn retweet-btn" title="Repost">&#128257;</button>
              <span class="retweet-count">${repostCount}</span>
              <button class="action-btn bookmark-btn" title="Bookmark">&#128278;</button>
              <span class="bookmark-count">${bookmarkCount}</span>
              <a href="thread.html?id=${thread.id}" style="margin-left:10px;font-size:.93em;color:#007bff;text-decoration:none;">View Thread</a>
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

  // ========== VALUE ADD: Copy Profile Link ==========
  // Add a "Copy Profile Link" button if not present
  let copyBtn = document.getElementById('copy-profile-link-btn');
  if (!copyBtn) {
    copyBtn = document.createElement('button');
    copyBtn.id = 'copy-profile-link-btn';
    copyBtn.textContent = 'Copy Profile Link';
    copyBtn.className = 'action-btn';
    const profileHeader = document.getElementById('profile-header') || document.body;
    profileHeader.appendChild(copyBtn);
  }
  copyBtn.onclick = () => {
    const url = window.location.origin + `/profile.html?user=${encodeURIComponent(user.username || user.id)}`;
    navigator.clipboard.writeText(url);
    // Show notification
    let notif = document.createElement('div');
    notif.textContent = 'Profile link copied!';
    notif.style = 'position:fixed;top:15px;right:15px;background:#222;color:#fff;padding:8px 18px;border-radius:5px;z-index:10000;box-shadow:0 1px 6px #0002;';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  };

  // ========== VALUE ADD: Accessibility Improvements ==========
  // Add alt text for avatar and images
  document.getElementById('profile-avatar').alt = `${user.displayname || user.username || 'User'}'s avatar`;
  Array.from(document.getElementsByClassName('profile-img-thumb')).forEach(img => {
    img.alt = 'Profile image';
  });

  // ========== VALUE ADD: Show user ID ==========
  let uidRow = document.getElementById('profile-uid-row');
  if (!uidRow) {
    uidRow = document.createElement('div');
    uidRow.id = 'profile-uid-row';
    uidRow.innerHTML = `<span style="color:#888;font-size:.88em;">User ID:</span> <span id="profile-uid-val">${user.id}</span>`;
    const bioRow = document.getElementById('profile-bio');
    if (bioRow && bioRow.parentNode) {
      bioRow.parentNode.appendChild(uidRow);
    }
  } else {
    document.getElementById('profile-uid-val').textContent = user.id;
  }

  // ========== VALUE ADD: Welcome Notification ==========
  if (!window._profileWelcomeShown) {
    window._profileWelcomeShown = true;
    let notif = document.createElement('div');
    notif.textContent = `Welcome, ${user.displayname || user.username || 'User'}!`;
    notif.style = 'position:fixed;top:15px;left:50%;transform:translateX(-50%);background:#0a0;color:#fff;padding:8px 22px;border-radius:7px;z-index:10000;font-weight:bold;box-shadow:0 2px 10px #0003;';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2200);
  }
});
