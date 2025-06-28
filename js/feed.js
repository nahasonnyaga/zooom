// ...after rendering threads
import { isLiked, likeThread, unlikeThread, countLikes } from './likes.js';
import { isRetweeted, retweetThread, unretweetThread, countRetweets } from './retweets.js';
import { isBookmarked, bookmarkThread, unbookmarkThread } from './bookmarks.js';

// After rendering each thread-card, attach event listeners:
document.querySelectorAll('.thread-card').forEach(async (card) => {
  const threadId = card.dataset.threadId;
  const userId = (await getUser()).id;
  // Like
  const likeBtn = card.querySelector('.like-btn');
  likeBtn.classList.toggle('liked', await isLiked(threadId, userId));
  likeBtn.onclick = async () => {
    if (likeBtn.classList.contains('liked')) {
      await unlikeThread(threadId, userId);
      likeBtn.classList.remove('liked');
    } else {
      await likeThread(threadId, userId);
      likeBtn.classList.add('liked');
    }
    card.querySelector('.like-count').textContent = await countLikes(threadId);
  };
  card.querySelector('.like-count').textContent = await countLikes(threadId);

  // Retweet
  const retweetBtn = card.querySelector('.retweet-btn');
  retweetBtn.classList.toggle('retweeted', await isRetweeted(threadId, userId));
  retweetBtn.onclick = async () => {
    if (retweetBtn.classList.contains('retweeted')) {
      await unretweetThread(threadId, userId);
      retweetBtn.classList.remove('retweeted');
    } else {
      await retweetThread(threadId, userId);
      retweetBtn.classList.add('retweeted');
    }
    card.querySelector('.retweet-count').textContent = await countRetweets(threadId);
  };
  card.querySelector('.retweet-count').textContent = await countRetweets(threadId);

  // Bookmark
  const bookmarkBtn = card.querySelector('.bookmark-btn');
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
});
