// Ensure the user is logged in
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Supabase to be loaded
  if (typeof supabase === 'undefined') return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Populate email
  document.getElementById('email').value = user.email;
  // Optional: If you have a profile table for display name:
  // Fetch and populate display name
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();
  if (!profileError && profile && profile.display_name) {
    document.getElementById('display-name').value = profile.display_name;
  }

  // Handle form submit
  document.getElementById('settings-form').onsubmit = async function(e) {
    e.preventDefault();
    const displayName = document.getElementById('display-name').value.trim();
    const newPassword = document.getElementById('password').value;
    const msgDiv = document.getElementById('settings-msg');
    msgDiv.textContent = '';
    let updates = [];
    // Update display name if changed (optional, needs profiles table)
    if (displayName) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);
      if (updateError) {
        msgDiv.textContent = "Error updating display name: " + updateError.message;
        return;
      } else {
        updates.push('Display name updated.');
      }
    }
    // Update password if provided
    if (newPassword) {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) {
        msgDiv.textContent = "Error updating password: " + pwError.message;
        return;
      } else {
        updates.push('Password updated.');
      }
    }
    if (updates.length) {
      msgDiv.textContent = updates.join(' ');
      document.getElementById('password').value = '';
    } else {
      msgDiv.textContent = 'No changes made.';
    }
  }
});
