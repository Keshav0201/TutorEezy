
import { signup as signupAPI, login as loginAPI } from "./api.js";

async function signup() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const name = document.getElementById("signup-name").value;

  if (!email || !password || !name) return;

  const button = document.getElementById("signup-button");
  button.innerText = "Signing Up...";
  button.disabled = true;

  try {
    const data = await signupAPI({ name, email, password });

    const token = data.result.token;
    localStorage.setItem("token", token);

    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err.message);
    alert(err.message); // replace with UI later
  } finally {
    button.innerText = "Sign Up";
    button.disabled = false;
  }
}

async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) return;

  const button = document.getElementById("login-button");
  button.innerText = "Logging In...";
  button.disabled = true;

  try {
    const data = await loginAPI({ email, password });

    const token = data.user.token; 
    localStorage.setItem("token", token);

    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  } finally {
    button.innerText = "Login";
    button.disabled = false;
  }
}

function checkLogin() {
  if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
  }
}

document
  .getElementById("login-password")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("login-button").click(); // ✅ fixed id
    }
  });

document
  .getElementById("signup-password")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("signup-button").click(); // ✅ fixed id
    }
  });


checkLogin();

// expose functions to HTML
window.signup = signup;
window.login = login;