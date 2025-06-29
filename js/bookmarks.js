// js/bookmarks.js

// Bookmark a thread for a user
async function bookmarkThread(threadId, userId) {
  // Prevent duplicate bookmarks
  if (await isBookmarked(threadId, userId)) return { error: "Already bookmarked" };
  return await supabase.from('bookmarks').insert([{ thread_id: threadId, user_id: userId }]);
}

// Remove a bookmark for a thread for a user
async function unbookmarkThread(threadId, userId) {
  return await supabase
    .from('bookmarks')
    .delete()
    .eq('thread_id', threadId)
    .eq('user_id', userId);
}

// Check if a thread is bookmarked by a user
async function isBookmarked(threadId, userId) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .limit(1)
    .single();
  return !!data && !error;
}

// Get bookmark count for a thread
async function getBookmarkCount(threadId) {
  const { count } = await supabase
    .from('bookmarks')
    .select('id', { count: 'exact', head: true })
    .eq('thread_id', threadId);
  return count || 0;
}

// Get all bookmarked threads for a user (returns thread_ids)
async function getBookmarkedThreads(userId) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('thread_id')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data.map(row => row.thread_id);
}

// UI utility: toggle bookmark and update button state/counter
async function toggleBookmark(threadId, userId, btnElement, countElement) {
  if (await isBookmarked(threadId, userId)) {
    await unbookmarkThread(threadId, userId);
    btnElement.classList.remove('bookmarked');
  } else {
    await bookmarkThread(threadId, userId);
    btnElement.classList.add('bookmarked');
  }
  if (countElement) {
    const count = await getBookmarkCount(threadId);
    countElement.textContent = count > 0 ? count : '';
  }
}

// UI utility: render bookmark button state for a thread
async function renderBookmarkState(threadId, userId, btnElement) {
  if (await isBookmarked(threadId, userId)) {
    btnElement.classList.add('bookmarked');
    btnElement.title = 'Remove bookmark';
  } else {
    btnElement.classList.remove('bookmarked');
    btnElement.title = 'Bookmark';
  }
}

// Optionally: add CSS for .bookmarked in your main.css
// .bookmarked { color: #007aff; }
