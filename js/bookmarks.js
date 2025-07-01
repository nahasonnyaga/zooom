// js/bookmarks.js - Interconnected with Zooom Forum project files

// Ensure supabase client is loaded
// This file should be included after js/supabase.js in your HTML

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
    .maybeSingle();
  return !!(data && !error);
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
    btnElement.title = 'Bookmark';
  } else {
    await bookmarkThread(threadId, userId);
    btnElement.classList.add('bookmarked');
    btnElement.title = 'Remove bookmark';
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

// Interconnection note:
// - Use `toggleBookmark` and `renderBookmarkState` in thread, feed, or bookmarks pages.
// - Call `renderBookmarkState(threadId, userId, btn)` after rendering a thread card.
// - Call `toggleBookmark(threadId, userId, btn, countSpan)` in your thread/bookmark button onclick handlers.

// Example integration in thread.js or feed.js:
/*
btn.onclick = async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    window.location.href = "auth.html?tab=login";
    return;
  }
  await toggleBookmark(threadId, sessionUser.id, btn, countSpan);
};
*/

// Example for rendering bookmarks page:
/*
const sessionUser = await getSessionUser();
const bookmarkedThreadIds = await getBookmarkedThreads(sessionUser.id);
// Then fetch each thread by thread_id and render
*/

// Optionally: add to main.css
// .bookmarked { color: #007aff; }

// Export functions for ES module usage if needed
// export { bookmarkThread, unbookmarkThread, isBookmarked, getBookmarkCount, getBookmarkedThreads, toggleBookmark, renderBookmarkState };
