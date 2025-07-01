document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const username = document.getElementById('register-username').value;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (!error) {
    // Insert profile row
    await supabase.from('profiles').insert([{ id: data.user.id, username }]);
    window.location.href = 'index.html';
  } else {
    document.getElementById('register-error').textContent = error.message;
  }
};
