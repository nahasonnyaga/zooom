// js/utils.js

/**
 * Linkify hashtags, mentions, and URLs in content.
 * - Mentions (@user) ➔ <a href="profile.html?username=user" class="mention">@user</a>
 * - Hashtags (#topic) ➔ <a href="index.html?hashtag=topic" class="hashtag">#topic</a>
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

  // Linkify mentions
  safe = safe.replace(
    /@(\w+)/g,
    '<a href="profile.html?username=$1" class="mention">@$1</a>'
  );

  // Linkify hashtags
  safe = safe.replace(
    /#(\w+)/g,
    '<a href="index.html?hashtag=$1" class="hashtag">#$1</a>'
  );

  return safe;
}

// Optionally: export for use in modules
// export { linkifyContent };
