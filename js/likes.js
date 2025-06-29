// js/likes.js

// This module provides like/unlike functionality for threads using Supabase.
// It is intended to be used in the zooom project with the existing frontend structure.
// Assumes supabase client is initialized globally in js/supabase.js

/**
 * Like a thread.
 * @param {string} threadId - The ID of the thread to like.
 * @param {string} userId - The ID of the user liking the thread.
 * @returns {Promise<object>} Supabase response object.
 */
async function likeThread(threadId, userId) {
  return await supabase
    .from('likes')
    .insert([{ thread_id: threadId, user_id: userId }]);
}

/**
 * Unlike a thread.
 * @param {string} threadId - The ID of the thread to unlike.
 * @param {string} userId - The ID of the user unliking the thread.
 * @returns {Promise<object>} Supabase response object.
 */
async function unlikeThread(threadId, userId) {
  return await supabase
    .from('likes')
    .delete()
    .eq('thread_id', threadId)
    .eq('user_id', userId);
}

/**
 * Check if the user has liked a thread.
 * @param {string} threadId - The thread ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<boolean>} True if liked, else false.
 */
async function isLiked(threadId, userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error checking like:', error);
    return false;
  }
  return data && data.length > 0;
}

/**
 * Count the number of likes for a thread.
 * @param {string} threadId - The thread ID.
 * @returns {Promise<number>} Number of likes.
 */
async function countLikes(threadId) {
  const { count, error } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('thread_id', threadId);

  if (error) {
    console.error('Error counting likes:', error);
    return 0;
  }
  return count || 0;
}

/**
 * Toggle like status for a thread for the current user.
 * Updates the like button and count in the UI.
 * @param {string} threadId - The thread ID.
 * @param {string} userId - The user ID.
 * @param {HTMLElement} likeBtn - The like button element.
 * @param {HTMLElement} likeCountSpan - The element displaying the like count.
 */
async function toggleLike(threadId, userId, likeBtn, likeCountSpan) {
  const liked = await isLiked(threadId, userId);
  if (liked) {
    await unlikeThread(threadId, userId);
    likeBtn.classList.remove('liked');
  } else {
    await likeThread(threadId, userId);
    likeBtn.classList.add('liked');
  }
  const newCount = await countLikes(threadId);
  likeCountSpan.textContent = newCount > 0 ? newCount : '';
}

/**
 * Initialize like button events for a thread card.
 * This should be called after rendering a thread card.
 * @param {HTMLElement} threadCard - The thread card element.
 * @param {string} threadId - The thread ID.
 * @param {string} userId - The current user ID.
 */
async function setupLikeButton(threadCard, threadId, userId) {
  const likeBtn = threadCard.querySelector('.like-btn');
  const likeCountSpan = threadCard.querySelector('.like-count');

  // Set initial like state and count
  if (await isLiked(threadId, userId)) {
    likeBtn.classList.add('liked');
  } else {
    likeBtn.classList.remove('liked');
  }
  const count = await countLikes(threadId);
  likeCountSpan.textContent = count > 0 ? count : '';

  // Add click event
  likeBtn.onclick = async (e) => {
    e.stopPropagation();
    await toggleLike(threadId, userId, likeBtn, likeCountSpan);
  };
}

// Optional: highlight liked state with CSS
// .like-btn.liked { color: #e0245e; }

export {
  likeThread,
  unlikeThread,
  isLiked,
  countLikes,
  toggleLike,
  setupLikeButton
};
