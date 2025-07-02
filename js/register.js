// js/register.js - Handles registration logic for Zooom

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.onsubmit = async function (e) {
    e.preventDefault();
    const email = form.elements["email"].value.trim();
    const password = form.elements["password"].value;
    const username = form.elements["username"].value.trim();

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Registering...";

    try {
      // First, register user
      const { data, error } = await window.supabase.auth.signUp({ email, password });
      if (error) {
        document.getElementById("register-error").textContent = error.message;
        btn.disabled = false;
        btn.textContent = "Register";
        return;
      }
      // After registration, insert into profiles table
      if (data.user) {
        await window.supabase.from("profiles").insert({
          id: data.user.id,
          username: username,
          avatar_url: "",
          bio: ""
        });
        window.location.href = "index.html";
      } else {
        document.getElementById("register-error").textContent = "Registration failed.";
        btn.disabled = false;
        btn.textContent = "Register";
      }
    } catch (err) {
      document.getElementById("register-error").textContent = "Error: " + err.message;
      btn.disabled = false;
      btn.textContent = "Register";
    }
  };
});
