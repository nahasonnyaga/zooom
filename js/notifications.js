// js/notifications.js

// Add a notification (thread liked, reply, mention, etc.)
// This function inserts a new notification into the Supabase 'notifications' table.
async function addNotification(userId, type, referenceId, message, extra = {}) {
  // type: 'like', 'reply', 'mention', 'retweet', etc.
  // extra: an object for any additional fields (e.g. thread_id, reply_id, actor_id for who performed action)
  const notification = {
    user_id: userId,
    type,
    reference_id: referenceId,
    message,
    seen: false,
    created_at: new Date().toISOString(),
    ...extra
  };
  return await supabase.from('notifications').insert([notification]);
}

// Listen for notifications in real time for a user.
// Calls callback(newNotification) for each new notification.
function listenNotifications(userId, callback) {
  const channel = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      payload => {
        callback(payload.new);
      }
    )
    .subscribe();
  return channel;
}

// Fetch latest notifications for a user, newest first
async function fetchNotifications(userId, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// Mark a notification as seen/read
async function markNotificationSeen(notificationId) {
  return await supabase
    .from('notifications')
    .update({ seen: true })
    .eq('id', notificationId);
}

// Mark all notifications as seen for a user
async function markAllNotificationsSeen(userId) {
  return await supabase
    .from('notifications')
    .update({ seen: true })
    .eq('user_id', userId)
    .eq('seen', false); // Only unseen
}

// Render a notification using the notification component
// Returns HTML string
function renderNotification(notification) {
  // Use components/notification.html structure
  // notification.message and notification.created_at are expected
  const date = new Date(notification.created_at).toLocaleString();
  return `
    <div class="notification${notification.seen ? ' seen' : ''}">
      <span class="notification-msg">${notification.message}</span>
      <span class="notification-date">${date}</span>
    </div>
  `;
}
