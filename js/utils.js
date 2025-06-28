// js/utils.js
// Linkify hashtags and mentions
function linkifyContent(text) {
  // Mentions
  let withMentions = text.replace(/@(\w+)/g, '<a href="profile.html?username=$1" class="mention">@$1</a>');
  // Hashtags
  return withMentions.replace(/#(\w+)/g, '<a href="index.html?hashtag=$1" class="hashtag">#$1</a>');
}
