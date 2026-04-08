
import { signup as signupAPI, login as loginAPI , checkLogin } from "./api.js";
const passwordInput = document.getElementById("signup-password");
const confirmInput = document.getElementById("confirm-password");
const matchMsg = document.getElementById("match-msg");

let passwordValid = false;

// RULE CHECK FUNCTION
function validatePassword(password) {
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  updateRule("rule-length", rules.length);
  updateRule("rule-upper", rules.upper);
  updateRule("rule-lower", rules.lower);
  updateRule("rule-number", rules.number);
  updateRule("rule-special", rules.special);

  passwordValid = Object.values(rules).every(Boolean);
}

// UPDATE UI
function updateRule(id, isValid) {
  const el = document.getElementById(id);

  if (isValid) {
    el.classList.add("valid");
    el.classList.remove("invalid");
    el.innerText = "✅ " + el.innerText.slice(2);
  } else {
    el.classList.add("invalid");
    el.classList.remove("valid");
    el.innerText = "❌ " + el.innerText.slice(2);
  }
}

// PASSWORD INPUT LISTENER
passwordInput.addEventListener("input", () => {
  validatePassword(passwordInput.value);
  checkMatch();
});

// CONFIRM PASSWORD MATCH
confirmInput.addEventListener("input", checkMatch);

function checkMatch() {
  if (!confirmInput.value) {
    matchMsg.innerText = "";
    return;
  }

  if (passwordInput.value === confirmInput.value) {
    matchMsg.innerText = "✅ Passwords match";
    matchMsg.style.color = "green";
  } else {
    matchMsg.innerText = "❌ Passwords do not match";
    matchMsg.style.color = "red";
  }
}

async function signup() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("confirm-password").value;
  const name = document.getElementById("signup-name").value;

  if (!email || !password || !name) {
    alert("Fill all fields");
    return;
  }

  if (!passwordValid) {
    alert("Password does not meet requirements");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

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
    alert(err.message);
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

async function checkIfLogin() {
  if (await checkLogin()) {
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


checkIfLogin();

document
  .getElementById("signup-button")
  .addEventListener("click", signup);

document
  .getElementById("login-button")
  .addEventListener("click", login);