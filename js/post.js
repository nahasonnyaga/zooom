// js/post.js

// Make sure supabase and supabaseApi are loaded globally
// Assumes js/supabase.js exposes window.supabaseApi.createThread and window.supabaseApi.supabase

// Handle form submission for posting a new thread,
// including uploading images/videos to Supabase Storage if needed
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('post-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const content = document.getElementById('content').value.trim();
    const images = document.getElementById('images').files;
    const videos = document.getElementById('videos').files;
    const postError = document.getElementById('post-error');
    postError.textContent = '';

    // Simple validation
    if (!content) {
      postError.textContent = 'Content is required.';
      return;
    }
    if (images.length > 4) {
      postError.textContent = 'You can upload up to 4 images.';
      return;
    }
    if (videos.length > 2) {
      postError.textContent = 'You can upload up to 2 videos.';
      return;
    }

    // Get current user and check authentication
    let userObj;
    try {
      const { data: { user }, error: userError } = await window.supabaseApi.supabase.auth.getUser();
      if (userError) {
        postError.textContent = 'Failed to verify authentication: ' + userError.message;
        return;
      }
      if (!user) {
        postError.textContent = "You must be logged in to post.";
        return;
      }
      userObj = user;
    } catch (err) {
      postError.textContent = "Authentication check failed: " + (err.message || err);
      return;
    }

    // Upload images/videos to Supabase Storage (if any)
    let imageUrls = [];
    let videoUrls = [];
    const storage = window.supabaseApi.supabase.storage;
    const bucket = 'thread-media'; // Make sure this bucket exists in Supabase Storage

    // Helper for uploading a file
    async function uploadFile(file, typeFolder) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${typeFolder}/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
      let { data, error } = await storage.from(bucket).upload(filePath, file, { upsert: false });
      if (error) return { error };
      // Get public URL
      let { data: pub, error: urlError } = storage.from(bucket).getPublicUrl(filePath);
      if (urlError) return { error: urlError };
      return { url: pub && pub.publicUrl };
    }

    // Upload images
    for (let img of images) {
      let { url, error } = await uploadFile(img, 'images');
      if (error) {
        postError.textContent = 'Error uploading image: ' + (error.message || error.error_description || error);
        return;
      }
      imageUrls.push(url);
    }
    // Upload videos
    for (let vid of videos) {
      let { url, error } = await uploadFile(vid, 'videos');
      if (error) {
        postError.textContent = 'Error uploading video: ' + (error.message || error.error_description || error);
        return;
      }
      videoUrls.push(url);
    }

    // Create thread with media URLs, including user_id
    const { data, error } = await window.supabaseApi.supabase
      .from('threads')
      .insert([{
        content,
        image_urls: imageUrls,
        video_urls: videoUrls,
        created_at: new Date().toISOString(),
        user_id: userObj.id // Add this if your schema requires it
      }]);

    if (error) {
      postError.textContent = 'Failed to post thread: ' + (error.message || error.error_description || error);
      return;
    }

    // Optional: Show notification
    if (window.showNotification) window.showNotification('Thread posted!');

    // Reset form and preview
    form.reset();
    document.getElementById('media-preview').innerHTML = '';
    postError.textContent = '';
    // Optionally reload thread feed
    if (typeof loadThreads === "function") loadThreads();
  });
});
