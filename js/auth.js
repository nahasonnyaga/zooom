// js/auth.js

// Import Supabase client (assumes js/supabase.js sets window.supabase)
if (typeof supabase === "undefined") {
  console.error("Supabase client not found. Make sure js/supabase.js is loaded before auth.js.");
}

// Utility: Show a loading spinner or disable the form while logging in (optional, not styled here)
function setLoading(isLoading) {
  const btn = document.querySelector('#login-form button[type="submit"]');
  if (btn) btn.disabled = !!isLoading;
}

// Utility: Clear error message
function clearError() {
  const err = document.getElementById('error-msg');
  if (err) err.textContent = '';
}

// Sign in with Supabase Auth
async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase client not loaded.');
  const { error, user, data } = await supabase.auth.signInWithPassword({ email, password });
  return { error, user, data };
}

// Optionally, auto-redirect if already logged in
document.addEventListener('DOMContentLoaded', async () => {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = 'index.html';
  }
});

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  clearError();
  setLoading(true);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    document.getElementById('error-msg').textContent = 'Please enter both email and password.';
    setLoading(false);
    return;
  }

  try {
    const { error } = await signIn(email, password);
    if (error) {
      document.getElementById('error-msg').textContent =
        error.message || 'Login failed. Please check your credentials.';
      setLoading(false);
      return;
    }
    // Optionally show a brief message or spinner here
    window.location.href = 'index.html';
  } catch (err) {
    document.getElementById('error-msg').textContent = err.message || 'Unexpected error.';
    setLoading(false);
  }
};
