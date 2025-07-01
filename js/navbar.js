// Responsive worldclass-navbar logic
let prevScroll = window.scrollY;
let navbar = null;
document.addEventListener("DOMContentLoaded", function() {
  navbar = document.getElementById('mainNavbar');
  // Dropdown/account logic
  const userBtn = document.getElementById('navbarUserBtn');
  const dropdown = document.getElementById('navbarDropdown');
  if(userBtn && dropdown) {
    userBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target) && e.target !== userBtn) {
        dropdown.style.display = 'none';
      }
    });
  }
  // User avatar & username
  if(typeof supabase !== 'undefined' && supabase.auth) {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if(user) {
        document.getElementById('dropdownUsername').textContent =
          user.user_metadata?.username ? '@'+user.user_metadata.username : '@user';
        document.querySelectorAll('.navbar-avatar-img, .dropdown-avatar').forEach(img=>{
          if(user.user_metadata?.avatar_url) img.src = user.user_metadata.avatar_url;
        });
      }
    });
  }
  // Logout
  const logoutBtn = document.getElementById('navbarLogoutBtn');
  if (logoutBtn && typeof supabase !== 'undefined') {
    logoutBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = 'login.html';
    });
  }
  // Notification dot utility
  window.showNavbarNotifDot = function(show) {
    document.getElementById('navbarNotifDot').style.display = show ? 'block' : 'none';
  };
});
window.addEventListener("scroll", function() {
  if(!navbar) return;
  let currScroll = window.scrollY;
  if(currScroll > prevScroll && currScroll > 10) {
    navbar.classList.add("navbar-hide");
  } else {
    navbar.classList.remove("navbar-hide");
  }
  prevScroll = currScroll;
});
