// js/password-reset.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('password-reset-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const errorDiv = document.getElementById('password-reset-error');
    errorDiv.innerText = '';
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/password-update.html'
      });
      if (error) {
        errorDiv.innerText = error.message;
      } else {
        alert('Password reset link sent to your email.');
        window.location.href = 'login.html';
      }
    } catch {
      errorDiv.innerText = "Unexpected error. Please try again.";
    }
  });
});
