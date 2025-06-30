// js/navbar.js
// Worldclass Navbar: Avatar, Username, Dropdown, Logout, Notification Dot
document.addEventListener('DOMContentLoaded', async () => {
  const navbarUserBtn = document.getElementById('navbarUserBtn');
  const navbarDropdown = document.getElementById('navbarDropdown');
  const navbarLogoutBtn = document.getElementById('navbarLogoutBtn');
  const dropdownUsername = document.getElementById('dropdownUsername');
  const avatarImgs = document.querySelectorAll('.navbar-avatar-img, .dropdown-avatar');
  // Dropdown menu logic
  if (navbarUserBtn && navbarDropdown) {
    navbarUserBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = navbarUserBtn.getAttribute('aria-expanded') === 'true';
      navbarDropdown.style.display = expanded ? 'none' : 'block';
      navbarUserBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    document.addEventListener('click', function(e) {
      if (!navbarDropdown.contains(e.target) && e.target !== navbarUserBtn) {
        navbarDropdown.style.display = 'none';
        navbarUserBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
  // User info: avatar and username
  if (typeof supabase !== 'undefined' && supabase.auth) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (dropdownUsername) {
        dropdownUsername.textContent =
          user.user_metadata?.username
            ? '@' + user.user_metadata.username
            : (user.email ? '@' + user.email.split('@')[0] : '@user');
      }
      avatarImgs.forEach(img => {
        if (user.user_metadata && user.user_metadata.avatar_url)
          img.src = user.user_metadata.avatar_url;
      });
    }
  }
  // Logout
  if (navbarLogoutBtn) {
    navbarLogoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      if (typeof supabase !== 'undefined' && supabase.auth) {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
      }
    });
  }
  // Notification dot (window.showNavbarNotifDot(true/false))
  window.showNavbarNotifDot = function(show) {
    const navbarNotifDot = document.getElementById('navbarNotifDot');
    if (navbarNotifDot) {
      navbarNotifDot.style.display = show ? 'block' : 'none';
    }
  };
});
