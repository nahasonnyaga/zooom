// js/post.js - Modern, interconnected, compatible with Zooom

async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

// Handle image preview
const mediaInput = document.getElementById('post-media');
const mediaPreview = document.getElementById('media-preview');
let uploadedMediaUrl = null;
mediaInput?.addEventListener('change', async function() {
  const file = mediaInput.files[0];
  if (!file) {
    mediaPreview.style.display = 'none';
    uploadedMediaUrl = null;
    return;
  }
  // Show preview
  const reader = new FileReader();
  reader.onload = e => {
    mediaPreview.src = e.target.result;
    mediaPreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// Handle post submission
document.getElementById('post-form').onsubmit = async function(e) {
  e.preventDefault();
  const user = await getSessionUser();
  if (!user) {
    window.location.href = "auth.html?tab=login";
    return;
  }
  const content = document.getElementById('post-content').value.trim();
  const topic = document.getElementById('post-topic').value.trim();
  const file = mediaInput.files[0];
  const errorDiv = document.getElementById('post-error');
  const submitBtn = document.getElementById('submit-btn');
  errorDiv.textContent = '';
  submitBtn.disabled = true;

  let mediaUrl = null;
  if (file) {
    // Upload to Supabase storage bucket "media"
    const fileExt = file.name.split('.').pop();
    const filePath = `posts/${user.id}-${Date.now()}.${fileExt}`;
    let { data, error } = await supabase.storage.from('media').upload(filePath, file, { upsert: true });
    if (error) {
      errorDiv.textContent = 'Failed to upload media.';
      submitBtn.disabled = false;
      return;
    }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
    mediaUrl = urlData.publicUrl;
  }

  // Insert post
  let { error } = await supabase.from('posts').insert([{
    user_id: user.id,
    body: content,
    topic: topic,
    media_url: mediaUrl
  }]);
  if (error) {
    errorDiv.textContent = 'Failed to post. Please try again.';
    submitBtn.disabled = false;
    return;
  }
  window.location.href = "index.html";
};
