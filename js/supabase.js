import { isLiked, likeThread, unlikeThread, countLikes } from './likes.js';
import { isRetweeted, retweetThread, unretweetThread, countRetweets } from './retweets.js';
import { isBookmarked, bookmarkThread, unbookmarkThread } from './bookmarks.js';
import { getUser } from './supabase.js';

export async function attachThreadActions() {
  document.querySelectorAll('.thread-card').forEach(async (card) => {
    const threadId = card.dataset.threadId;
    const user = await getUser();
    if (!user) return;
    const userId = user.id;
    // Like
    const likeBtn = card.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.classList.toggle('liked', await isLiked(threadId, userId));
      likeBtn.onclick = async () => {
        if (likeBtn.classList.contains('liked')) {
          await unlikeThread(threadId, userId);
          likeBtn.classList.remove('liked');
        } else {
          await likeThread(threadId, userId);
          likeBtn.classList.add('liked');
        }
        const likeCount = card.querySelector('.like-count');
        if (likeCount) likeCount.textContent = await countLikes(threadId);
      };
      const likeCount = card.querySelector('.like-count');
      if (likeCount) likeCount.textContent = await countLikes(threadId);
    }
    // Retweet
    const retweetBtn = card.querySelector('.retweet-btn');
    if (retweetBtn) {
      retweetBtn.classList.toggle('retweeted', await isRetweeted(threadId, userId));
      retweetBtn.onclick = async () => {
        if (retweetBtn.classList.contains('retweeted')) {
          await unretweetThread(threadId, userId);
          retweetBtn.classList.remove('retweeted');
        } else {
          await retweetThread(threadId, userId);
          retweetBtn.classList.add('retweeted');
        }
        const retweetCount = card.querySelector('.retweet-count');
        if (retweetCount) retweetCount.textContent = await countRetweets(threadId);
      };
      const retweetCount = card.querySelector('.retweet-count');
      if (retweetCount) retweetCount.textContent = await countRetweets(threadId);
    }
    // Bookmark
    const bookmarkBtn = card.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.classList.toggle('bookmarked', await isBookmarked(threadId, userId));
      bookmarkBtn.onclick = async () => {
        if (bookmarkBtn.classList.contains('bookmarked')) {
          await unbookmarkThread(threadId, userId);
          bookmarkBtn.classList.remove('bookmarked');
        } else {
          await bookmarkThread(threadId, userId);
          bookmarkBtn.classList.add('bookmarked');
        }
      };
    }
  });
}
window.attachThreadActions = attachThreadActions;
