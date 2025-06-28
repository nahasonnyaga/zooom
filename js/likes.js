// js/likes.js

async function likeThread(threadId, userId) {
  return await supabase.from('likes').insert([{ thread_id: threadId, user_id: userId }]);
}
async function unlikeThread(threadId, userId) {
  return await supabase.from('likes').delete().eq('thread_id', threadId).eq('user_id', userId);
}
async function isLiked(threadId, userId) {
  const { data } = await supabase.from('likes').select('*').eq('thread_id', threadId).eq('user_id', userId);
  return data && data.length > 0;
}
async function countLikes(threadId) {
  const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('thread_id', threadId);
  return count || 0;
}
