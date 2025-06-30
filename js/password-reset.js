// js/password-reset.js
document.getElementById('password-reset-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('reset-email').value;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) document.getElementById('password-reset-error').innerText = error.message;
  else {
    alert('Password reset link sent to your email.');
    window.location.href = 'login.html';
  }
});
