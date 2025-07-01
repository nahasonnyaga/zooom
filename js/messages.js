// Simple DMs: fetch conversations and display thread
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return location.href = 'login.html';
  const userId = session.user.id;
  // Fetch conversations
  const { data: convos } = await supabase.from('conversations').select('*').or(`user1.eq.${userId},user2.eq.${userId}`);
  let dmHtml = '';
  for (const c of convos ?? []) {
    const otherUser = c.user1 === userId ? c.user2 : c.user1;
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', otherUser).single();
    dmHtml += `<div class="dm-card" onclick="loadThread('${c.id}', '${otherUser}')">@${profile?.username}</div>`;
  }
  document.getElementById('dm-list').innerHTML = dmHtml;
});

async function loadThread(convoId, otherUserId) {
  const { data: messages } = await supabase.from('messages').select('*').eq('conversation_id', convoId).order('created_at');
  let html = '';
  for (const m of messages ?? []) {
    html += `<div class="message-card${m.from_self ? ' self' : ''}"><span>${m.content}</span></div>`;
  }
  document.getElementById('dm-thread').innerHTML = html;
}
