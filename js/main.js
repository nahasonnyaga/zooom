// js/main.js

// Loads navbar.html into #navbar
async function loadNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  try {
    const resp = await fetch('components/navbar.html');
    if (!resp.ok) throw new Error('Failed to load navbar');
    navbar.innerHTML = await resp.text();
  } catch (e) {
    navbar.innerHTML = `<div style="color:#d00;">Navbar failed to load.</div>`;
    console.error(e);
  }
}

// Generic loader for other HTML components into target elements by selector
async function loadComponent(componentPath, targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  try {
    const resp = await fetch(componentPath);
    if (!resp.ok) throw new Error(`Failed to load ${componentPath}`);
    target.innerHTML = await resp.text();
  } catch (e) {
    target.innerHTML = `<div style="color:#d00;">Failed to load component.</div>`;
    console.error(e);
  }
}

// Utility: Show notification (requires a <div id="notification"></div> in HTML)
async function showNotification(msg, duration = 3000) {
  let notif = document.getElementById('notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    notif.style.position = 'fixed';
    notif.style.top = '1rem';
    notif.style.right = '1rem';
    notif.style.zIndex = '9999';
    notif.style.background = '#222';
    notif.style.color = '#fff';
    notif.style.padding = '0.6rem 1.2rem';
    notif.style.borderRadius = '6px';
    notif.style.boxShadow = '0 2px 10px #0005';
    document.body.appendChild(notif);
  }
  notif.textContent = msg;
  notif.style.display = 'block';
  setTimeout(() => { notif.style.display = 'none'; }, duration);
}

// Example: Load navbar on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadNavbar);

// Auto-highlight current nav link based on page
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  // Wait for navbar to load
  const highlightActive = () => {
    const links = nav.querySelectorAll('a[href]');
    const here = location.pathname.split('/').pop();
    links.forEach(link => {
      if (link.getAttribute('href') === here) {
        link.style.fontWeight = 'bold';
        link.style.textDecoration = 'underline';
      } else {
        link.style.fontWeight = '';
        link.style.textDecoration = '';
      }
    });
  };
  // MutationObserver for late navbar load
  const obs = new MutationObserver(highlightActive);
  obs.observe(nav, { childList: true, subtree: true });
  highlightActive();
});
