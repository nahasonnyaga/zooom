// Utility to get current user and protect pages
window.getCurrentUser = async function() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
window.protectPage = async function(redirectTo = 'login.html') {
  const user = await window.getCurrentUser();
  if (!user) window.location.href = redirectTo;
  return user;
}
