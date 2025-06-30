import { supabase } from './supabase.js';

function setLoading(isLoading) {
  const btn = document.querySelector('#register-form button[type="submit"]');
  if (btn) btn.disabled = !!isLoading;
}
function clearError() {
  const err = document.getElementById('error-msg');
  if (err) err.textContent = '';
}
async function signUp(data) {
  const { error, data: regData } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { displayname: data.displayname, username: data.username } }
  });
  if (!error) {
    // Insert into profiles table
    await supabase.from('profiles').insert({
      id: regData.user.id,
      displayname: data.displayname,
      username: data.username,
      avatar_url: '',
      bio: ''
    });
  }
  return { error };
}
document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  clearError();
  setLoading(true);
  const displayname = document.getElementById('displayname').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!displayname || !username || !email || !password) {
    document.getElementById('error-msg').textContent = 'Please fill all fields.';
    setLoading(false);
    return;
  }
  try {
    const { error } = await signUp({ displayname, username, email, password });
    if (error) {
      document.getElementById('error-msg').textContent = error.message || 'Registration failed.';
      setLoading(false);
      return;
    }
    window.location.href = 'index.html';
  } catch (err) {
    document.getElementById('error-msg').textContent = err.message || 'Unexpected error.';
    setLoading(false);
  }
};
