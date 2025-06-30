import { supabase, getUser } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  // Load profile info
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile) {
    document.getElementById('settings-username').textContent = profile.username;
    document.getElementById('settings-displayname').value = profile.displayname;
    document.getElementById('settings-bio').value = profile.bio || '';
    document.getElementById('settings-avatar').src = profile.avatar_url || 'assets/avatar.png';
  }
  // Save profile
  document.getElementById('settings-form').onsubmit = async (e) => {
    e.preventDefault();
    const displayname = document.getElementById('settings-displayname').value.trim();
    const bio = document.getElementById('settings-bio').value.trim();
    await supabase.from('profiles').update({ displayname, bio }).eq('id', user.id);
    alert('Settings saved!');
  };
});
