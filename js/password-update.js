// js/password-update.js
document.getElementById('password-update-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('new-password').value;
  // Current password check would be handled server-side; here we just update
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) document.getElementById('password-update-error').innerText = error.message;
  else {
    alert('Password updated successfully!');
    window.location.href = 'profile.html';
  }
});
