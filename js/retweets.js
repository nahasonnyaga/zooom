// js/retweets.js
// Retweet logic for Threads 100 Clone (compatible with the rest of the zooom app)
// Requires: supabase.js loaded before this script

/**
 * Retweet a thread for a user.
 * @param {string} threadId - UUID of the thread.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<object>} Supabase response.
 */
async function retweetThread(threadId, userId) {
  return await supabase.from('retweets').insert([{ thread_id: threadId, user_id: userId }]);
}

/**
 * Undo a retweet for a user.
 * @param {string} threadId 
 * @param {string} userId 
 * @returns {Promise<object>} Supabase response.
 */
async function unretweetThread(threadId, userId) {
  return await supabase.from('retweets').delete().eq('thread_id', threadId).eq('user_id', userId);
}

/**
 * Check if a thread is retweeted by the user.
 * @param {string} threadId 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
async function isRetweeted(threadId, userId) {
  const { data } = await supabase.from('retweets')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

/**
 * Get the total number of retweets for a thread.
 * @param {string} threadId 
 * @returns {Promise<number>}
 */
async function countRetweets(threadId) {
  const { count } = await supabase.from('retweets')
    .select('id', { count: 'exact', head: true })
    .eq('thread_id', threadId);
  return count || 0;
}

/**
 * Toggle retweet state for a thread and user.
 * @param {string} threadId 
 * @param {string} userId 
 * @returns {Promise<boolean>} true if now retweeted, false if unretweeted
 */
async function toggleRetweet(threadId, userId) {
  if (await isRetweeted(threadId, userId)) {
    await unretweetThread(threadId, userId);
    return false;
  } else {
    await retweetThread(threadId, userId);
    return true;
  }
}

/**
 * Attach retweet button listeners for thread actions.
 * Expects retweet buttons to have class "retweet-btn" and data attributes for thread/user.
 */
function setupRetweetButtons(currentUserId) {
  document.querySelectorAll('.retweet-btn').forEach(btn => {
    const threadId = btn.closest('[data-thread-id]')?.dataset.threadId;
    if (!threadId) return;

    // Initial state
    isRetweeted(threadId, currentUserId).then(isR => {
      btn.classList.toggle('active', isR);
    });
    countRetweets(threadId).then(cnt => {
      const countElem = btn.parentElement.querySelector('.retweet-count');
      if (countElem) countElem.textContent = cnt;
    });

    // Click listener
    btn.onclick = async (e) => {
      e.preventDefault();
      const nowRetweeted = await toggleRetweet(threadId, currentUserId);
      btn.classList.toggle('active', nowRetweeted);
      // Update count
      const countElem = btn.parentElement.querySelector('.retweet-count');
      if (countElem) countElem.textContent = await countRetweets(threadId);
    };
  });
}

// Optionally, export functions if using modules
// export { retweetThread, unretweetThread, isRetweeted, countRetweets, toggleRetweet, setupRetweetButtons };
