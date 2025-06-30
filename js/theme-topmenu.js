// Theme toggle logic (black, grey, white) + horizontal scroll active state
(function() {
  // 1. Theme toggle logic
  const themes = ["light", "dark", "grey"];
  function setTheme(theme) {
    document.body.classList.remove("light", "dark", "grey");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
    // Change theme icon
    const btn = document.getElementById("themeToggle");
    if(btn) {
      btn.innerHTML =
        theme === "dark" ? '<i class="fa-solid fa-moon"></i>' :
        theme === "grey" ? '<i class="fa-solid fa-circle-half-stroke"></i>' :
        '<i class="fa-solid fa-sun"></i>';
    }
  }
  function nextTheme() {
    const curr = document.body.classList.contains("dark") ? "dark"
      : document.body.classList.contains("grey") ? "grey"
      : "light";
    const idx = themes.indexOf(curr);
    setTheme(themes[(idx+1)%themes.length]);
  }
  document.addEventListener("DOMContentLoaded", function() {
    // Initial load
    let theme = localStorage.getItem("theme") || "light";
    setTheme(theme);
    const btn = document.getElementById("themeToggle");
    if(btn) btn.onclick = nextTheme;
  });

  // 2. Horizontal menu "active" state on scroll/click
  document.addEventListener("DOMContentLoaded", function() {
    const menu = document.getElementById("topMenuScroll");
    if(menu) {
      menu.addEventListener("click", function(e) {
        if(e.target.closest(".topmenu-link")) {
          menu.querySelectorAll('.topmenu-link').forEach(a=>a.classList.remove('active'));
          e.target.closest(".topmenu-link").classList.add("active");
        }
      });
    }
  });
})();
