// Navbar dropdown logic
document.addEventListener("DOMContentLoaded", function () {
  const avatarBtn = document.getElementById('navbarUserBtn');
  const dropdown = document.getElementById('navbarDropdown');
  const logoutBtn = document.getElementById('navbarLogoutBtn');

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function () {
      dropdown.style.display = 'none';
    });

    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Add your logout logic here, e.g. Supabase signOut
      if (window.supabase) {
        window.supabase.auth.signOut().then(() => {
          window.location.href = 'login.html';
        });
      } else {
        window.location.href = 'login.html';
      }
    });
  }
});
