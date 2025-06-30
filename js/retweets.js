import { supabase } from './supabase.js';

export async function retweetThread(threadId, userId) {
  if (await isRetweeted(threadId, userId)) return { error: "Already retweeted" };
  return await supabase.from('retweets').insert([{ thread_id: threadId, user_id: userId }]);
}
export async function unretweetThread(threadId, userId) {
  return await supabase.from('retweets').delete().eq('thread_id', threadId).eq('user_id', userId);
}
export async function isRetweeted(threadId, userId) {
  const { data, error } = await supabase
    .from('retweets').select('id').eq('thread_id', threadId).eq('user_id', userId).limit(1).single();
  return !!data && !error;
}
export async function countRetweets(threadId) {
  const { count } = await supabase
    .from('retweets').select('id', { count: 'exact', head: true }).eq('thread_id', threadId);
  return count || 0;
}
