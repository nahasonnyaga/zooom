/**
 * Linkify hashtags, mentions, and URLs in content.
 * - Mentions (@user) ➔ <a href="profile.html?user=username" class="mention">@user</a>
 * - Hashtags (#topic) ➔ <a href="feed.html#hashtag-topic" class="hashtag">#topic</a>
 * - URLs ➔ <a href="..." class="external-link">...</a>
 * Escapes HTML to prevent XSS.
 * @param {string} text
 * @returns {string} HTML with links
 */
function linkifyContent(text) {
  if (!text) return "";

  // Escape HTML to prevent XSS
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }

  // First escape any HTML in user input
  let safe = escapeHTML(text);

  // Linkify URLs (http(s):// or www.)
  safe = safe.replace(
    /(\bhttps?:\/\/[^\s<]+[^\s<\.\,\!\?\)\]\}])|(\bwww\.[^\s<]+[^\s<\.\,\!\?\)\]\}])/gi,
    function (url) {
      let fullUrl = url.startsWith('www.') ? 'http://' + url : url;
      return `<a href="${fullUrl}" class="external-link" target="_blank" rel="noopener">${url}</a>`;
    }
  );

  // Linkify mentions (for Supabase, the username is unique, we use "user" param)
  // Only match word boundaries, not emails
  safe = safe.replace(
    /(^|[^a-zA-Z0-9_])@([a-zA-Z0-9_]{1,32})\b/g,
    '$1<a href="profile.html?user=$2" class="mention">@$2</a>'
  );

  // Linkify hashtags (route to feed.html with hash for proper X-style UX)
  safe = safe.replace(
    /(^|[^a-zA-Z0-9_])#([a-zA-Z0-9_]+)/g,
    '$1<a href="feed.html#hashtag-$2" class="hashtag">#$2</a>'
  );

  return safe;
}

// Optionally: export for use in modules
// export { linkifyContent };
