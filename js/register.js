// js/register.js
// Handles user registration, avatar upload, and profile creation

import { supabase } from './supabase.js';

const form = document.getElementById('register-form');
const errorMsg = document.getElementById('error-msg');
const notif = document.getElementById('notification');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';
  showNotif('');

  const email = form.email.value.trim();
  const password = form.password.value;
  const bio = form.bio.value.trim();
  const avatarFile = form.avatar.files[0];

  // 1. Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    errorMsg.textContent = signUpError.message;
    return;
  }

  // 2. Get the user id
  const user = signUpData.user;
  if (!user) {
    errorMsg.textContent = 'Signup failed. User object not returned.';
    return;
  }

  // 3. Upload avatar if present
  let avatar_url = '';
  if (avatarFile) {
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(`public/${user.id}`, avatarFile, { upsert: true });

    if (uploadError) {
      errorMsg.textContent = 'Avatar upload failed: ' + uploadError.message;
      return;
    }
    avatar_url = uploadData?.path
      ? supabase.storage.from('avatars').getPublicUrl(uploadData.path).data.publicUrl
      : '';
  }

  // 4. Insert profile row
  const { error: profileError } = await supabase.from('profiles').insert([
    { id: user.id, bio, avatar_url }
  ]);
  if (profileError) {
    errorMsg.textContent = 'Profile creation failed: ' + profileError.message;
    return;
  }

  showNotif('Signup successful! Please check your email to verify your account.');
  form.reset();
});

function showNotif(msg) {
  if (notif) {
    notif.textContent = msg;
    notif.style.display = msg ? 'block' : 'none';
  }
}
