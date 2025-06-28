// js/bookmarks.js

async function bookmarkThread(threadId, userId) {
  return await supabase.from('bookmarks').insert([{ thread_id: threadId, user_id: userId }]);
}
async function unbookmarkThread(threadId, userId) {
  return await supabase.from('bookmarks').delete().eq('thread_id', threadId).eq('user_id', userId);
}
async function isBookmarked(threadId, userId) {
  const { data } = await supabase.from('bookmarks').select('*').eq('thread_id', threadId).eq('user_id', userId);
  return data && data.length > 0;
}
