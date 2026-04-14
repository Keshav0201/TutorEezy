import { getTeachers, checkLogin } from "./api.js";

const container = document.getElementById("teacherContainer");
const searchInput = document.querySelector(".search-bar input");
const authBtn = document.getElementById("authBtn");
const dashGoTO = document.getElementById("go-to-dashboard");

/* ================= FETCH TEACHERS ================= */
async function loadTeachers(search = "") {
  try {
    const data = await getTeachers(search);
    renderTeachers(data.teachers || []);
  } catch (err) {
    console.error("Error loading teachers:", err);
    container.innerHTML = "No available teachers";
  }
}

/* ================= AUTH BUTTON ================= */
async function setupAuthButton() {
  const isLoggedIn = await checkLogin();

  if (isLoggedIn) {
    authBtn.innerText = "Logout";
    dashGoTO.classList.remove("hidden");

    authBtn.onclick = () => {
      localStorage.removeItem("token");
      window.location.reload();
    };
  } else {
    authBtn.innerText = "Login";
    dashGoTO.classList.add("hidden");

    authBtn.onclick = () => {
      window.location.href = "auth.html";
    };
  }
}

/* ================= RENDER TEACHERS ================= */
function renderTeachers(teachers) {
  container.innerHTML = "";

  if (!teachers.length) {
    container.innerHTML = "<p>No teachers found</p>";
    return;
  }

  teachers.forEach((t) => {
    const card = document.createElement("div");
    card.className = "teacher-card";

    card.innerHTML = `
      <h3>${t.name}</h3>
      <p>${t.subjects.join(", ")}</p>
      <p>⭐ ${t.rating}</p>
      <p>₹${t.hourly_rate}/hr</p>
    `;

    // 🔥 Navigate to teacher page
    card.addEventListener("click", () => {
      window.location.href = `teacher.html?id=${t.id}`;
    });

    container.appendChild(card);
  });
}

searchInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){
    loadTeachers(searchInput.value);
  }
});

/* ================= NAVIGATION ================= */
document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "index.html";
});

document
  .getElementById("browse-teachers-button")
  .addEventListener("click", () => {
    window.location.href = "index.html#teachers";
  });

/* ================= INIT ================= */
loadTeachers();
setupAuthButton();