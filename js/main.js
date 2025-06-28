// js/main.js

// Loads navbar.html into #navbar
async function loadNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const resp = await fetch('components/navbar.html');
  navbar.innerHTML = await resp.text();
}
document.addEventListener('DOMContentLoaded', loadNavbar);
