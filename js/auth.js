// js/auth.js
document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await signIn(email, password);
  if (error) {
    document.getElementById('error-msg').textContent = error.message;
    return;
  }
  window.location.href = 'index.html';
};
