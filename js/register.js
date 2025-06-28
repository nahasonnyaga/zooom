// After successful signup:
const bio = document.getElementById('bio').value;
const avatarFile = document.getElementById('avatar').files[0];
if (avatarFile) {
  const { data, error } = await supabase.storage.from('avatars').upload(`public/${user.id}`, avatarFile);
  // Save data.path as avatar_url
}
await supabase.from('profiles').insert([{ id: user.id, bio, avatar_url }]);
