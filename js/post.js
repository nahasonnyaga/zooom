// js/post.js - Enforces login before posting, handles media, and observes UX best practices

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('post-form');
  const loginBanner = document.getElementById('login-required');
  const errorDiv = document.getElementById('post-error');
  const mediaInput = document.getElementById('post-media');
  const mediaPreview = document.getElementById('media-preview');
  let mediaFile = null;

  // Check login state and update UI/UX accordingly
  async function checkLogin() {
    const { data } = await window.supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      form.setAttribute('aria-disabled', "true");
      form.style.display = "none";
      loginBanner.style.display = "flex";
      return false;
    } else {
      form.setAttribute('aria-disabled', "false");
      form.style.display = "flex";
      loginBanner.style.display = "none";
      return user;
    }
  }

  // Initial check and on every navigation (SPA-friendly)
  let currentUser = await checkLogin();

  // Re-check login on focus (handles auth tab switching)
  window.addEventListener('focus', async () => {
    currentUser = await checkLogin();
  });

  // Media preview UX
  mediaInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      mediaFile = file;
      const reader = new FileReader();
      reader.onload = ev => {
        mediaPreview.src = ev.target.result;
        mediaPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      mediaFile = null;
      mediaPreview.style.display = "none";
    }
  });

  // Prevent form submit if not logged in
  form.onsubmit = async function(e) {
    e.preventDefault();
    errorDiv.textContent = "";
    const { data } = await window.supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      await checkLogin();
      return;
    }

    // UX: Disable submit to prevent double-posting
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;

    const content = document.getElementById('post-content').value.trim();
    const topic = document.getElementById('post-topic').value;
    let media_url = null;

    // Validate content
    if (!content) {
      errorDiv.textContent = "Post content can't be empty.";
      submitBtn.disabled = false;
      return;
    }

    // Optional: handle media upload
    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { data: storageData, error: storageErr } = await window.supabase
        .storage
        .from('media')
        .upload(fileName, mediaFile, { upsert: false });
      if (storageErr) {
        errorDiv.textContent = "Failed to upload image: " + storageErr.message;
        submitBtn.disabled = false;
        return;
      }
      const { data: publicUrl } = window.supabase
        .storage
        .from('media')
        .getPublicUrl(fileName);
      media_url = publicUrl.publicUrl;
    }

    // Insert post (Supabase)
    const { error } = await window.supabase.from('posts').insert([{
      user_id: user.id,
      body: content,
      topic: topic || null,
      media_url: media_url
    }]);
    if (error) {
      errorDiv.textContent = error.message;
      submitBtn.disabled = false;
    } else {
      window.location.href = "feed.html";
    }
  };
});
