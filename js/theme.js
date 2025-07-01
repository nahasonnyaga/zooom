// Theme toggling: white (light) is default
(function() {
  const root = document.body;
  const btn = document.getElementById('theme-toggle-btn');

  // Check saved theme
  const saved = localStorage.getItem('zooom-theme');
  if (saved === 'dark') {
    root.classList.remove('theme-light');
    root.classList.add('theme-dark');
    setBtnIcon('sun');
  } else {
    root.classList.remove('theme-dark');
    root.classList.add('theme-light');
    setBtnIcon('moon');
  }

  if (btn) {
    btn.onclick = function() {
      const isLight = root.classList.contains('theme-light');
      if (isLight) {
        root.classList.remove('theme-light');
        root.classList.add('theme-dark');
        localStorage.setItem('zooom-theme', 'dark');
        setBtnIcon('sun');
      } else {
        root.classList.remove('theme-dark');
        root.classList.add('theme-light');
        localStorage.setItem('zooom-theme', 'light');
        setBtnIcon('moon');
      }
      lucide.createIcons();
    };
  }

  function setBtnIcon(icon) {
    btn.innerHTML = `<i data-lucide="${icon}"></i>`;
    lucide.createIcons();
  }
})();
