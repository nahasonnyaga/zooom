// js/notifications.js
// Requires: @supabase/supabase-js loaded via CDN

// --- Supabase config: update these to match your project ---
const SUPABASE_URL = 'https://kocbcrctlneqqxhxowbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvY2JjcmN0bG5lcXF4aHhvd2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzc5MjksImV4cCI6MjA2NTk1MzkyOX0.pOL7LyfvmDAQ3IP7qzdpwyHzKaXGCJIN_t3jkx2ZoBI';
// -----------------------------------------------------------

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchNotifications() {
  // Try to get the currently logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  const list = document.getElementById('notification-list');
  const emptyMsg = document.getElementById('notification-empty');
  if (!user) {
    list.innerHTML = '<div class="feed-empty">Sign in to view your notifications.</div>';
    emptyMsg.style.display = "none";
    return;
  }
  // Fetch notifications for this user
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) {
    list.innerHTML = '<div class="feed-empty">Error loading notifications.</div>';
    emptyMsg.style.display = "none";
    return;
  }
  if (!notifications || notifications.length === 0) {
    list.innerHTML = '';
    emptyMsg.style.display = "";
    return;
  }
  emptyMsg.style.display = "none";
  list.innerHTML = '';
  // Load notification card template once
  const tpl = await fetch('components/notification.html').then(r=>r.text());
  notifications.forEach(n => {
    let html = tpl;
    html = html.replace('<!-- message -->', n.message);
    html = html.replace('<!-- date -->', new Date(n.created_at).toLocaleString());
    const div = document.createElement('div');
    div.innerHTML = html;
    list.appendChild(div.firstElementChild);
  });
}

document.addEventListener('DOMContentLoaded', fetchNotifications);
