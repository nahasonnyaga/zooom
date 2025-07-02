// js/auth.js - Handles login logic for Zooom

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.onsubmit = async function (e) {
    e.preventDefault();
    const email = form.elements["email"].value.trim();
    const password = form.elements["password"].value;

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      const { error } = await window.supabase.auth.signInWithPassword({ email, password });
      if (error) {
        document.getElementById("login-error").textContent = error.message;
        btn.disabled = false;
        btn.textContent = "Sign In";
        return;
      }
      // Redirect to feed after successful login
      window.location.href = "index.html";
    } catch (err) {
      document.getElementById("login-error").textContent = "Error: " + err.message;
      btn.disabled = false;
      btn.textContent = "Sign In";
    }
  };
});
