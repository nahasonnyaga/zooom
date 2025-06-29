// ==============================
// Media Preview and Validation
// ==============================
// This script enables live preview, validation, and removal for up to 3 image/video files on the post form.
// It is compatible with the existing HTML structure of post.html and displays errors in #post-error.

document.addEventListener('DOMContentLoaded', function() {
  const mediaInput = document.getElementById('media');
  const preview = document.getElementById('media-preview');
  const errorDiv = document.getElementById('post-error');

  if (!mediaInput || !preview || !errorDiv) return;

  // Helper: create the UI for a previewed file
  function createMediaPreview(file, index, files, onRemove) {
    const url = URL.createObjectURL(file);
    let mediaElem;
    if (file.type.startsWith('image/')) {
      mediaElem = document.createElement('img');
      mediaElem.src = url;
      mediaElem.alt = 'Image preview';
      mediaElem.style.width = '80px';
      mediaElem.style.height = '80px';
      mediaElem.style.objectFit = 'cover';
    } else if (file.type.startsWith('video/')) {
      mediaElem = document.createElement('video');
      mediaElem.src = url;
      mediaElem.controls = true;
      mediaElem.style.width = '80px';
      mediaElem.style.height = '80px';
      mediaElem.style.objectFit = 'cover';
    }
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'x';
    removeBtn.setAttribute('aria-label', 'Remove file');
    removeBtn.style.display = 'block';
    removeBtn.style.margin = '4px auto 0 auto';
    removeBtn.onclick = () => onRemove(index);

    // Container
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.marginRight = '8px';
    container.style.marginBottom = '8px';
    container.appendChild(mediaElem);
    container.appendChild(removeBtn);

    return container;
  }

  // Update preview and allow removal of files
  function renderPreviews(files) {
    preview.innerHTML = '';
    files.forEach((file, i) => {
      const previewElem = createMediaPreview(file, i, files, (removeIdx) => {
        // Remove file and update FileList
        let dt = new DataTransfer();
        files.splice(removeIdx, 1);
        files.forEach(f => dt.items.add(f));
        mediaInput.files = dt.files;
        // Trigger 'change' to rerender previews and revalidate
        mediaInput.dispatchEvent(new Event('change'));
      });
      preview.appendChild(previewElem);
    });
  }

  mediaInput.addEventListener('change', function() {
    errorDiv.textContent = '';
    const files = Array.from(mediaInput.files);

    // Validation: max 3 files
    if (files.length > 3) {
      errorDiv.textContent = 'You can only upload up to 3 files.';
      mediaInput.value = '';
      preview.innerHTML = '';
      return;
    }
    // Validation: file type and size
    for (const file of files) {
      if (!file.type.match(/^image\/|^video\//)) {
        errorDiv.textContent = 'Only image and video files are allowed.';
        mediaInput.value = '';
        preview.innerHTML = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        errorDiv.textContent = 'Each file must be 10MB or less.';
        mediaInput.value = '';
        preview.innerHTML = '';
        return;
      }
    }
    renderPreviews(files);
  });
});

// ==============================
// Form Submission with Validation
// ==============================
document.addEventListener('DOMContentLoaded', function() {
  const postForm = document.getElementById('post-form');
  if (!postForm) return;

  postForm.onsubmit = async (e) => {
    e.preventDefault();
    const content = document.getElementById('content').value.trim();
    const mediaInput = document.getElementById('media');
    const errorDiv = document.getElementById('post-error');
    errorDiv.textContent = '';

    let files = Array.from(mediaInput.files);

    // Front-end validation (duplicated for safety)
    if (files.length > 3) {
      errorDiv.textContent = 'You can only upload up to 3 files.';
      return;
    }
    for (const file of files) {
      if (!file.type.match(/^image\/|^video\//)) {
        errorDiv.textContent = 'Only image and video files are allowed.';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        errorDiv.textContent = 'Each file must be 10MB or less.';
        return;
      }
    }

    // Bonus value: Require some text or at least 1 media file
    if (!content && files.length === 0) {
      errorDiv.textContent = 'Write something or attach a media file to post.';
      return;
    }

    // Example: Supabase or backend upload logic
    // Uncomment and adapt for Supabase:
    /*
    let mediaUrls = [];
    for (const file of files) {
      const { data, error } = await supabase.storage
        .from('YOUR_BUCKET_NAME')
        .upload('media/' + Date.now() + '-' + file.name, file);
      if (error) {
        errorDiv.textContent = 'Upload failed: ' + error.message;
        return;
      }
      mediaUrls.push(data.path); // Or use a public URL as needed
    }

    const { data: thread, error: postError } = await supabase
      .from('threads')
      .insert([{ content, media: mediaUrls }]);
    if (postError) {
      errorDiv.textContent = 'Failed to post: ' + postError.message;
      return;
    }
    */

    // Redirect on success (simulate)
    window.location.href = 'index.html';
  };
});
