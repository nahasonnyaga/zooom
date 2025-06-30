import { supabase } from './supabase.js';

function getProfileId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('uid');
}

async function renderProfile() {
  const uid = getProfileId();
  if (!uid) {
    document.getElementById('profile-header').innerHTML = "<p>Invalid profile.</p>";
    return;
  }
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
  if (error || !profile) {
    document.getElementById('profile-header').innerHTML = "<p>User not found.</p>";
    return;
  }
  document.getElementById('profile-header').innerHTML = `
    <img src="${profile.avatar_url || 'assets/avatar.png'}" class="profile-avatar" alt="Avatar">
    <h2>${profile.displayname || 'No Name'}</h2>
    <p>@${profile.username}</p>
  `;
  document.getElementById('profile-bio').textContent = profile.bio || '';
  // Load user's threads
  const { data: threads } = await supabase.from('threads').select('*').eq('user_id', uid).order('created_at', { ascending: false });
  const threadsContainer = document.getElementById('profile-threads');
  if (!threads || threads.length === 0) {
    threadsContainer.innerHTML = "<p>No threads yet.</p>";
    return;
  }
  const tpl = await fetch('components/thread-card.html').then(r=>r.text());
  threadsContainer.innerHTML = threads.map(t => {
    let html = tpl;
    html = html.replaceAll('<!-- content -->', t.content);
    html = html.replaceAll('<!-- date -->', new Date(t.created_at).toLocaleString());
    html = html.replaceAll('<!-- thread-id -->', t.id);
    return html;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderProfile);
