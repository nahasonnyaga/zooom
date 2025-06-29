// ==============================
// Media Preview and Validation
// ==============================
document.addEventListener('DOMContentLoaded', function() {
  const mediaInput = document.getElementById('media');
  const preview = document.getElementById('media-preview');
  const errorDiv = document.getElementById('post-error');

  if (mediaInput) {
    mediaInput.addEventListener('change', function() {
      if (!preview) return;
      preview.innerHTML = '';
      errorDiv.textContent = '';

      let files = Array.from(mediaInput.files);
      if (files.length > 3) {
        errorDiv.textContent = 'You can only upload up to 3 files.';
        mediaInput.value = '';
        return;
      }
      for (const file of files) {
        if (!file.type.match(/^image\/|^video\//)) {
          errorDiv.textContent = 'Only image and video files are allowed.';
          mediaInput.value = '';
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          errorDiv.textContent = 'Each file must be 10MB or less.';
          mediaInput.value = '';
          return;
        }
      }

      files.forEach((file, i) => {
        let url = URL.createObjectURL(file);
        let mediaElem;
        if (file.type.startsWith('image/')) {
          mediaElem = document.createElement('img');
          mediaElem.src = url;
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
        // Add remove button for each preview
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'x';
        removeBtn.style.display = 'block';
        removeBtn.style.margin = '4px auto 0 auto';
        removeBtn.onclick = () => {
          // Remove the file from input and re-render previews
          let dt = new DataTransfer();
          files.splice(i, 1);
          files.forEach(f => dt.items.add(f));
          mediaInput.files = dt.files;
          mediaInput.dispatchEvent(new Event('change'));
        };

        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.marginRight = '8px';
        container.style.marginBottom = '8px';
        container.appendChild(mediaElem);
        container.appendChild(removeBtn);

        preview.appendChild(container);
      });
    });
  }
});

// ==============================
// Form Submission with Validation
// ==============================
document.getElementById('post-form').onsubmit = async (e) => {
  e.preventDefault();
  const content = document.getElementById('content').value;
  const mediaInput = document.getElementById('media');
  const errorDiv = document.getElementById('post-error');
  errorDiv.textContent = '';

  let files = Array.from(mediaInput.files);

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

  // Example: Upload logic (Supabase or your backend)
  // let mediaUrls = [];
  // for (const file of files) {
  //   const { data, error } = await supabase.storage
  //     .from('YOUR_BUCKET_NAME')
  //     .upload('media/' + Date.now() + '-' + file.name, file);
  //   if (error) {
  //     errorDiv.textContent = 'Upload failed: ' + error.message;
  //     return;
  //   }
  //   mediaUrls.push(data.path); // Or use a public URL as needed
  // }

  // After successful upload, save the thread (adjust to your backend logic)
  // const { data, error } = await supabase
  //   .from('threads')
  //   .insert([{ content, media: mediaUrls }]);
  // if (error) {
  //   errorDiv.textContent = 'Failed to post: ' + error.message;
  //   return;
  // }

  // If successful:
  window.location.href = 'index.html';
};
