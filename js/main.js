document.addEventListener('DOMContentLoaded', async () => {
  // Redirect to login if not authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && !window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
    window.location.href = 'login.html';
  }
});
