// js/notifications.js

// Add a notification (thread liked, reply, mention, etc.)
async function addNotification(userId, type, referenceId, message) {
  // type: 'like', 'reply', 'mention', 'retweet', etc.
  return await supabase.from('notifications').insert([{ user_id: userId, type, reference_id: referenceId, message, seen: false }]);
}

// Listen for notifications in real time
function listenNotifications(userId, callback) {
  const channel = supabase
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, payload => {
      callback(payload.new);
    })
    .subscribe();
  return channel;
}
