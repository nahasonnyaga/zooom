// messages.js - Direct Messages logic for Zooom

let currentUser = null;
let currentThreadUser = null;

// Fetch user session
async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

// Fetch DM users for the current user
async function loadDMUsers() {
  currentUser = await getSessionUser();
  if (!currentUser) {
    document.getElementById('dm-list').innerHTML =
      '<div style="padding:2em;text-align:center;"><a href="auth.html?tab=login">Log in</a> to view your messages.</div>';
    return;
  }

  // Fetch all users you have a DM with (either sent or received)
  let { data: threads, error } = await supabase
    .from('dm_threads')
    .select('id, user1:id, user2:id, user1_profile:profiles!dm_threads_user1_fkey(email,avatar_url), user2_profile:profiles!dm_threads_user2_fkey(email,avatar_url), last_message, last_time')
    .or(`user1.eq.${currentUser.id},user2.eq.${currentUser.id}`)
    .order('last_time', { ascending: false });

  if (error) {
    document.getElementById('dm-list').innerHTML =
      '<div style="color:#a33;text-align:center;">Failed to load DMs.</div>';
    return;
  }

  if (!threads || threads.length === 0) {
    document.getElementById('dm-list').innerHTML =
      '<div style="padding:2em;text-align:center;">No messages yet.</div>';
    return;
  }

  // Render DM list
  document.getElementById('dm-list').innerHTML = threads
    .map(thread => {
      const otherUser =
        thread.user1 === currentUser.id
          ? thread.user2_profile
          : thread.user1_profile;
      const otherUserId =
        thread.user1 === currentUser.id
          ? thread.user2
          : thread.user1;
      const avatar = otherUser?.avatar_url || "assets/default-avatar.png";
      const name = otherUser?.email
        ? otherUser.email.split('@')[0]
        : "User";
      return `<div class="dm-user" data-userid="${otherUserId}">
        <img class="dm-avatar" src="${avatar}" alt="${name}">
        <div class="dm-info">
          <div class="dm-name">${name}</div>
          <div class="dm-last">${thread.last_message ? thread.last_message.substring(0, 48) : ""}</div>
        </div>
      </div>`;
    })
    .join('');

  // Add click events
  document.querySelectorAll('.dm-user').forEach(el => {
    el.onclick = () => {
      document.querySelectorAll('.dm-user').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      loadDMThread(el.getAttribute('data-userid'));
    };
  });
}

// Load DM thread with another user
async function loadDMThread(otherUserId) {
  currentThreadUser = otherUserId;
  const container = document.getElementById('dm-thread');
  container.innerHTML = '<div style="padding:1.5em;text-align:center;">Loading...</div>';
  // Fetch profile for name/avatar
  let { data: profile } = await supabase.from('profiles').select('email,avatar_url').eq('id', otherUserId).single();
  const name = profile?.email ? profile.email.split('@')[0] : 'User';
  const avatar = profile?.avatar_url || "assets/default-avatar.png";

  // Fetch messages
  let { data: messages, error } = await supabase
    .from('dm_messages')
    .select('id,sender,receiver,body,created_at')
    .or(`sender.eq.${currentUser.id},receiver.eq.${currentUser.id}`)
    .filter('sender','in',`(${currentUser.id},${otherUserId})`)
    .filter('receiver','in',`(${currentUser.id},${otherUserId})`)
    .order('created_at', { ascending: true });

  if (error) {
    container.innerHTML = '<div style="color:#a33;">Failed to load messages.</div>';
    return;
  }

  container.innerHTML = `
    <div class="dm-thread-header">
      <img class="dm-avatar" src="${avatar}" style="vertical-align:middle;width:32px;height:32px;"> 
      <span>${name}</span>
    </div>
    <div class="dm-message-list" id="dm-message-list">
      ${messages && messages.length
        ? messages
            .map(msg => {
              const own = msg.sender === currentUser.id;
              return `<div class="dm-message${own ? ' own' : ''}">
                <img class="dm-avatar" src="${own ? 'assets/default-avatar.png' : avatar}">
                <div class="dm-bubble">${msg.body || ''}</div>
              </div>`;
            })
            .join('')
        : '<div style="padding:1em;color:#888;text-align:center;">No messages yet.</div>'}
    </div>
    <form id="dm-send-form" class="dm-input-row" autocomplete="off">
      <input type="text" id="dm-input" placeholder="Type a message..." required autocomplete="off" maxlength="1000">
      <button type="submit">Send</button>
    </form>
  `;

  // Scroll to bottom
  setTimeout(() => {
    const msgList = document.getElementById('dm-message-list');
    if (msgList) msgList.scrollTop = msgList.scrollHeight;
  }, 100);

  // Sending messages
  document.getElementById('dm-send-form').onsubmit = async e => {
    e.preventDefault();
    const input = document.getElementById('dm-input');
    const text = input.value.trim();
    if (!text) return;
    // Insert message
    const { error } = await supabase.from('dm_messages').insert([
      {
        sender: currentUser.id,
        receiver: otherUserId,
        body: text,
      },
    ]);
    if (!error) {
      input.value = "";
      await loadDMThread(otherUserId);
      // Update thread last message
      await supabase
        .from('dm_threads')
        .update({
          last_message: text,
          last_time: new Date().toISOString(),
        })
        .or(`user1.eq.${currentUser.id},user2.eq.${currentUser.id}`);
    }
  };
}

// On load
document.addEventListener('DOMContentLoaded', () => {
  loadDMUsers();
});
