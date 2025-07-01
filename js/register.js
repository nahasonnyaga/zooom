document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
  if (error) document.getElementById('register-error').innerText = error.message;
  else window.location.href = 'index.html';
});
