// js/retweets.js

async function retweetThread(threadId, userId) {
  return await supabase.from('retweets').insert([{ thread_id: threadId, user_id: userId }]);
}
async function unretweetThread(threadId, userId) {
  return await supabase.from('retweets').delete().eq('thread_id', threadId).eq('user_id', userId);
}
async function isRetweeted(threadId, userId) {
  const { data } = await supabase.from('retweets').select('*').eq('thread_id', threadId).eq('user_id', userId);
  return data && data.length > 0;
}
async function countRetweets(threadId) {
  const { count } = await supabase.from('retweets').select('*', { count: 'exact', head: true }).eq('thread_id', threadId);
  return count || 0;
}
