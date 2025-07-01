document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return location.href = 'login.html';
  const userId = session.user.id;
  // Fetch notifications (assume supabase table 'notifications')
  const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  let html = '';
  for (const n of notifs ?? []) {
    const card = await fetch('components/notification-card.html').then(r=>r.text());
    html += card.replace('{{content}}', n.content).replace('{{created_at}}', new Date(n.created_at).toLocaleString());
  }
  document.getElementById('notifications-list').innerHTML = html || '<p>No notifications.</p>';
});
