// js/password-update.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('password-update-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const errorDiv = document.getElementById('password-update-error');
    errorDiv.innerText = '';
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        errorDiv.innerText = error.message;
      } else {
        alert('Password updated successfully!');
        window.location.href = 'profile.html';
      }
    } catch {
      errorDiv.innerText = "Unexpected error. Please try again.";
    }
  });
});
