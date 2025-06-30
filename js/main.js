// js/main.js
// Common utilities, session check, etc.
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  window.currentUser = user;
});
