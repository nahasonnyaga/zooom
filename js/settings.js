document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return location.href = 'login.html';
  const userId = session.user.id;
  // Load current
  const { data: profile } = await supabase.from('profiles').select().eq('id', userId).single();
  document.getElementById('settings-username').value = profile.username;
  document.getElementById('settings-bio').value = profile.bio ?? '';
  document.getElementById('settings-avatar').value = profile.avatar_url ?? '';
  // Save
  document.getElementById('settings-form').onsubmit = async e => {
    e.preventDefault();
    const username = document.getElementById('settings-username').value.trim();
    const bio = document.getElementById('settings-bio').value.trim();
    const avatar_url = document.getElementById('settings-avatar').value.trim();
    const { error } = await supabase.from('profiles').update({ username, bio, avatar_url }).eq('id', userId);
    document.getElementById('settings-success').textContent = error ? error.message : 'Saved!';
  }
});
