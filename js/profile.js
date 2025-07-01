async function loadProfile() {
  // Get profile ID from URL query (?id=) or from session
  let params = new URLSearchParams(window.location.search);
  let userId = params.get('id');
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id;
  }
  if (!userId) return;

  // Fetch profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  const { data: posts } = await supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });

  let html = `<section class="profile-card">
    <img src="${profile.avatar_url || '/assets/default-avatar.png'}" class="avatar" />
    <h2>@${profile.username}</h2>
    <p>${profile.bio ?? ''}</p>
  </section>
  <section class="profile-posts"><h3>Posts</h3>`;

  for (const post of posts) {
    html += `<div class="profile-post">${post.content}<div class="date">${new Date(post.created_at).toLocaleString()}</div></div>`;
  }
  html += '</section>';
  document.getElementById('profile-main').innerHTML = html;
}
document.addEventListener('DOMContentLoaded', loadProfile);
